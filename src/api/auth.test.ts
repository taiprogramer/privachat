import { authRouter as router } from "./auth.ts";
import { assert, Rhum, SuperDeno, superoak } from "../test_deps.ts";
import { Application, Status } from "../deps.ts";
import {
  INCORRECT_USERNAME_OR_PASSWORD,
  INVALID_DATA,
  USER_ALREADY_EXISTS,
  USER_CREATED,
} from "../helpers/message_constants.ts";
import { db, generateUserCredential } from "./datastore.ts";

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

Rhum.testPlan("auth.ts", () => {
  let request: SuperDeno;
  Rhum.testSuite("newAsPost: create new account", () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase(
      "must fail if request does not contain valid data",
      async () => {
        await request.post("/new")
          .set("Content-Type", "application/json")
          .send({ foo: "bar" })
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain json data",
      async () => {
        await request.post("/new")
          .set("Content-Type", "application/x-www-form-urlencoded")
          .send("foo=bar")
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase("must fail if the user already exists", async () => {
      const userCredential = generateUserCredential();
      db.user.insertOne(userCredential);
      await request.post("/new")
        .set("Content-Type", "application/json")
        .send(userCredential)
        .expect(Status.Conflict)
        .expect({ success: false, cause: { msg: USER_ALREADY_EXISTS } });
    });
    Rhum.testCase("must success if request contains valid data", async () => {
      const userCredential = generateUserCredential();
      await request.post("/new")
        .set("Content-Type", "application/json")
        .send(userCredential)
        .expect(Status.Created)
        .expect({ success: true, data: { msg: USER_CREATED } });
    });
  });

  Rhum.testSuite("loginAsPost(): login", () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase(
      "must fail if a user sends the wrong credential",
      async () => {
        const userCredential = await generateUserCredential();
        db.user.insertOne(userCredential);
        const wrongUserCredential = {
          ...userCredential,
          pass: "0".repeat(512 / 4),
        };
        await request.post("/login")
          .set("Content-Type", "application/json").send(wrongUserCredential)
          .expect(Status.Forbidden)
          .expect({
            success: false,
            cause: { msg: INCORRECT_USERNAME_OR_PASSWORD },
          });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain valid data",
      async () => {
        await request.post("/login")
          .set("Content-Type", "application/json").send({ foo: "bar" })
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must fail if request does not contain json data",
      async () => {
        await request.post("/login")
          .set("Content-Type", "application/x-www-form-urlencoded")
          .send("foo=bar")
          .expect(Status.BadRequest)
          .expect({ success: false, cause: { msg: INVALID_DATA } });
      },
    );
    Rhum.testCase(
      "must success if request contains valid credential",
      async () => {
        const userCredential = generateUserCredential();
        db.user.insertOne(userCredential);
        await request.post("/login")
          .set("Content-Type", "application/json").send(userCredential)
          .expect(Status.OK)
          .expect(({ body }) => {
            assert(body.success === true, "success field must be true");
            assert(
              "accessToken" in body.data,
              "must have accessToken field in data",
            );
          });
      },
    );
  });
});

Rhum.run();
