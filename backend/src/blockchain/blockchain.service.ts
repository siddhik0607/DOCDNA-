import { Contract, JsonRpcProvider, Wallet } from "ethers";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

const contractAbi = [
  "function registerDocument(string documentHash, string ipfsCID, address ownerWallet) external returns (bool)",
  "function verifyDocument(string documentHash) external returns (bool)",
  "function getDocument(string documentHash) external view returns (string hash, string cid, address owner, uint256 timestamp, bool exists)",
];

export class BlockchainService {
  private provider = new JsonRpcProvider(env.ALCHEMY_RPC_URL);
  private signer = new Wallet(env.PRIVATE_KEY, this.provider);
  private contract = new Contract(env.CONTRACT_ADDRESS, contractAbi, this.signer);

  async registerDocumentOnChain(documentHash: string, ipfsCID: string, ownerWallet: string) {
    try {
      const tx = await this.contract.registerDocument(documentHash, ipfsCID, ownerWallet);
      const receipt = await tx.wait();
      const block = await this.provider.getBlock(receipt.blockNumber);

      return {
        hash: documentHash,
        txHash: receipt.hash as string,
        blockNumber: receipt.blockNumber as number,
        wallet: ownerWallet,
        timestamp: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      throw new ApiError(502, "Blockchain registration failed", error);
    }
  }

  async getDocumentFromChain(documentHash: string) {
    try {
      const [hash, cid, owner, timestamp, exists] = await this.contract.getDocument(documentHash);
      return {
        hash: hash as string,
        cid: cid as string,
        owner: owner as string,
        timestamp: Number(timestamp),
        exists: exists as boolean,
      };
    } catch (error) {
      throw new ApiError(502, "Blockchain lookup failed", error);
    }
  }

  async verifyDocumentOnChain(documentHash: string) {
    try {
      const tx = await this.contract.verifyDocument(documentHash);
      const receipt = await tx.wait();
      return {
        verified: true,
        txHash: receipt.hash as string,
        blockNumber: receipt.blockNumber as number,
      };
    } catch {
      return {
        verified: false,
      };
    }
  }
}

export const blockchainService = new BlockchainService();
