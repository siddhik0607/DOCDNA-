import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env.js";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Doc DNA Backend API",
      version: "1.0.0",
      description: "Blockchain-powered document verification, tamper detection, and audit APIs.",
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        UploadRegistered: {
          type: "object",
          properties: {
            status: { type: "string", example: "registered" },
            hash: { type: "string" },
            cid: { type: "string" },
            txHash: { type: "string" },
            wallet: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            dna: { type: "string" },
          },
        },
        VerifyAuthentic: {
          type: "object",
          properties: {
            status: { type: "string", example: "authentic" },
            verification: { type: "boolean", example: true },
            wallet: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            txHash: { type: "string" },
            cid: { type: "string" },
            trustScore: { type: "integer", example: 100 },
          },
        },
        VerifyTampered: {
          type: "object",
          properties: {
            status: { type: "string", example: "tampered" },
            verification: { type: "boolean", example: false },
            trustScore: { type: "integer", example: 32 },
            similarityScore: { type: "integer", example: 54 },
            changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  oldValue: { type: "string" },
                  newValue: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/auth/nonce": {
        post: {
          tags: ["Auth"],
          summary: "Request MetaMask nonce",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["walletAddress"],
                  properties: {
                    walletAddress: { type: "string" },
                    email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Nonce issued",
            },
          },
        },
      },
      "/api/auth/wallet": {
        post: {
          tags: ["Auth"],
          summary: "Verify wallet signature and issue JWT",
          responses: {
            "200": {
              description: "Authenticated",
            },
          },
        },
      },
      "/api/documents/upload": {
        post: {
          tags: ["Documents"],
          summary: "Upload and register a document",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["document"],
                  properties: {
                    document: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Registered or flagged as tampered",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/UploadRegistered" },
                      { $ref: "#/components/schemas/VerifyTampered" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      "/api/documents/verify": {
        post: {
          tags: ["Documents"],
          summary: "Verify a document or return tamper report",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["document"],
                  properties: {
                    document: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Verification result",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      { $ref: "#/components/schemas/VerifyAuthentic" },
                      { $ref: "#/components/schemas/VerifyTampered" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      "/api/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard counters",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Dashboard stats" },
          },
        },
      },
      "/api/history": {
        get: {
          tags: ["History"],
          summary: "List audit timeline events",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "History timeline" },
          },
        },
      },
      "/api/user/profile": {
        get: {
          tags: ["User"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "User profile" },
          },
        },
        put: {
          tags: ["User"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Updated profile" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [],
});
