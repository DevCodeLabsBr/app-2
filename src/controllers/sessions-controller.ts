import assert from "node:assert";
import fs from "node:fs/promises";
import * as venom from "venom-bot";
import { Request, Response } from "express";
import Session from "../entities/session";
import { sessionsRepository } from "../repositories/sessions-repository";
import { whatsappRepository } from "../repositories/whatsapp-repository";

export class SessionsController {
  async findAll(_: Request, response: Response) {
    try {
      const sessions = await sessionsRepository.findAll();
      response.json(sessions.map((session) => session.toDto()));
    } catch (error) {
      response.status(500);
      response.json({ message: String(error) });
    }
  }

  async create(request: Request, response: Response) {
    try {
      const { name } = request.body;
      const exists = await sessionsRepository.check(name);

      if (exists) {
        response.status(400);
        response.json({ message: "already exists session with this name" });
        return;
      }

      const session = new Session({ name });
      await sessionsRepository.create(session);

      const promise = venom.create({
        session: name,
        multidevice: true,
        disableSpins: true,
        disableWelcome: true,
        catchQR: async (qrcode) => {
          session.qrcode = qrcode;
          await sessionsRepository.update(session);
        },
      });

      promise.then((wa) => whatsappRepository.create(wa));

      promise.catch(async (error) => {
        await sessionsRepository.remove(session);
        console.error(error);
      });

      response.json(session.toDto());
    } catch (error) {
      response.status(500);
      response.json({ message: String(error) });
    }
  }

  async remove(request: Request, response: Response) {
    try {
      const { sessionName } = request.params as { sessionName: string };

      const session = await sessionsRepository.findOne(sessionName);

      if (!session) {
        response.status(400);
        response.json({ message: "session not found" });
        return;
      }

      const whatsapp = await whatsappRepository.findOne(session.name);

      if (whatsapp) {
        await whatsapp.logout();
        await whatsapp.close();
        await fs.rm(`tokens/${session.name}`, { recursive: true, force: true });
        await whatsappRepository.remove(whatsapp);
      }

      await sessionsRepository.remove(session);

      response.end();
    } catch (error) {
      response.status(500);
      response.json({ message: String(error) });
    }
  }

  async qrcode(request: Request, response: Response) {
    try {
      const { sessionName } = request.params as { sessionName: string };

      const session = await sessionsRepository.findOne(sessionName);

      if (!session) {
        response.status(400);
        response.json({ message: "session not found" });
        return;
      }

      if (!session.qrcode) {
        response.status(400);
        response.json({ message: "venon has not been retrieved qrcode yet" });
        return;
      }

      const result = session.qrcode.match(/data:(.*);base64,(.*)/);
      assert(result);

      const [, contentType, body] = result;
      assert(contentType);
      assert(body);

      response.set("content-type", contentType);
      response.send(Buffer.from(body, "base64"));
    } catch (error) {
      response.status(500);
      response.json({ message: String(error) });
    }
  }

  async message(request: Request, response: Response) {
    try {
      const { sessionName } = request.params as { sessionName: string };
      const { to, content } = request.body as { to: string; content: string };

      const session = await sessionsRepository.findOne(sessionName);

      if (!session) {
        response.status(400);
        response.json({ message: "session not found" });
        return;
      }

      const whatsapp = await whatsappRepository.findOne(session.name);

      if (!whatsapp) {
        response.status(400);
        response.json({ message: "session not logged in" });
        return;
      }

      const result = await whatsapp.sendText(`${to}@c.us`, content);
      response.json(result);
    } catch (error) {
      response.status(500);
      response.json({ message: error.text ?? String(error) });
    }
  }
}

export const sessionsController = new SessionsController();
