import axios from "axios";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export class PinataService {
  async uploadToIPFS(buffer: Buffer, fileName: string, mimeType: string) {
    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: fileName,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          source: "doc-dna",
        },
      }),
    );

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`,
      },
      maxBodyLength: Infinity,
    });

    const cid = response.data.IpfsHash as string;
    return {
      cid,
      gatewayUrl: `https://${env.PINATA_GATEWAY}/ipfs/${cid}`,
      timestamp: new Date().toISOString(),
      metadata: response.data,
    };
  }

  async retrieveFromIPFS(cid: string) {
    try {
      const response = await axios.get<ArrayBuffer>(`https://${env.PINATA_GATEWAY}/ipfs/${cid}`, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new ApiError(502, `Unable to retrieve CID ${cid} from Pinata`, error);
    }
  }

  async deleteFromIPFS(cid: string) {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
      headers: {
        Authorization: `Bearer ${env.PINATA_JWT}`,
      },
    });
  }
}

export const pinataService = new PinataService();
