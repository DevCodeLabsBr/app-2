import express from "express";
import { sessionsController } from "./controllers/sessions-controller";

const app = express();
app.use(express.json());

app.post("/sessions", sessionsController.create);
app.get("/sessions/:sessionName/qrcode", sessionsController.qrcode);
app.post("/sessions/:sessionName/messages", sessionsController.message);
app.get("/sessions", sessionsController.findAll);
app.delete("/sessions/:sessionName", sessionsController.remove);

export default app;
