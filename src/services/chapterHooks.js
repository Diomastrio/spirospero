import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import supabase from "./supabaseClient";
import { v4 as uuidv4 } from "uuid"; // Add this import

// Chapter API functions
async function createChapter({
  novel_id: novelId,
  chapter_number,
  title,
  content,
}) {
  const newChapter = {
    novel_id: novelId,
    chapter_number,
    title,
    content,
  };

  const { data, error } = await supabase
    .from("chapters")
    .insert([newChapter])
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data;
}

async function getChapters(novel_id) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("novel_id", novel_id)
    .order("chapter_number", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

async function getChapter(id) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function updateChapter({ id, ...chapterData }) {
  const { data, error } = await supabase
    .from("chapters")
    .update({ ...chapterData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function deleteChapter(id) {
  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) throw new Error(error.message);
  return { id };
}

// Image upload function for chapters
export async function uploadChapterImage(file) {
  if (!file) return null;

  try {
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `chapter-images/${fileName}`;

    // Upload the file to the tally bucket
    const { data, error } = await supabase.storage
      .from("tally")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from("tally")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// React Query hooks for chapters
export function useCreateChapter() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { novelId } = useParams();

  const { mutate: createChapterMutation, isLoading } = useMutation({
    mutationFn: (chapterData) =>
      createChapter({
        ...chapterData,
        novel_id: chapterData.novel_id || novelId,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", data.novel_id] });
      toast.success("Chapter created successfully!");
      // Change this navigation path to match your route structure
      navigate(`/novel/${data.novel_id}/chapters`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create chapter");
      console.error("Chapter creation error:", error);
    },
  });

  return { createChapter: createChapterMutation, isLoading };
}

export function useChapters(novel_id) {
  return useQuery({
    queryKey: ["chapters", novel_id],
    queryFn: () => getChapters(novel_id),
    enabled: !!novel_id,
  });
}

export function useChapter(id) {
  return useQuery({
    queryKey: ["chapter", id],
    queryFn: () => getChapter(id),
    enabled: !!id,
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();

  const { mutate: updateChapterMutation, isLoading } = useMutation({
    mutationFn: updateChapter,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters", data.novel_id] });
      queryClient.invalidateQueries({ queryKey: ["chapter", data.id] });
      toast.success("Chapter updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update chapter");
    },
  });

  return { updateChapter: updateChapterMutation, isLoading };
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { novelId } = useParams();

  const { mutate: deleteChapterMutation, isLoading } = useMutation({
    mutationFn: deleteChapter,
    onSuccess: (data, variables, context) => {
      // We need to store novel_id in context to use it after deletion
      queryClient.invalidateQueries({
        queryKey: ["chapters", context.novel_id],
      });
      toast.success("Chapter deleted successfully!");
      navigate(`/novel/${context.novel_id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete chapter");
    },
  });

  // Wrap the mutation to capture the novel_id before deletion
  const deleteChapterWithContext = (id, novel_id = novelId) => {
    if (!id) {
      toast.error("Cannot delete chapter: Missing chapter ID");
      return;
    }
    return deleteChapterMutation(id, {
      context: { novel_id: novel_id || novelId },
    });
  };

  return { deleteChapter: deleteChapterWithContext, isLoading };
}

// Optional: Create a React Query hook for image uploads
export function useUploadChapterImage() {
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: uploadChapterImage,
    onError: (error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });

  return { uploadChapterImage: mutateAsync, isUploading: isLoading };
}
