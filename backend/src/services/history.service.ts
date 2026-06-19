import { hashStoreService } from "./hashStore.service.js";
import { parsePagination } from "../utils/pagination.js";

export class HistoryService {
  async listHistory(query: Record<string, unknown>) {
    const { page, pageSize, skip, take } = parsePagination(query);
    const search = typeof query.search === "string" ? query.search : undefined;
    const eventType = typeof query.eventType === "string" ? query.eventType : undefined;
    const sort = query.sort === "asc" ? "asc" : "desc";
    const documents = await hashStoreService.loadDocuments();
    const timeline = documents.flatMap((document) =>
      (document.events ?? []).map((event, index) => ({
        id: `${document.id}-${index}`,
        eventType: event.label,
        createdAt: event.at,
        details: {
          fileName: document.fileName,
          status: document.status,
          hash: document.hash,
          cid: document.cid,
          txHash: document.txHash,
          wallet: document.wallet,
          qrCode: document.qrCode,
        },
        document: {
          fileName: document.fileName,
          ownerWallet: document.wallet,
        },
      })),
    );

    const filteredItems = timeline
      .filter((item) => {
        if (eventType && item.eventType !== eventType) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          item.eventType.toLowerCase().includes(q) ||
          item.details.fileName.toLowerCase().includes(q) ||
          item.details.hash.toLowerCase().includes(q) ||
          item.details.cid.toLowerCase().includes(q)
        );
      })
      .sort((left, right) =>
        sort === "asc"
          ? left.createdAt.localeCompare(right.createdAt)
          : right.createdAt.localeCompare(left.createdAt),
      );
    const total = filteredItems.length;
    const items = filteredItems.slice(skip, skip + take);

    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

export const historyService = new HistoryService();
