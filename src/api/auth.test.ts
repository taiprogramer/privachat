import { authRouter as router } from "./auth.ts";
import { Rhum, SuperDeno, superoak } from "../test_deps.ts";
import { Application, Status } from "../deps.ts";
import { INVALID_DATA, USER_CREATED } from "../helpers/message_constants.ts";

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

Rhum.testPlan("auth.test.ts", () => {
  Rhum.testSuite("newAsPost(): create new account", () => {
    let request: SuperDeno;
    Rhum.beforeEach(async () => {
      request = await superoak(app);
    });
    Rhum.testCase("request with all valid data", async () => {
      const data = {
        uid: "16F78A7D6317F102BBD95FC9A4F3FF2E3249287690B8BDAD6B7810F82B34ACE3",
        pass: "B109F3BBBC244EB82441917ED06D618B9008DD09B3BEFD1B5E07394C706A8BB\
980B1D7785E5976EC049B46DF5F1326AF5A2EA6D103FD07C95385FFAB0CACBC86",
        pubKey: "[not check pub key]",
        priKey: "[not check pri key]",
      };

      await request.post("/new")
        .set("Content-Type", "application/json")
        .send(data)
        .expect(Status.Created)
        .expect({
          success: true,
          data: {
            msg: USER_CREATED,
          },
        });
    });

    Rhum.testCase("request with invalid data", async () => {
      const data = {
        uid: "not sha256 hex",
        pass: "not sha512 hex",
      };
      await request.post("/new")
        .set("Content-Type", "application/json")
        .send(data)
        .expect(Status.BadRequest)
        .expect({
          success: false,
          cause: {
            msg: INVALID_DATA,
          },
        });
    });

    Rhum.testCase("request with not json data", async () => {
      await request.post("/new")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("'hello': 'world'")
        .expect(Status.BadRequest)
        .expect({
          success: false,
          cause: {
            msg: INVALID_DATA,
          },
        });
    });
  });
});

Rhum.run();
