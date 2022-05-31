import { randomUUID } from "node:crypto";
import { SessionDto } from "../dtos/session-dto";

export type SessionConstructorParams = {
  id?: string;
  name: string;
  qrcode?: string | null;
};

export default class Session {
  id: string;
  name: string;
  qrcode: string | null;

  constructor(params: SessionConstructorParams) {
    this.id = params.id ?? randomUUID();
    this.name = params.name;
    this.qrcode = params.qrcode ?? null;
  }

  toDto(): SessionDto {
    return { id: this.id, name: this.name };
  }
}
