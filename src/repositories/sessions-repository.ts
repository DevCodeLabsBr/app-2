import Session from "../entities/session";

export class SessionsRepository {
  private readonly sessions: Session[] = [];

  async findAll() {
    return this.sessions;
  }

  async check(name: string) {
    return this.sessions.some((session) => session.name === name);
  }

  async findOne(name: string) {
    return this.sessions.find((session) => session.name === name);
  }

  async create(session: Session) {
    this.sessions.push(session);
  }

  async update(session: Session) {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index === -1) return false;
    this.sessions[index] = session;
    return true;
  }

  async remove(session: Session) {
    const index = this.sessions.findIndex((s) => s.id === session.id);
    if (index === -1) return false;
    this.sessions.splice(index, 1);
    return true;
  }
}

export const sessionsRepository = new SessionsRepository();
