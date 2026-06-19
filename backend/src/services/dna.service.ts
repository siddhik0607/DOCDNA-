import { createDnaSvg } from "../utils/dna.js";

export class DnaService {
  generate(hash: string) {
    return createDnaSvg(hash);
  }
}

export const dnaService = new DnaService();
