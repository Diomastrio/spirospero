import React, { useEffect } from "react";
import { ChevronRight, BookOpen } from "lucide-react";
import { Book } from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";

export default function Homepage() {
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

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center text-center px-4 
      bg-[url('/wall.jpg')] bg-cover bg-center bg-no-repeat 
      relative"
    >
      {/* Add a dark overlay to improve text readability */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Wrap content in a container to position above the overlay */}
      <div className="relative z-10 w-full">
        <h1 className="text-6xl font-bold mb-4 pt-8">Welcome to Spiro Spero</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Your digital library for reading and sharing novels. Sign up to start
          reading or contribute your own stories.
        </p>
        <div className="flex justify-center space-x-4 pb-20 mb-16 pt-8">
          <Link
            to="/browse"
            className="flex items-center px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition"
          >
            Browse Novels
            <ChevronRight size={16} className="ml-2" />
          </Link>
          <Link
            to="/login"
            className="flex items-center px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition"
          >
            Sign In
            <BookOpen size={16} className="ml-2" />
          </Link>
        </div>
        <div className="mb-8 md:mb-0 mx-auto w-fit text-center p-6 rounded-lg border border-gray-800 hover:border-primary shadow-lg backdrop-blur-sm bg-black/30">
          <div className="flex items-center justify-center mb-3">
            <Book className="mr-2 text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Spiro Spero</h2>
          </div>
          <p className=" max-w-2xl mx-auto">
            A platform for reading and sharing novel chapters. Join our
            community of readers and writers today.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-[1500px] mx-auto overflow-x-auto py-8 my-6">
            <div className="p-6 rounded-lg border border-gray-800 hover:border-primary transition-all backdrop-blur-sm bg-black/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2 text-indigo-400" size={20} />
                For Readers
              </h3>
              <p className="">
                Discover new novels, bookmark your favorites, and enjoy a
                seamless reading experience across all your devices. Get
                personalized recommendations based on your reading history.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-800 hover:border-primary transition-all backdrop-blur-sm bg-black/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Book className="mr-2 text-emerald-400" size={20} />
                For Writers
              </h3>
              <p className="">
                Share your stories with the world. Upload chapters, edit
                content, and build your audience. Track reader engagement and
                receive valuable feedback on your work.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-gray-800 hover:border-primary transition-all backdrop-blur-sm bg-black/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ChevronRight className="mr-2 text-amber-400" size={20} />
                Easy to Use
              </h3>
              <p className="">
                Intuitive interface with search functionality, pagination, and
                mobile-friendly design for reading on the go. Customize your
                reading experience with font and theme options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
