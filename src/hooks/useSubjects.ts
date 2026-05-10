import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Subject } from "@/lib/supabase";

export function useSubjects(userId: string | undefined) {
  return useQuery({
    queryKey: ["subjects", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!userId,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subject: Omit<Subject, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("subjects")
        .insert([subject])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subjects", variables.user_id],
      });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from("subjects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({
        queryKey: ["subject", data.id],
      });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useSubject(id: string | undefined) {
  return useQuery({
    queryKey: ["subject", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Subject;
    },
    enabled: !!id,
  });
}
