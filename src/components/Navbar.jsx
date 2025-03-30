import React, { useState } from "react";
import {
  Search,
  Bell,
  Moon,
  UserRoundPen,
  BookOpen,
  PenLine,
  LogOut,
  Menu, // Add this import
  X, // Add this import
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeSelector from "./ThemeSelector";
import { useUser, useLogout } from "../authentication/authHooks";
import { useThemeStore } from "../store/useThemeStore";

export default function Navbar() {
  const { user, isAdmin } = useUser();
  const { logout } = useLogout();
  const { theme } = useThemeStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Add state for mobile menu

  const darkThemes = [
    "dark",
    "night",
    "black",
    "luxury",
    "dracula",
    "business",
    "coffee",
    "forest",
    "halloween",
    "synthwave",
    "cyberpunk",
    "dim",
    "nord",
  ];

  const src = darkThemes.includes(theme) ? "/spiroL.png" : "/spiroD.png";

  const handleLogout = () => {
    logout();
    // The redirect to login page is already handled in the useLogout hook
  };

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? "font-bold text-lg" : "";
  };

  // Check if current page is home
  const isHomePage = location.pathname === "/" || location.pathname === "/home";

  return (
    <nav className="relative flex items-center justify-between p-4 border-b border-gray-800 z-40">
      {/* Logo and desktop navigation */}
      <div className="flex items-center">
        <img src={src} alt="Logo" className="h-[3.5rem] w-[3.5rem]" />

        {/* Desktop navigation - hidden on mobile */}
        <div className="hidden md:flex md:items-center md:space-x-6 ml-6">
          <Link
            to="/home"
            className={`text-primary hover:opacity-80 ${isActive("/home")}`}
          >
            Home
          </Link>
          <Link
            to="/browse"
            className={`text-primary hover:opacity-80 ${isActive("/browse")}`}
          >
            Browse
          </Link>
          <Link
            to="/bookmarks"
            className={`text-primary hover:opacity-80 ${isActive(
              "/bookmarks"
            )}`}
          >
            Bookmarks
          </Link>
          {user && (
            <Link
              to={isAdmin ? "/dashboard" : "/publish"}
              className={`text-primary hover:opacity-80 ${isActive(
                isAdmin ? "/dashboard" : "/publish"
              )}`}
            >
              {isAdmin ? "Dashboard" : "Publish"}
            </Link>
          )}
        </div>
      </div>

      {/* Right side icons - rearranged for mobile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Show theme selector only if not on home page */}
        {!isHomePage && <ThemeSelector />}

        {/* Desktop-only buttons */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-full">
            <Bell size={20} />
          </button>
          <Link
            to="/profile"
            className={`p-2 hover:bg-gray-800 rounded-full ${
              isActive("/profile") ? "bg-gray-700" : ""
            }`}
          >
            <UserRoundPen size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="p-2 md:hidden rounded-full hover:bg-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-base-200 border-b border-gray-800 shadow-lg z-50 md:hidden">
          <div className="flex flex-col p-4 space-y-4">
            <Link
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-primary hover:opacity-80 ${isActive("/home")}`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-primary hover:opacity-80 ${isActive("/browse")}`}
            >
              Browse
            </Link>
            <Link
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-primary hover:opacity-80 ${isActive(
                "/bookmarks"
              )}`}
            >
              Bookmarks
            </Link>
            {user && (
              <Link
                to={isAdmin ? "/dashboard" : "/publish"}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-primary hover:opacity-80 ${isActive(
                  isAdmin ? "/dashboard" : "/publish"
                )}`}
              >
                {isAdmin ? "Dashboard" : "Publish"}
              </Link>
            )}
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-700">
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Bell size={20} />
              </button>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <UserRoundPen size={20} />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
