import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "react-hot-toast";

export function useBookmarkNovel() {
  const create = useMutation(api.bookmarks.create);

  const bookmarkNovel = async (novel_id) => {
    try {
      await create({ novel_id });
      toast.success("Bookmark added!");
    } catch (err) {
      toast.error(err.message || "Failed to add bookmark");
    }
  };

  return { bookmarkNovel, isLoading: false };
}

export function useRemoveBookmark() {
  const remove = useMutation(api.bookmarks.remove);

  const removeBookmark = async (novel_id) => {
    try {
      await remove({ novel_id });
      toast.success("Bookmark removed!");
    } catch (err) {
      toast.error(err.message || "Failed to remove bookmark");
    }
  };

  return { removeBookmark, isLoading: false };
}

export function useUserBookmarks() {
  const data = useQuery(api.bookmarks.getByUser);
  return { bookmarks: data || [], isLoading: data === undefined, error: null };
}

export function useIsBookmarked(novel_id) {
  const isBookmarked = useQuery(api.bookmarks.isBookmarked, novel_id ? { novel_id } : "skip");
  return { isBookmarked: !!isBookmarked, isLoading: isBookmarked === undefined };
}
