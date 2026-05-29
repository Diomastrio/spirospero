import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useCreateNovel() {
  const navigate = useNavigate();
  const create = useMutation(api.novels.create);
  
  const createNovel = async (data) => {
    try {
      const result = await create(data);
      toast.success("Novel created successfully!");
      navigate("/dashboard");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to create novel");
    }
  };

  return { createNovel, isLoading: false };
}

export function useUserNovels() {
  const data = useQuery(api.novels.getByAuthor);
  return { novels: data || [], isLoading: data === undefined };
}

export function useNovel(id) {
  const data = useQuery(api.novels.getById, id ? { id } : "skip");
  return { novel: data, isLoading: data === undefined, error: null };
}

export function useUpdateNovel() {
  const update = useMutation(api.novels.update);
  const navigate = useNavigate();

  const updateNovel = async (data) => {
    try {
      const result = await update(data);
      toast.success("Novel updated successfully!");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to update novel");
    }
  };

  return { updateNovel, isLoading: false };
}

export function useDeleteNovel() {
  const navigate = useNavigate();
  const remove = useMutation(api.novels.remove);

  const deleteNovel = async (id) => {
    try {
      await remove({ id });
      toast.success("Novel deleted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to delete novel");
    }
  };

  return { deleteNovel, isLoading: false };
}

export function usePublishNovel() {
  const publish = useMutation(api.novels.publish);
  const navigate = useNavigate();

  const publishNovel = async ({ id, published }) => {
    try {
      const result = await publish({ id, published });
      toast.success(`Novel ${published ? "published" : "unpublished"} successfully!`);
      navigate("/dashboard");
      return result;
    } catch (err) {
      toast.error(err.message || "Failed to publish novel");
    }
  };

  return { publishNovel, isPublishing: false };
}
