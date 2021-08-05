import { Application, Router } from "./deps.ts";
import { authRouter } from "./api/auth.ts";
import { contactRouter } from "./api/contact.ts";
import { PORT } from "./config.ts";

const app = new Application();

const router = new Router();
router.use("/auth", authRouter.routes());
router.use("/contact", contactRouter.routes());

app.use(router.routes());

app.listen({ port: parseInt(PORT) });
