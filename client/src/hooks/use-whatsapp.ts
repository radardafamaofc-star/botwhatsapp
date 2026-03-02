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
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useConnectSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      console.log("[WA-UI] Sending POST to", api.session.connect.path);
      try {
        const res = await fetch(api.session.connect.path, {
          method: api.session.connect.method,
        });
        console.log("[WA-UI] Response status:", res.status);
        const data = await res.json();
        console.log("[WA-UI] Response data:", data);
        if (!res.ok) throw new Error(data?.message || "Failed to initiate connection");
        return data;
      } catch (err: any) {
        console.error("[WA-UI] Connect error:", err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log("[WA-UI] Connect mutation success, invalidating status query");
      queryClient.invalidateQueries({ queryKey: [api.session.status.path] });
    },
    onError: (err: any) => {
      console.error("[WA-UI] Connect mutation error:", err.message);
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
    retry: 3,
    retryDelay: (attempt) => Math.min(2000 * (attempt + 1), 10000),
    staleTime: 30000,
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
