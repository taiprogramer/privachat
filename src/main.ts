import { Application } from "@oak/oak";
import { serveStaticFile } from "./serve_static_file.ts";
import router from "./router.ts";
import { PORT } from "./config.ts";

const app = new Application();

app.use(serveStaticFile);
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: parseInt(PORT) });
