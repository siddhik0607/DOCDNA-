import { prisma } from "../database/prisma.js";
import { realtimeService } from "./realtime.service.js";

export class AuditService {
  async log(documentId: string | null, eventType: string, details: Record<string, unknown>) {
    const audit = await prisma.auditTrail.create({
      data: {
        documentId,
        eventType,
        details: JSON.parse(JSON.stringify(details)) as never,
      },
    });

    await realtimeService.broadcast("audit_log", {
      id: audit.id,
      documentId,
      eventType,
      details,
      createdAt: audit.createdAt.toISOString(),
    });

    return audit;
  }

  async emit(event: string, payload: Record<string, unknown>) {
    await realtimeService.broadcast(event, payload);
  }
}

export const auditService = new AuditService();
