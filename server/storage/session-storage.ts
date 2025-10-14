import { eq, lt, gt, sql } from "drizzle-orm";
import { PostgresqlStorage } from "../postgresql-storage";
import { sessions } from "../../shared/schema/tables";
import { Session, InsertSession } from "../postgresql-storage";
import { DatabaseError } from "../errors/database-error";

import type { IStorage } from "../postgresql-storage";
import type { Session, InsertSession } from "../postgresql-storage";
import type { DatabaseError } from "../errors/database-error";

/**
 * Interface for session storage operations.
 */
export interface SessionStorage {
  updateSession(token: string, updates: Partial<Session>): Promise<Session>;
  deleteSession(token: string): Promise<void>;
  cleanupExpiredSessions(before: Date): Promise<void>;
}

/** 
 * Creates a session storage instance using the provided storage implementation.
 */
export function createSessionStorageExtension(storage: IStorage): SessionStorage {
  return {
    updateSession: async (token: string, updates: Partial<Session>): Promise<Session> => {
      try {
        const existing = await storage.getSession(token);
        if (!existing) throw new DatabaseError(`Session not found: ${token}`, 'updateSession');

        const session: InsertSession = {
          userId: existing.userId,
          token: existing.token,
          expiresAt: updates.expiresAt || existing.expiresAt
        };

        await storage.invalidateSession(token);
        return await storage.createSession(session);
      } catch (error: unknown) {
        if (error instanceof DatabaseError) throw error;
        throw new DatabaseError(
          `Failed to update session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'updateSession',
          error instanceof Error ? error : undefined
        );
      }
    },

    deleteSession: async (token: string): Promise<void> => {
      try {
        await storage.invalidateSession(token);
      } catch (error: unknown) {
        throw new DatabaseError(
          `Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'deleteSession',
          error instanceof Error ? error : undefined
        );
      }
    },

    cleanupExpiredSessions: async (before: Date): Promise<void> => {
      try {
        const tokens = await Promise.all(
          Array.from({ length: 100 }).map(() => storage.getSession(crypto.randomUUID()))
        );

        const expired = tokens.filter((s): s is Session => s !== undefined && s.expiresAt < before);
        await Promise.all(expired.map(s => storage.invalidateSession(s.token)));
      } catch (error: unknown) {
        throw new DatabaseError(
          `Failed to cleanup expired sessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'cleanupExpiredSessions',
          error instanceof Error ? error : undefined
        );
      }
    }
  };
}
  };
}
}
});
  };
}
  };

  return sessionStorage;
}
  };
}
  };
}
  };
}
  };
}
  };
}