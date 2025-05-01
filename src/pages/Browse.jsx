import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Book,
  Search,
  Filter,
  Loader,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import supabase from "../services/supabaseClient";
import BookmarkButton from "../components/BookmarkButton";

function Browse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [genres, setGenres] = useState([]);
  const [sortOrder, setSortOrder] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  // Fetch published novels
  const { data: novels, isLoading } = useQuery({
    queryKey: ["publishedNovels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novels")
        .select(
          `
          *,
          profiles:author_id(nickname)
        `
        )
        .eq("published", true)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Extract unique genres for filter
  useEffect(() => {
    if (novels) {
      const uniqueGenres = [
        ...new Set(novels.map((novel) => novel.genre).filter(Boolean)),
      ];
      setGenres(uniqueGenres);
    }
  }, [novels]);

  // Filter novels based on search and filters
  const filteredNovels = novels?.filter((novel) => {
    const matchesSearch =
      !searchTerm ||
      novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      novel.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = !selectedGenre || novel.genre === selectedGenre;
    const matchesStatus = !selectedStatus || novel.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Sort novels based on selected sort order
  const sortedNovels = filteredNovels ? [...filteredNovels] : [];
  if (sortOrder === "oldest") {
    sortedNovels.sort(
      (a, b) => new Date(a.updated_at) - new Date(b.updated_at)
    );
  } else {
    // Default to latest (newest first)
    sortedNovels.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters */}
        <div className="mb-8 bg-base-200 p-4 md:p-6 rounded-2xl shadow-md">
          {/* Header with title and search icon */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-1xl md:text-2xl font-bold text-primary">
              Dive into the world of Legendarium
            </h2>

            {/* Animated search with hover effect */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setSearchOpen(true)}
              onMouseLeave={() => !searchTerm && setSearchOpen(false)}
            >
              <div
                className={`transition-all duration-300 overflow-hidden flex items-center ${
                  searchOpen ? "w-48 md:w-64" : "w-0"
                }`}
              >
                <input
                  type="text"
                  placeholder="Search novels..."
                  className="input input-bordered h-10 w-full rounded-xl pl-3 pr-9 py-1 bg-base-100 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className={`h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-content ${
                  searchOpen ? "ml-1" : ""
                }`}
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (!searchOpen && searchTerm) setSearchTerm("");
                }}
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Filters - Wrap on smaller screens */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <div className="relative w-full sm:w-auto flex-1">
              <select
                className="select select-bordered w-full rounded-xl pl-10 pr-3 py-2 appearance-none bg-base-100"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              <BookOpen
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
                size={18}
              />
            </div>

            <div className="relative w-full sm:w-auto flex-1">
              <select
                className="select select-bordered w-full rounded-xl pl-10 pr-5 py-2 appearance-none bg-base-100"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">On Hiatus</option>
              </select>
              <Filter
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
                size={18}
              />
            </div>

            <div className="relative w-full sm:w-auto flex-1">
              <select
                className="select select-bordered w-full rounded-xl pl-10 pr-3 py-2 appearance-none bg-base-100"
                onChange={(e) => setSortOrder(e.target.value)}
                defaultValue=""
              >
                <option value="">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
              <Clock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* Novels Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="animate-spin mr-3 text-primary" size={30} />
            <span className="text-lg">Discovering stories for you...</span>
          </div>
        ) : sortedNovels.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-600 rounded-xl bg-base-200">
            <Book size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-medium mb-2">No Stories Found</h3>
            <p className="opacity-75 max-w-md mx-auto">
              {searchTerm || selectedGenre || selectedStatus
                ? "Try adjusting your search or filters to find more novels."
                : "There are no published novels yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {sortedNovels.map((novel) => (
              <Link
                to={`/novel/${novel.id}`}
                key={novel.id}
                className="group bg-base-200 border border-base-300 rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-40 overflow-hidden relative">
                  {novel.cover_image_url ? (
                    <img
                      src={novel.cover_image_url}
                      alt={novel.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-base-300">
                      <Book size={24} className="opacity-40 text-primary" />
                    </div>
                  )}
                  {novel.genre && (
                    <div className="absolute bottom-1 right-1">
                      <span className="px-1.5 py-0.5 bg-primary bg-opacity-80 text-primary-content text-xs rounded-full">
                        {novel.genre}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2 flex-grow flex flex-col">
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <h3 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {novel.title}
                    </h3>
                    <BookmarkButton novelId={novel.id} size={14} />
                  </div>
                  <p className="text-xs opacity-75 line-clamp-2 mb-1 flex-grow">
                    {novel.description}
                  </p>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-base-300">
                    <div className="flex items-center">
                      <User
                        size={12}
                        className="mr-0.5 opacity-70 text-primary"
                      />
                      <span className="truncate max-w-[60px]">
                        {novel.profiles?.nickname || "Anonymous"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock
                        size={12}
                        className="mr-0.5 opacity-70 text-primary"
                      />
                      <span className="capitalize">{novel.status}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Show count of novels */}
        {sortedNovels && sortedNovels.length > 0 && (
          <div className="mt-10 text-center text-sm bg-base-200 py-3 px-4 rounded-xl inline-block mx-auto">
            Showing{" "}
            <span className="font-bold text-primary">
              {sortedNovels.length}
            </span>{" "}
            {sortedNovels.length === 1 ? "novel" : "novels"}
            {searchTerm || selectedGenre || selectedStatus
              ? " matching your criteria"
              : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;
