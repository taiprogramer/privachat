import { authRouter as router } from "./auth.ts";
import { Rhum, Stubbed, SuperDeno, superoak } from "../test_deps.ts";
import {
  Application,
  create,
  getNumericDate,
  scrypt as orgScrypt,
  Status,
} from "../deps.ts";
import {
  INCORRECT_USERNAME_OR_PASSWORD,
  INVALID_DATA,
  USER_CREATED,
} from "../helpers/message_constants.ts";
import { User as orgUser } from "../models/database.ts";

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

const userCredential = {
  uid: "16F78A7D6317F102BBD95FC9A4F3FF2E3249287690B8BDAD6B7810F82B34ACE3",
  pass: "B109F3BBBC244EB82441917ED06D618B9008DD09B3BEFD1B5E07394C706A8BB\
980B1D7785E5976EC049B46DF5F1326AF5A2EA6D103FD07C95385FFAB0CACBC86",
};

const wrongUserCredential = {
  uid: "0000000000000000000000000000000000000000000000000000000000000000",
  pass: "000000000000000000000000000000000000000000000000000000000000000\
00000000000000000000000000000000000000000000000000000000000000000",
};

const orgJwt = { create, getNumericDate };
export let User: Stubbed<typeof orgUser>;
export let jwt: Stubbed<typeof orgJwt>;
export let scrypt: Stubbed<typeof orgScrypt>;

Rhum.testPlan("auth.test.ts", () => {
  let request: SuperDeno;
  Rhum.testSuite("newAsPost(): create new account", () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase("request with all valid data", async () => {
      User = Rhum.stubbed(Object.create(orgUser));
      User.stub("findOne", () => undefined); // assume user is not exist
      User.stub("insertOne", () => true); // assume insert success
      scrypt = Rhum.stubbed(Object.create(orgScrypt));
      scrypt.stub("hash", () => "foo");
      await request.post("/new")
        .set("Content-Type", "application/json")
        .send({ ...userCredential, pubKey: "[pub]", priKey: "[pri]" })
        .expect(Status.Created)
        .expect({ success: true, data: { msg: USER_CREATED } });
    });

    Rhum.testCase("request with invalid data", async () => {
      await request.post("/new")
        .set("Content-Type", "application/json")
        .send({ foo: "bar" })
        .expect(Status.BadRequest)
        .expect({ success: false, cause: { msg: INVALID_DATA } });
    });

    Rhum.testCase("request with not json data", async () => {
      await request.post("/new")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("foo=bar")
        .expect(Status.BadRequest)
        .expect({ success: false, cause: { msg: INVALID_DATA } });
    });
  });

  Rhum.testSuite("loginAsPost(): login", () => {
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase("request with valid credential", async () => {
      User = Rhum.stubbed(Object.create(orgUser));
      User.stub("findOne", () => true);
      scrypt = Rhum.stubbed(Object.create(orgScrypt));
      scrypt.stub("verify", () => true);
      jwt = Rhum.stubbed(Object.create(orgJwt));
      jwt.stub("create", () => "[jwt]");
      jwt.stub("getNumericDate", () => "foo");
      await request.post("/login")
        .set("Content-Type", "application/json").send(userCredential)
        .expect(Status.OK)
        .expect({ success: true, data: { accessToken: "[jwt]" } });
    });

    Rhum.testCase("request with wrong credential", async () => {
      User = Rhum.stubbed(Object.create(orgUser));
      User.stub("findOne", () => undefined);
      await request.post("/login")
        .set("Content-Type", "application/json").send(wrongUserCredential)
        .expect(Status.Forbidden)
        .expect({
          success: false,
          cause: { msg: INCORRECT_USERNAME_OR_PASSWORD },
        });
    });

    Rhum.testCase("request with invalid data", async () => {
      await request.post("/login")
        .set("Content-Type", "application/json").send({ foo: "bar" })
        .expect(Status.BadRequest)
        .expect({ success: false, cause: { msg: INVALID_DATA } });
    });

    Rhum.testCase("request with not json data", async () => {
      await request.post("/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("foo=bar")
        .expect(Status.BadRequest)
        .expect({ success: false, cause: { msg: INVALID_DATA } });
    });
  });
});

Rhum.run();
