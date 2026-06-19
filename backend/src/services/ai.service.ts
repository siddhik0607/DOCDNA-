import axios from "axios";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export type ComparisonResult = {
  trustScore: number;
  similarityScore: number;
  changes: Array<{ field: string; oldValue: string; newValue: string }>;
};

function appendFile(formData: FormData, field: string, fileName: string, mimeType: string, buffer: Buffer) {
  formData.append(field, new Blob([new Uint8Array(buffer)], { type: mimeType }), fileName);
}

export class AiService {
  async compareDocuments(params: {
    originalBuffer: Buffer;
    originalName: string;
    originalType: string;
    candidateBuffer: Buffer;
    candidateName: string;
    candidateType: string;
  }): Promise<ComparisonResult> {
    try {
      const formData = new FormData();
      appendFile(formData, "original", params.originalName, params.originalType, params.originalBuffer);
      appendFile(formData, "candidate", params.candidateName, params.candidateType, params.candidateBuffer);

      const response = await axios.post<ComparisonResult>(`${env.AI_SERVICE_URL}/compare`, formData, {
        maxBodyLength: Infinity,
      });

      return response.data;
    } catch (error) {
      throw new ApiError(502, "AI comparison service unavailable", error);
    }
  }
}

export const aiService = new AiService();
