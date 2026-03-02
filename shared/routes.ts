import { z } from 'zod';
import { insertSessionSchema, sessions } from './schema';

export const errorSchemas = {
  internal: z.object({ message: z.string() }),
  badRequest: z.object({ message: z.string() }),
};

export const api = {
  session: {
    status: {
      method: 'GET' as const,
      path: '/api/session/status' as const,
      responses: {
        200: z.object({
          status: z.string(),
          qrCode: z.string().optional().nullable()
        })
      }
    },
    connect: {
      method: 'POST' as const,
      path: '/api/session/connect' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    },
    disconnect: {
      method: 'POST' as const,
      path: '/api/session/disconnect' as const,
      responses: {
        200: z.object({ message: z.string() })
      }
    }
  },
  groups: {
    list: {
      method: 'GET' as const,
      path: '/api/groups' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
        })),
        500: errorSchemas.internal
      }
    },
    moveMembers: {
      method: 'POST' as const,
      path: '/api/groups/move' as const,
      input: z.object({
        sourceGroupId: z.string(),
        targetGroupId: z.string()
      }),
      responses: {
        200: z.object({
          message: z.string(),
          added: z.number(),
          failed: z.number(),
          details: z.array(z.string()).optional()
        }),
        400: errorSchemas.badRequest,
        500: errorSchemas.internal
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type Group = z.infer<typeof api.groups.list.responses[200]>[number];
