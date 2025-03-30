import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import supabase from "./supabaseClient";

// Bookmark API functions
async function addBookmark(novel_id) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    throw new Error("You must be logged in to bookmark novels");

  const newBookmark = {
    user_id: userData.user.id,
    novel_id,
    created_at: new Date().toISOString(),
  };

  // First check if bookmark already exists
  const { data: existingBookmark } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userData.user.id)
    .eq("novel_id", novel_id)
    .single();

  if (existingBookmark) {
    return existingBookmark; // Already bookmarked
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert([newBookmark])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function removeBookmark(novel_id) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    throw new Error("You must be logged in to manage bookmarks");

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("novel_id", novel_id);

  if (error) throw new Error(error.message);
  return { novel_id };
}

async function getUserBookmarks() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      novel_id,
      novels:novel_id (
        id, 
        title, 
        description, 
        cover_image_url, 
        genre, 
        status,
        author_id,
        profiles:author_id (nickname)
      )
    `
    )
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map((bookmark) => bookmark.novels);
}

async function isNovelBookmarked(novel_id) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userData.user.id)
    .eq("novel_id", novel_id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is the error code for "No rows returned"
    throw new Error(error.message);
  }

  return Boolean(data);
}

// React Query hooks
export function useBookmarkNovel() {
  const queryClient = useQueryClient();

  const { mutate: bookmarkMutation, isLoading: isBookmarking } = useMutation({
    mutationFn: addBookmark,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({
        queryKey: ["isBookmarked", data.novel_id],
      });
      toast.success("Novel bookmarked successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to bookmark novel");
    },
  });

  return { bookmarkNovel: bookmarkMutation, isBookmarking };
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  const { mutate: removeBookmarkMutation, isLoading: isRemoving } = useMutation(
    {
      mutationFn: removeBookmark,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
        queryClient.invalidateQueries({
          queryKey: ["isBookmarked", data.novel_id],
        });
        toast.success("Bookmark removed successfully!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to remove bookmark");
      },
    }
  );

  return { removeBookmark: removeBookmarkMutation, isRemoving };
}

export function useUserBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getUserBookmarks,
  });
}

export function useIsBookmarked(novel_id) {
  return useQuery({
    queryKey: ["isBookmarked", novel_id],
    queryFn: () => isNovelBookmarked(novel_id),
    enabled: !!novel_id,
  });
}
