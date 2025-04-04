import React, { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Book,
  Loader,
  Home,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageCircle, // Optional: Add this icon for comments section header
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import supabase from "../services/supabaseClient";
import { useThemeStore } from "../store/useThemeStore";
import CommentBox from "../components/CommentBox"; // Import CommentBox component

function ChapterView() {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { setTheme, theme: currentTheme } = useThemeStore();

  // Save current theme and set to forest when component mounts
  useEffect(() => {
    const previousTheme = currentTheme;
    setTheme("forest");

    // Restore previous theme when component unmounts
    return () => {
      if (previousTheme !== "forest") {
        setTheme(previousTheme);
      }
    };
  }, []);

  // Fetch chapter data
  const { data: chapter, isLoading: isLoadingChapter } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Fetch novel data
  const { data: novel, isLoading: isLoadingNovel } = useQuery({
    queryKey: ["novel", novelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", novelId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!novelId,
  });

  // Fetch all chapters to enable navigation
  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters", novelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", novelId)
        .order("chapter_number", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!novelId,
  });

  const isLoading = isLoadingChapter || isLoadingNovel || isLoadingChapters;

  // Find current chapter index and determine prev/next chapters
  const currentChapterIndex =
    chapters?.findIndex((ch) => ch.id === chapterId) || 0;
  const prevChapter =
    chapters && currentChapterIndex > 0
      ? chapters[currentChapterIndex - 1]
      : null;
  const nextChapter =
    chapters && currentChapterIndex < chapters.length - 1
      ? chapters[currentChapterIndex + 1]
      : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-3" size={24} />
        <span className="text-lg">Loading chapter...</span>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Chapter not found</h2>
          <p className="mb-4">
            The chapter you're looking for doesn't exist or has been removed.
          </p>
          <Link to={`/novel/${novelId}`} className="btn btn-primary">
            Back to Novel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-base-100 border-b border-base-300 py-2 px-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link
            to={`/novel/${novelId}`}
            className="flex items-center hover:text-primary"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span className="hidden sm:inline">Back to Novel</span>
          </Link>

          <div className="text-center flex-1">
            <h2 className="text-sm truncate max-w-[200px] sm:max-w-md mx-auto">
              {novel?.title}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/browse" className="hover:text-primary">
              <Home size={20} />
            </Link>
            <Link to="/dashboard" className="hover:text-primary">
              <Book size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Chapter Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Chapter {chapter.chapter_number}: {chapter.title}
            </h1>
            <p className="text-sm opacity-70">{novel?.title}</p>
          </div>

          {/* Chapter Text */}
          <div className="bg-base-200 rounded-lg p-6 shadow-lg mb-8">
            <div className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {chapter.content || "No content available."}
              </ReactMarkdown>
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex justify-between items-center py-4">
            {prevChapter ? (
              <Link
                to={`/novel/${novelId}/chapter/${prevChapter.id}`}
                className="flex items-center px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition"
              >
                <ArrowLeft size={18} className="mr-2" />
                Previous Chapter
              </Link>
            ) : (
              <div></div>
            )}

            {nextChapter ? (
              <Link
                to={`/novel/${novelId}/chapter/${nextChapter.id}`}
                className="flex items-center px-4 py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition"
              >
                Next Chapter
                <ArrowRight size={18} className="ml-2" />
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <MessageCircle size={18} className="mr-2" />
              <h3 className="text-lg font-semibold">Comments</h3>
            </div>
            <CommentBox pageId={`chapter-${chapterId}`} />
          </div>

          {/* Chapter Selection */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <BookOpen size={18} className="mr-2" />
              <h3 className="text-lg font-semibold">Chapters</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {chapters?.map((ch) => (
                <Link
                  key={ch.id}
                  to={`/novel/${novelId}/chapter/${ch.id}`}
                  className={`px-3 py-2 rounded-md text-center text-sm 
                    ${
                      ch.id === chapterId
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 hover:bg-base-300"
                    }`}
                >
                  {ch.chapter_number}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChapterView;
