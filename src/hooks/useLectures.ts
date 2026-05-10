import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Lecture } from "@/lib/supabase";

export function useLectures(subjectId: string | undefined) {
  return useQuery({
    queryKey: ["lectures", subjectId],
    queryFn: async () => {
      if (!subjectId) return [];
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lecture[];
    },
    enabled: !!subjectId,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lecture: Omit<Lecture, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("lectures")
        .insert([lecture])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["lectures", data.subject_id],
      });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subject_id,
      ...updates
    }: Partial<Lecture> & { id: string; subject_id: string }) => {
      const { data, error } = await supabase
        .from("lectures")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["lectures", data.subject_id],
      });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: lecture } = await supabase
        .from("lectures")
        .select("subject_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("lectures").delete().eq("id", id);
      if (error) throw error;
      return lecture?.subject_id;
    },
    onSuccess: (subjectId) => {
      if (subjectId) {
        queryClient.invalidateQueries({
          queryKey: ["lectures", subjectId],
        });
      }
    },
  });
}
