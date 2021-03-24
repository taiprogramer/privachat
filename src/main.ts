import { Application } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { staticFileMiddleware } from "./staticFileMiddleware.ts";
import router from "./router.ts";
import { PORT } from "./config.ts";

const app = new Application();

app.use(staticFileMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: parseInt(PORT) });
