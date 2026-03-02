import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to log and parse
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useSessionStatus() {
  return useQuery({
    queryKey: [api.session.status.path],
    queryFn: async () => {
      const res = await fetch(api.session.status.path);
      if (!res.ok) throw new Error("Failed to fetch session status");
      const data = await res.json();
      return parseWithLogging(api.session.status.responses[200], data, "session.status");
    },
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

export function useConnectSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.session.connect.path, {
        method: api.session.connect.method,
      });
      if (!res.ok) throw new Error("Failed to initiate connection");
      const data = await res.json();
      return parseWithLogging(api.session.connect.responses[200], data, "session.connect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.session.status.path] });
    },
  });
}

export function useDisconnectSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.session.disconnect.path, {
        method: api.session.disconnect.method,
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      const data = await res.json();
      return parseWithLogging(api.session.disconnect.responses[200], data, "session.disconnect");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.session.status.path] });
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
    },
  });
}

export function useGroups(enabled: boolean = true) {
  return useQuery({
    queryKey: [api.groups.list.path],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      try {
        const res = await fetch(api.groups.list.path, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error((errData as any).message || "Failed to fetch groups");
        }
        const data = await res.json();
        return data as Array<{ id: string; name: string }>;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error("Timeout ao carregar grupos. O WhatsApp pode ter desconectado.");
        }
        throw err;
      }
    },
    enabled,
    retry: 1,
    retryDelay: 3000,
  });
}

export function useMoveMembers() {
  return useMutation({
    mutationFn: async (input: z.infer<typeof api.groups.moveMembers.input>) => {
      const validated = api.groups.moveMembers.input.parse(input);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      try {
        const res = await fetch(api.groups.moveMembers.path, {
          method: api.groups.moveMembers.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to move members");
        }
        
        // Return data directly without strict Zod validation
        return data as { message: string; added: number; failed: number; details?: string[] };
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error("A transferência demorou demais. Verifique o grupo de destino.");
        }
        throw err;
      }
    },
  });
}
