import React from "react";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Loader } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useNovel } from "../services/novelHooks";
import { useChapters, useDeleteChapter } from "../services/chapterHooks";
import { formatDistanceToNow } from "date-fns";

const ChaptersList = () => {
  const { novelId } = useParams();
  const { data: novel, isLoading: isLoadingNovel } = useNovel(novelId);
  const { data: chapters, isLoading: isLoadingChapters } = useChapters(novelId);
  const { deleteChapter, isLoading: isDeleting } = useDeleteChapter();

  const handleDeleteChapter = (chapterId) => {
    if (
      confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      deleteChapter(chapterId, novelId);
    }
  };

  const isLoading = isLoadingNovel || isLoadingChapters;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" />
        <span>Loading chapters...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-base-200 rounded-xl p-8 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <BookOpen className="mr-3 text-primary" size={24} />
              <div>
                <h1 className="text-2xl font-bold">
                  {novel?.title} - Chapters
                </h1>
                <p className="text-sm opacity-70">{novel?.status}</p>
              </div>
            </div>
            <Link
              to={`/novel/${novelId}/chapter/new`}
              className="btn btn-primary"
            >
              <Plus size={18} className="mr-2" />
              Add Chapter
            </Link>
          </div>

          {/* Chapters List */}
          {chapters?.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No Chapters Yet</h3>
              <p className="mb-4">Start adding chapters to your novel.</p>
              <Link
                to={`/novel/${novelId}/chapter/new`}
                className="btn btn-primary"
              >
                Create First Chapter
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters?.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex justify-between items-center p-4 border border-gray-700 rounded-lg hover:border-gray-500 transition-all"
                >
                  <div>
                    <h3 className="font-medium">
                      Chapter {chapter.chapter_number}: {chapter.title}
                    </h3>
                    <p className="text-sm opacity-70">
                      Updated{" "}
                      {formatDistanceToNow(new Date(chapter.updated_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/novel/${novelId}/chapter/${chapter.id}/edit`}
                      className="flex items-center px-3 py-1 rounded hover:opacity-80"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Link>
                    <button
                      className="flex items-center px-3 py-1 rounded hover:opacity-80"
                      onClick={() => handleDeleteChapter(chapter.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaptersList;
