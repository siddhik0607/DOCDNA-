import QRCode from "qrcode";

export type DocumentQrPayload = {
  hash: string;
  cid: string;
  txHash: string;
  wallet: string;
  status: string;
  timestamp: string;
  fileName?: string;
};

export class QrService {
  async generateDocumentQRCode(payload: DocumentQrPayload) {
    return QRCode.toDataURL(JSON.stringify(payload), {
      type: "image/png",
      width: 320,
      margin: 3,
      errorCorrectionLevel: "H",
      color: {
        dark: "#111111",
        light: "#FFFFFFFF",
      },
    });
  }
}

export const qrService = new QrService();
