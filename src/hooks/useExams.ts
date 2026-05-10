import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Exam } from "@/lib/supabase";

export function useExams(userId: string | undefined) {
  return useQuery({
    queryKey: ["exams", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", userId)
        .order("exam_date", { ascending: true });

      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!userId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exam: Omit<Exam, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("exams")
        .insert([exam])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exams", variables.user_id] });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      user_id,
      ...updates
    }: Partial<Exam> & { id: string; user_id: string }) => {
      const { data, error } = await supabase
        .from("exams")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["exams", data.user_id] });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: exam } = await supabase
        .from("exams")
        .select("user_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
      return exam?.user_id;
    },
    onSuccess: (userId) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["exams", userId] });
      }
    },
  });
}
