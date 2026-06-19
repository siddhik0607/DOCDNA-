import { hashStoreService } from "./hashStore.service.js";

export class DashboardService {
  async getStats() {
    const snapshot = await hashStoreService.loadSnapshot();
    const totalTransactions = snapshot.documents.filter((document) => Boolean(document.txHash)).length;
    const fraudAlerts = snapshot.tampered;

    return {
      totalDocuments: snapshot.total,
      verifiedDocuments: snapshot.verified,
      tamperedDocuments: snapshot.tampered,
      pendingDocuments: snapshot.pending,
      totalTransactions,
      fraudAlerts,
    };
  }

  async getTrends() {
    const documents = await hashStoreService.loadDocuments();
    const uploadsByDate = new Map<string, { authentic: number; tampered: number }>();

    for (const document of documents) {
      const date = document.createdAt.slice(0, 16);
      const current = uploadsByDate.get(date) ?? { authentic: 0, tampered: 0 };
      if (document.status === "tampered") {
        current.tampered += 1;
      } else if (document.status === "authentic") {
        current.authentic += 1;
      }
      uploadsByDate.set(date, current);
    }

    return Array.from(uploadsByDate.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-7)
      .map(([date, values]) => ({
        date,
        authentic: values.authentic,
        tampered: values.tampered,
        total: values.authentic + values.tampered,
      }));
  }

  async getRecent() {
    const documents = await hashStoreService.loadDocuments();
    return documents
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 10)
      .map((document) => ({
        id: document.id,
        fileName: document.fileName,
        ownerWallet: document.wallet || "local-hash-store",
        status: document.status.toUpperCase(),
        trustScore: document.status === "tampered" ? 25 : 100,
        createdAt: document.createdAt,
        cid: document.cid,
        txHash: document.txHash,
        hash: document.hash,
        qrCode: document.qrCode,
        events: document.events ?? [],
      }));
  }
}

export const dashboardService = new DashboardService();
