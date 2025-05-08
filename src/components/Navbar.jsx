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
  Bookmark,
  CheckCircle,
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

  // Modal state
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [modalDurationMinutes, setModalDurationMinutes] = useState(
    DEFAULT_DURATION_MINUTES
  );
  const [modalMessage, setModalMessage] = useState(DEFAULT_MESSAGE);

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
      // Show the modal instead of prompting
      setModalDurationMinutes(Math.floor(timerDuration / 60));
      setModalMessage(timerMessage);
      setShowTimerModal(true);
    }
  };

  const startTimerFromModal = () => {
    if (isNaN(modalDurationMinutes) || modalDurationMinutes <= 0) {
      alert("Please enter a valid duration.");
      return;
    }

    const newDurationSeconds = modalDurationMinutes * 60;
    setTimerDuration(newDurationSeconds);
    setRemainingTime(newDurationSeconds);
    setTimerMessage(modalMessage);
    setTimerActive(true);
    setTimerPaused(false);
    setShowTimerDisplay(true);
    setShowToast(false);
    setShowTimerModal(false);

    // Save the new preferences
    saveTimerPreferences(newDurationSeconds, modalMessage);
  };

  const togglePause = () => {
    setTimerPaused(!timerPaused);
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
          {isAdmin && (
            <Link
              to="/import-doc"
              className={`text-primary hover:opacity-80 ${isActive(
                "/import-doc"
              )}`}
            >
              Import Novel
            </Link>
          )}
        </div>
      </div>

      {/* Right side icons - rearranged for mobile */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {!isHomePage && <ThemeSelector />}

        {/* Timer button */}
        <button
          className="p-2 btn btn-ghost btn-circle rounded-full relative"
          onClick={() => {
            if (isTimerHidden) {
              setShowTimerDisplay(true); // Just show the display if hidden
            } else if (timerActive) {
              toggleTimer(); // If timer is active, stop it
            } else {
              setShowTimerModal(true); // Otherwise show settings modal
            }
          }}
          title={
            isTimerHidden
              ? "Show timer display"
              : timerActive
              ? "Stop timer"
              : "Set timer"
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
          className="p-2 btn btn-ghost btn-circle rounded-full"
          title="Save current theme as default"
        >
          <Bookmark size={20} />
        </button>

        {/* Desktop-only buttons */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          <button className="p-2 btn btn-ghost btn-circle rounded-full">
            <Bell size={20} />
          </button>
          <Link
            to="/profile"
            className={`p-2 btn btn-ghost btn-circle rounded-full ${
              isActive("/profile") ? "bg-gray-700" : ""
            }`}
          >
            <UserRoundPen size={20} />
          </Link>
          <button
            onClick={handleLogout}
            className="group flex items-center p-2 btn btn-ghost rounded-full overflow-hidden transition-all duration-300 ease-in-out"
            title="Sign out"
          >
            <LogOut
              size={20}
              className="group-hover:text-red-500 transition-colors duration-300"
            />
            <span className="w-0 group-hover:w-16 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-2">
              Sign out
            </span>
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
                  } else if (timerActive) {
                    toggleTimer();
                  } else {
                    setShowTimerModal(true);
                  }
                }}
                className="p-2 hover:bg-gray-800 rounded-full"
                title={
                  isTimerHidden
                    ? "Show timer display"
                    : timerActive
                    ? "Stop timer"
                    : "Set timer"
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
                className="group flex items-center p-2 hover:bg-gray-800 rounded-full overflow-hidden transition-all duration-300 ease-in-out"
                title="Sign out"
              >
                <LogOut
                  size={20}
                  className="group-hover:text-red-500 transition-colors duration-300"
                />
                <span className="w-0 group-hover:w-16 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 ml-0 group-hover:ml-2">
                  Sign out
                </span>
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

      {/* Timer Settings Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-lg shadow-lg p-5 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Timer size={18} className="mr-2 text-primary" />
                Timer Settings
              </h3>
              <button
                onClick={() => setShowTimerModal(false)}
                className="p-1 hover:bg-base-300 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  value={modalDurationMinutes}
                  onChange={(e) =>
                    setModalDurationMinutes(parseInt(e.target.value) || 0)
                  }
                  className="input input-bordered w-full"
                  min="1"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Timer Completion Message</span>
                </label>
                <input
                  type="text"
                  value={modalMessage}
                  onChange={(e) => setModalMessage(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Message to show when timer completes"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTimerModal(false)}
                className="btn btn-ghost mr-2"
              >
                Cancel
              </button>
              <button
                onClick={startTimerFromModal}
                className="btn btn-primary flex items-center"
              >
                <CheckCircle size={18} className="mr-2" />
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
