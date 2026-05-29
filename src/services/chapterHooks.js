import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function useCreateChapter() {
  const navigate = useNavigate();
  const create = useMutation(api.chapters.create);

  const createChapter = async (data) => {
    try {
      const result = await create(data);
      toast.success("Chapter created successfully!");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to create chapter");
    }
  };

  return { createChapter, isLoading: false };
}

export function useChapters(novel_id) {
  const data = useQuery(api.chapters.getByNovel, novel_id ? { novel_id } : "skip");
  return { chapters: data || [], isLoading: data === undefined, error: null };
}

export function useChapter(id) {
  const data = useQuery(api.chapters.getById, id ? { id } : "skip");
  return { chapter: data, isLoading: data === undefined, error: null };
}

export function useUpdateChapter() {
  const update = useMutation(api.chapters.update);

  const updateChapter = async (data) => {
    try {
      const result = await update(data);
      toast.success("Chapter updated successfully!");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to update chapter");
    }
  };

  return { updateChapter, isLoading: false };
}

export function useDeleteChapter() {
  const remove = useMutation(api.chapters.remove);

  const deleteChapter = async (id) => {
    try {
      await remove({ id });
      toast.success("Chapter deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete chapter");
    }
  };

  return { deleteChapter, isLoading: false };
}

export function useUploadChapterImage() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const uploadImage = async (file) => {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      return storageId; // Note: to view image later, you need to use useQuery(api.files.getUrl, { storageId }) or similar
    } catch (error) {
      toast.error("Failed to upload image");
      throw error;
    }
  };
  return { uploadImage, isUploading: false };
}
