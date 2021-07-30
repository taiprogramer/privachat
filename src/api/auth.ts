import { Router } from "../deps.ts";
import { loginAsPost, newAsPost } from "./function.ts";

const authRouter = new Router();

authRouter.post("/new", newAsPost);
authRouter.post("/login", loginAsPost);

export { authRouter };
