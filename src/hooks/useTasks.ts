import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Task } from "@/lib/supabase";

export function useTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ["tasks", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!userId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<Task, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([task])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.user_id] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      user_id,
      ...updates
    }: Partial<Task> & { id: string; user_id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", data.user_id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: task } = await supabase
        .from("tasks")
        .select("user_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return task?.user_id;
    },
    onSuccess: (userId) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      }
    },
  });
}
