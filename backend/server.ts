import { env } from "./src/config/env.js";
import { app } from "./src/app.js";

app.listen(env.PORT, () => {
  console.log(`Doc DNA backend listening on port ${env.PORT}`);
});
