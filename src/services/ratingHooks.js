import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "react-hot-toast";

export function useAddRating() {
  const add = useMutation(api.ratings.add);

  const addRating = async ({ novel_id, rating }) => {
    try {
      await add({ novel_id, rating });
      toast.success("Rating submitted!");
    } catch (err) {
      toast.error(err.message || "Failed to submit rating");
    }
  };

  return { addRating, isLoading: false };
}

export function useUserRating(novel_id) {
  const data = useQuery(api.ratings.getByUser, novel_id ? { novel_id } : "skip");
  return { userRating: data, isLoading: data === undefined, error: null };
}
