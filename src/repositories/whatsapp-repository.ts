import * as venom from "venom-bot";

export class WhatsAppRepository {
  private readonly whatsapps: venom.Whatsapp[] = [];

  async check(session: string) {
    return this.whatsapps.some((wa) => wa.session === session);
  }

  async findOne(session: string) {
    return this.whatsapps.find((wa) => wa.session === session);
  }

  async create(whatsapp: venom.Whatsapp) {
    this.whatsapps.push(whatsapp);
  }

  async remove(whatsapp: venom.Whatsapp) {
    const index = this.whatsapps.findIndex((w) => w === whatsapp);
    if (index === -1) return false;
    this.whatsapps.splice(index, 1);
    return true;
  }
}

export const whatsappRepository = new WhatsAppRepository();
