import React, { useState, useEffect } from "react";
import { Book, Edit, Trash2, Plus, Loader, BookCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useUserNovels,
  useDeleteNovel,
  usePublishNovel,
} from "../services/novelHooks";
import { formatDistanceToNow } from "date-fns";
import supabase from "../services/supabaseClient";

const NovelNestDashboard = () => {
  const { data: novels, isLoading, isError } = useUserNovels();
  const { deleteNovel, isLoading: isDeleting } = useDeleteNovel();
  const { publishNovel, isPublishing } = usePublishNovel();

  // State to store word counts and chapter counts
  const [wordCounts, setWordCounts] = useState({});
  const [totalChapters, setTotalChapters] = useState(0);
  const [showWordCountDetails, setShowWordCountDetails] = useState(false);

  // Calculate word counts when novels data changes
  useEffect(() => {
    async function calculateWordCounts() {
      if (!novels) return;

      let novelWordCounts = {};
      let chapterCount = 0;

      // Process each novel sequentially
      for (const novel of novels) {
        try {
          const { data: chapters } = await supabase
            .from("chapters")
            .select("*")
            .eq("novel_id", novel.id);

          if (chapters) {
            chapterCount += chapters.length;
            // Calculate total words for this novel
            const novelWords = chapters.reduce(
              (sum, chapter) =>
                sum +
                (chapter.content?.split(/\s+/).filter(Boolean).length || 0),
              0
            );
            novelWordCounts[novel.id] = {
              title: novel.title,
              wordCount: novelWords,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching chapters for novel ${novel.id}:`,
            error
          );
        }
      }

      setWordCounts(novelWordCounts);
      setTotalChapters(chapterCount);
    }

    calculateWordCounts();
  }, [novels]);

  // Calculate total word count
  const totalWordCount = Object.values(wordCounts).reduce(
    (sum, novel) => sum + novel.wordCount,
    0
  );

  // Toggle word count details
  const toggleWordCountDetails = () => {
    setShowWordCountDetails((prev) => !prev);
  };

  const handleDeleteNovel = (id) => {
    if (
      confirm(
        "Are you sure you want to delete this novel? This action cannot be undone."
      )
    ) {
      deleteNovel(id);
    }
  };

  const handlePublishNovel = (id) => {
    publishNovel(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Dashboard</h1>
            <Link
              to="/create-novel"
              className="flex items-center px-4 py-2 rounded bg-primary text-primary-content hover:bg-primary-focus"
            >
              <Plus size={18} className="mr-2" />
              Add New Novel
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 border-b border-gray-800 mb-8">
            <button className="pb-4 border-b-2 border-primary font-medium">
              Novels
            </button>
            <button className="pb-4 opacity-70">Chapters</button>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-2xl font-bold mb-2">Manage Novels</h2>
            <p className="mb-8">
              Create, edit, or delete novels from your collection.
            </p>

            {/* Novel List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader className="animate-spin mr-2" />
                <span>Loading your novels...</span>
              </div>
            ) : isError ? (
              <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
                Error loading novels. Please try again.
              </div>
            ) : novels?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                <Book size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No Novels Yet</h3>
                <p className="mb-4">You haven't created any novels yet.</p>
                <Link to="/create-novel" className="btn btn-primary">
                  Create Your First Novel
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {novels.map((novel) => (
                  <div
                    key={novel.id}
                    className="flex justify-between items-center p-4 border border-gray-700 rounded-lg hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-center">
                      <div className="h-16 w-12 mr-4 overflow-hidden rounded">
                        {novel.cover_image_url ? (
                          <img
                            src={novel.cover_image_url}
                            alt={novel.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                            <Book size={24} className="opacity-50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-medium">{novel.title}</h3>
                        <p className="text-gray-400">
                          {novel.status} • Updated{" "}
                          {formatDistanceToNow(new Date(novel.updated_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/novel/${novel.id}/chapters`}
                        className="flex items-center px-4 py-2 rounded hover:bg-gray-800"
                      >
                        <Book className="mr-2" size={18} />
                        Chapters
                      </Link>
                      <Link
                        to={`/novel/${novel.id}/edit`}
                        className="flex items-center px-4 py-2 rounded hover:bg-gray-800"
                      >
                        <Edit className="mr-2" size={18} />
                        Edit
                      </Link>
                      <button
                        className="flex items-center px-4 py-2 rounded hover:bg-gray-800"
                        disabled={isPublishing}
                        onClick={() => handlePublishNovel(novel.id)}
                      >
                        <BookCheck className="mr-2" size={18} />
                        {novel.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="flex items-center px-4 py-2 rounded hover:bg-gray-800"
                        onClick={() => handleDeleteNovel(novel.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2" size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add this after the novel list section */}
          <div className="mt-12 p-6 border border-gray-700 rounded-lg bg-base-200">
            <h2 className="text-2xl font-bold mb-6">Your Writing Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-base-100 p-5 rounded-lg">
                <h3 className="text-primary font-medium mb-1">Total Words</h3>
                <div className="flex flex-col">
                  <p className="text-3xl font-bold">
                    {totalWordCount.toLocaleString()}
                  </p>
                  <button
                    onClick={toggleWordCountDetails}
                    className="text-xs text-primary mt-2 underline self-start"
                  >
                    {showWordCountDetails ? "Hide breakdown" : "Show breakdown"}
                  </button>

                  {showWordCountDetails && (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto text-sm">
                      {Object.values(wordCounts)
                        .sort((a, b) => b.wordCount - a.wordCount)
                        .map((novel) => (
                          <div
                            key={novel.title}
                            className="flex justify-between border-b border-base-300 pb-1"
                          >
                            <span className="truncate mr-2">{novel.title}</span>
                            <span className="font-medium">
                              {novel.wordCount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-base-100 p-5 rounded-lg">
                <h3 className="text-primary font-medium mb-1">
                  Published Novels
                </h3>
                <p className="text-3xl font-bold">
                  {novels?.filter((n) => n.published).length || 0}
                </p>
              </div>
              <div className="bg-base-100 p-5 rounded-lg">
                <h3 className="text-primary font-medium mb-1">
                  Total Chapters
                </h3>
                <p className="text-3xl font-bold">{totalChapters}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NovelNestDashboard;
