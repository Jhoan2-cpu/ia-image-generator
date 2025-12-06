interface SessionData {
  generationsUsed: number;
  createdAt: Date;
  lastUsed: Date;
}

export class SessionManager {
  private sessions: Map<string, SessionData>;
  private readonly maxGenerations: number;

  constructor(maxGenerations: number = 10) {
    this.sessions = new Map();
    this.maxGenerations = maxGenerations;

    // Limpia sesiones antiguas cada hora
    setInterval(() => this.cleanOldSessions(), 3600000);
  }

  canGenerate(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return true;
    }
    return session.generationsUsed < this.maxGenerations;
  }

  incrementCount(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.generationsUsed++;
      session.lastUsed = new Date();
    } else {
      this.sessions.set(sessionId, {
        generationsUsed: 1,
        createdAt: new Date(),
        lastUsed: new Date()
      });
    }
  }

  getSessionInfo(sessionId: string): { generationsUsed: number; generationsLeft: number; sessionId: string } {
    const session = this.sessions.get(sessionId);
    const used = session ? session.generationsUsed : 0;
    return {
      generationsUsed: used,
      generationsLeft: this.maxGenerations - used,
      sessionId
    };
  }

  private cleanOldSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now.getTime() - session.lastUsed.getTime();
      if (age > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
