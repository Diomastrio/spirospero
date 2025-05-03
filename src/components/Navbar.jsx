import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Moon,
  UserRoundPen,
  BookOpen,
  PenLine,
  LogOut,
  Menu,
  X,
  Timer,
  Pause,
  Play,
  AlertCircle,
  EyeOff,
  Eye,
  Bookmark, // Import Bookmark icon
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const DEFAULT_DURATION_MINUTES = 20;
  const DEFAULT_MESSAGE = "Time's up!";

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerDuration, setTimerDuration] = useState(
    DEFAULT_DURATION_MINUTES * 60
  );
  const [remainingTime, setRemainingTime] = useState(timerDuration);
  const [showTimerDisplay, setShowTimerDisplay] = useState(false);

  // Custom message and toast visibility state
  const [timerMessage, setTimerMessage] = useState(DEFAULT_MESSAGE);
  const [showToast, setShowToast] = useState(false);

  // Load saved preferences on component mount
  useEffect(() => {
    loadTimerPreferences();
  }, []);

  // Save timer preferences to localStorage
  const saveTimerPreferences = (duration, message) => {
    try {
      localStorage.setItem("timerDurationMinutes", Math.floor(duration / 60));
      localStorage.setItem("timerMessage", message);
    } catch (error) {
      console.error("Error saving timer preferences:", error);
    }
  };

  // Load timer preferences from localStorage
  const loadTimerPreferences = () => {
    try {
      const savedDuration = localStorage.getItem("timerDurationMinutes");
      const savedMessage = localStorage.getItem("timerMessage");

      if (savedDuration) {
        const durationMinutes = parseInt(savedDuration, 10);
        const durationSeconds = durationMinutes * 60;
        setTimerDuration(durationSeconds);
        setRemainingTime(durationSeconds);
      }

      if (savedMessage) {
        setTimerMessage(savedMessage);
      }
    } catch (error) {
      console.error("Error loading timer preferences:", error);
    }
  };

  // Save default theme to localStorage
  const saveDefaultTheme = () => {
    try {
      const currentTheme = theme;
      localStorage.setItem("default-theme", currentTheme);
    } catch (error) {
      console.error("Error saving default theme:", error);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;

    if (timerActive && !timerPaused && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setTimerActive(false);
            setShowTimerDisplay(false); // Hide display when timer ends
            setShowToast(true); // Show toast
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerPaused, remainingTime]);

  // Timer control functions
  const toggleTimer = () => {
    if (timerActive) {
      // Stop the timer
      setTimerActive(false);
      setTimerPaused(false);
      setShowTimerDisplay(false);
      setRemainingTime(timerDuration); // Reset to the last set duration
    } else {
      // Get saved duration as default
      const savedDurationMinutes = Math.floor(timerDuration / 60);

      // Start the timer: Prompt for duration first
      const durationInput = prompt(
        `Enter timer duration in minutes:`,
        savedDurationMinutes.toString()
      );

      if (durationInput === null) return; // User cancelled

      const durationMinutes = parseInt(durationInput, 10);
      if (isNaN(durationMinutes) || durationMinutes <= 0) {
        alert("Invalid duration. Please enter a positive number.");
        return;
      }

      const newDurationSeconds = durationMinutes * 60;
      setTimerDuration(newDurationSeconds);
      setRemainingTime(newDurationSeconds);

      // Get saved message as default
      const savedMessage =
        localStorage.getItem("timerMessage") || DEFAULT_MESSAGE;

      // Prompt for custom message
      const message = prompt(
        "Enter a message to show when timer completes:",
        savedMessage
      );

      if (message !== null) {
        setTimerMessage(message);
        setTimerActive(true);
        setTimerPaused(false);
        setShowTimerDisplay(true);
        setShowToast(false);

        // Save the new preferences
        saveTimerPreferences(newDurationSeconds, message);
      }
    }
  };

  const togglePause = () => {
    setTimerPaused((prevPaused) => !prevPaused);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  // Determine the state for the main timer button
  const isTimerHidden = timerActive && !showTimerDisplay;

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
          <Link
            to="/import-doc"
            className={`text-primary hover:opacity-80 ${isActive(
              "/import-doc"
            )}`}
          >
            Import Novel
          </Link>
        </div>
      </div>

      {/* Right side icons - rearranged for mobile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Show theme selector only if not on home page */}
        {!isHomePage && <ThemeSelector />}

        {/* Timer button - Updated logic */}
        <button
          className="p-2 hover:bg-gray-800 rounded-full relative"
          onClick={() => {
            if (isTimerHidden) {
              setShowTimerDisplay(true); // Just show the display if hidden
            } else {
              toggleTimer(); // Otherwise, toggle start/stop
            }
          }}
          title={
            isTimerHidden
              ? "Show timer display"
              : timerActive
              ? "Stop timer"
              : "Start timer"
          }
        >
          {isTimerHidden ? (
            <Eye size={20} className="text-primary" /> // Show Eye icon when hidden
          ) : (
            <Timer size={20} className={timerActive ? "text-primary" : ""} /> // Show Timer icon otherwise
          )}
        </button>

        {/* Save default theme button */}
        <button
          onClick={saveDefaultTheme}
          className="p-2 hover:bg-gray-800 rounded-full"
          title="Save current theme as default"
        >
          <Bookmark size={20} />
        </button>

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
                  setMobileMenuOpen(false); // Close menu first
                  if (isTimerHidden) {
                    setShowTimerDisplay(true);
                  } else {
                    toggleTimer();
                  }
                }}
                className="p-2 hover:bg-gray-800 rounded-full"
                title={
                  isTimerHidden
                    ? "Show timer display"
                    : timerActive
                    ? "Stop timer"
                    : "Start timer"
                }
              >
                {isTimerHidden ? (
                  <Eye size={20} className="text-primary" />
                ) : (
                  <Timer
                    size={20}
                    className={timerActive ? "text-primary" : ""}
                  />
                )}
              </button>
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

      {/* Timer display - Now conditionally rendered based on showTimerDisplay */}
      {timerActive && showTimerDisplay && (
        <div className="fixed bottom-4 right-4 bg-base-300 border border-primary rounded-lg shadow-lg p-3 flex items-center gap-2 z-50">
          <span className="font-mono text-lg font-bold">
            {formatTime(remainingTime)}
          </span>
          {/* Pause/Play Button */}
          <button
            onClick={togglePause}
            className="p-1 hover:bg-base-100 rounded-full"
            title={timerPaused ? "Resume timer" : "Pause timer"}
          >
            {timerPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          {/* Hide Button */}
          <button
            onClick={() => setShowTimerDisplay(false)}
            className="p-1 hover:bg-base-100 rounded-full"
            title="Hide timer display"
          >
            <EyeOff size={16} />
          </button>
          {/* Cancel Button */}
          <button
            onClick={toggleTimer} // This now stops the timer
            className="p-1 hover:bg-base-100 rounded-full text-error" // Added text-error for visual cue
            title="Cancel timer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-base-300 border border-primary rounded-lg shadow-lg p-4 flex items-center gap-3 z-50 max-w-md animate-fade-in">
          <AlertCircle size={20} className="text-primary flex-shrink-0" />
          <div className="flex-grow">
            <p className="font-medium">{timerMessage || "Time's up!"}</p>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="p-1 hover:bg-base-100 rounded-full flex-shrink-0"
            title="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
