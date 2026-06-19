import { Router, type Request, type Response } from "express";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { documentsRouter } from "./documents.routes.js";
import { historyRouter } from "./history.routes.js";
import { userRouter } from "./user.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});
apiRouter.use("/auth", authRouter);
apiRouter.use("/documents", documentsRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/history", historyRouter);
apiRouter.use("/user", userRouter);
