import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes.js";
import { coursesRouter } from "./routes/courses.routes.js";
import { progressRouter } from "./routes/progress.routes.js";
import { quizRouter } from "./routes/quiz.routes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/progress", progressRouter);
app.use("/api/quizzes", quizRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
