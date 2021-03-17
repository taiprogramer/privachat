import { Application } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import { staticFileMiddleware } from "./staticFileMiddleware.ts";
import router from "./router.ts";
import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";

const app = new Application();
const env = config({ safe: true });

app.use(staticFileMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: parseInt(env.PORT) });
