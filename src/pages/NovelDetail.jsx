import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Book,
  Clock,
  User,
  ArrowLeft,
  Loader,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import BookmarkButton from "../components/BookmarkButton";
import supabase from "../services/supabaseClient";

function NovelDetail() {
  const { id } = useParams();

  // Fetch novel details
  const { data: novel, isLoading } = useQuery({
    queryKey: ["novel", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("novels")
        .select(
          `
          *,
          profiles:author_id(nickname)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Fetch chapters
  const { data: chapters } = useQuery({
    queryKey: ["chapters", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", id)
        .order("chapter_number", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-3" size={24} />
        <span className="text-lg">Loading novel...</span>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Novel not found</h2>
          <p className="mb-4">
            The novel you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/browse" className="btn btn-primary">
            Browse Novels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            to="/browse"
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Browse
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Novel Cover */}
          <div className="md:w-1/3">
            <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800 h-96">
              {novel.cover_image_url ? (
                <img
                  src={novel.cover_image_url}
                  alt={novel.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Book size={64} className="opacity-40" />
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2 justify-center">
              <BookmarkButton
                novelId={novel.id}
                size={20}
                className="btn btn-outline btn-sm flex-1"
              />

              {chapters && chapters.length > 0 && (
                <Link
                  to={`/novel/${novel.id}/chapter/${chapters[0].id}`}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Start Reading
                </Link>
              )}
            </div>
          </div>

          {/* Novel Details */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
            </div>

            <div className="flex space-x-4 mb-4 text-sm">
              <div className="flex items-center">
                <User size={16} className="mr-1 opacity-70" />
                <span>{novel.profiles?.nickname || "Anonymous"}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1 opacity-70" />
                <span className="capitalize">{novel.status}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1 opacity-70" />
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(novel.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {novel.genre && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-gray-800 text-xs rounded-full">
                  {novel.genre}
                </span>
              </div>
            )}

            <div className="bg-base-200 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{novel.description}</p>
            </div>

            {/* Chapters List */}
            <div className="bg-base-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen size={20} className="mr-2" />
                Chapters
                {chapters && (
                  <span className="ml-2 text-sm opacity-70">
                    ({chapters.length})
                  </span>
                )}
              </h2>

              {!chapters || chapters.length === 0 ? (
                <div className="text-center py-6">
                  <p>No chapters available yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      to={`/novel/${novel.id}/chapter/${chapter.id}`}
                      className="flex items-center p-3 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <span className="font-medium">
                        Chapter {chapter.chapter_number}:
                      </span>
                      <span className="ml-2">{chapter.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NovelDetail;
