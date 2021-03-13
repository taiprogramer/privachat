import { Application } from "https://deno.land/x/oak/mod.ts";
import { staticFileMiddleware } from "./staticFileMiddleware.ts";
import router from "./router.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

const app = new Application();
const env = config({ safe: true });

app.use(staticFileMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: parseInt(env.PORT) });
