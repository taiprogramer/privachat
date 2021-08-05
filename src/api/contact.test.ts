import { assert, Rhum, SuperDeno, superoak } from "../test_deps.ts";
import { contactRouter as router } from "./contact.ts";
import { Application, Status } from "../deps.ts";
import {
  INVALID_DATA,
  INVALID_TOKEN,
  YOU_ALREADY_KNOW_YOU,
} from "../helpers/message_constants.ts";
import { db, generateUserCredential } from "./datastore.ts";
import { createJwt } from "../helpers/jwt.ts";

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

Rhum.testPlan("contact.ts", () => {
  let request: SuperDeno;
  Rhum.testSuite("addAsPost: add new contact", async () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase(
      "must fail if request does not contain valid access token",
      async () => {
        await request.post("/add")
          .set("Authorization", "foo")
          .set("Content-Type", "application/json")
          .send({ foo: "bar" })
          .expect(Status.Unauthorized)
          .expect({ success: false, cause: { msg: INVALID_TOKEN } });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain valid contact info",
      async () => {
        const userCredential = generateUserCredential();
        await db.user.insertOne(userCredential);
        const token = await createJwt(userCredential);

        await request.post("/add")
          .set("Authorization", `Bearer ${token}`)
          .set("Content-Type", "application/json")
          .send({ foo: "bar" })
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain json data",
      async () => {
        const userCredential = generateUserCredential();
        await db.user.insertOne(userCredential);
        const token = await createJwt(userCredential);

        await request.post("/add")
          .set("Authorization", `Bearer ${token}`)
          .set("Content-Type", "application/x-www-form-urlencoded")
          .send("foo=bar")
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must fail if user try to add them to their contact",
      async () => {
        const userCredential = generateUserCredential();
        await db.user.insertOne(userCredential);
        const token = await createJwt(userCredential);

        await request.post("/add")
          .set("Authorization", `Bearer ${token}`)
          .set("Content-Type", "application/json")
          .send({
            friendId: userCredential.uid,
            nickname: "Foo",
          })
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: YOU_ALREADY_KNOW_YOU } });
      },
    );
    Rhum.testCase(
      "must success if request contains valid contact data",
      async () => {
        const user1 = generateUserCredential();
        const user2 = generateUserCredential();
        await db.user.insertOne(user1);
        await db.user.insertOne(user2);
        const token = await createJwt(user1);

        await request.post("/add")
          .set("Authorization", `Bearer ${token}`)
          .set("Content-Type", "application/json")
          .send({
            friendId: user2.uid,
            nickname: "Foo",
          }).expect(Status.Created);
      },
    );
  });

  Rhum.testSuite("listAsGet: list all friends in the friend list", () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase(
      "must fail if request does not contain valid access token",
      async () => {
        await request.get("/list")
          .set("Authorization", "foo")
          .expect(Status.Unauthorized)
          .expect({ success: false, cause: { msg: INVALID_TOKEN } });
      },
    );
    Rhum.testCase(
      "must success if request contains valid access token",
      async () => {
        const user = generateUserCredential();
        await db.user.insertOne(user);
        const token = await createJwt(user);

        await request.get("/list")
          .set("Authorization", `Bearer ${token}`)
          .expect(Status.OK)
          .expect(({ body }) => {
            assert(body.success === true, "success field must be true");
            assert(
              "friends" in body.data,
              "must have friends field in data",
            );
          });
      },
    );
  });
});

Rhum.run();
