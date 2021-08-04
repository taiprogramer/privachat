import { Rhum, SuperDeno, superoak } from "../test_deps.ts";
import { contactRouter as router } from "./contact.ts";
import { Application, Status } from "../deps.ts";
import {
  INVALID_DATA,
  YOU_ALREADY_KNOW_YOU,
} from "../helpers/message_constants.ts";
import { db, generateUserCredential } from "./datastore.ts";

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

Rhum.testPlan("contact.ts", () => {
  Rhum.testSuite("addAsPost: add new contact", () => {
    let request: SuperDeno;
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase(
      "must fail if request does not contain valid contact info",
      async () => {
        await request.post("/add")
          .set("Content-Type", "application/json")
          .send({ foo: "bar" })
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain json data",
      async () => {
        await request.post("/add")
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
        await request.post("/add")
          .set("Content-Type", "application/json")
          .send({
            uid: userCredential.uid,
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
        await request.post("/add")
          .set("Content-Type", "application/json")
          .send({
            uid: user1.uid,
            friendId: user2.uid,
            nickname: "Foo",
          }).expect(Status.Created);
      },
    );
  });
});

Rhum.run();
