import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import supabase from "./supabaseClient";

// Rating API functions
async function addRating(data) {
  const { novel_id, rating } = data;

  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("You must be logged in to rate novels");

  const ratingData = {
    user_id: userData.user.id,
    novel_id,
    rating,
    updated_at: new Date().toISOString(),
  };

  // Check if user already rated this novel
  const { data: existingRating } = await supabase
    .from("ratings")
    .select("*")
    .eq("user_id", userData.user.id)
    .eq("novel_id", novel_id)
    .single();

  if (existingRating) {
    // Update existing rating
    const { data, error } = await supabase
      .from("ratings")
      .update({ rating, updated_at: new Date().toISOString() })
      .eq("id", existingRating.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from("ratings")
      .insert([ratingData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

async function getUserRating(novel_id) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", userData.user.id)
    .eq("novel_id", novel_id)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data ? data.rating : null;
}

// React Query hooks
export function useAddRating() {
  const queryClient = useQueryClient();

  const { mutate: addRatingMutation, isLoading } = useMutation({
    mutationFn: addRating,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["novel", data.novel_id] });
      queryClient.invalidateQueries({
        queryKey: ["userRating", data.novel_id],
      });
      toast.success("Rating submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit rating");
    },
  });

  return { addRating: addRatingMutation, isLoading };
}

export function useUserRating(novel_id) {
  return useQuery({
    queryKey: ["userRating", novel_id],
    queryFn: () => getUserRating(novel_id),
    enabled: !!novel_id,
  });
}
