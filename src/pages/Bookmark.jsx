import React from "react";
import { Link } from "react-router-dom";
import { Book, Bookmark, Clock, User, Loader } from "lucide-react";
import { useUserBookmarks } from "../services/bookmarkHooks";

function Bookmarks() {
  const { data: bookmarkedNovels, isLoading } = useUserBookmarks();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Bookmarks</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-75">
            Novels you've saved for later
          </p>
        </div>

        {/* Novels Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin mr-3" size={24} />
            <span className="text-lg">Loading bookmarks...</span>
          </div>
        ) : bookmarkedNovels?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-600 rounded-xl">
            <Bookmark size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No Bookmarks Yet</h3>
            <p className="opacity-75 max-w-md mx-auto">
              Browse novels and bookmark the ones you're interested in.
            </p>
            <Link to="/browse" className="btn btn-primary mt-4">
              Browse Novels
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bookmarkedNovels.map((novel) => (
              <Link
                to={`/novel/${novel.id}`}
                key={novel.id}
                className="group border border-gray-700 rounded-xl overflow-hidden hover:border-primary transition-all duration-300 flex flex-col"
              >
                <div className="h-64 overflow-hidden bg-gray-800">
                  {novel.cover_image_url ? (
                    <img
                      src={novel.cover_image_url}
                      alt={novel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book size={48} className="opacity-40" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {novel.title}
                  </h3>
                  <p className="text-sm opacity-75 line-clamp-3 mb-4 flex-grow">
                    {novel.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <User size={16} className="mr-1 opacity-70" />
                      <span>{novel.profiles?.nickname || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 opacity-70" />
                      <span className="capitalize">{novel.status}</span>
                    </div>
                  </div>
                  {novel.genre && (
                    <div className="mt-3">
                      <span className="px-3 py-1 bg-gray-800 text-xs rounded-full">
                        {novel.genre}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bookmarks;
