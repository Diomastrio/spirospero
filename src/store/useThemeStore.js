import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("app-theme") || "forest", // Changed key name from "chat-theme"
  setTheme: (theme) => {
    try {
      localStorage.setItem("app-theme", theme);
      set({ theme });
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  },
  // Add a function to save previous theme before temporary changes
  savePreviousTheme: () => {
    const currentTheme = localStorage.getItem("app-theme") || "forest";
    try {
      localStorage.setItem("previous-theme", currentTheme);
    } catch (error) {
      console.error("Error saving previous theme:", error);
    }
    return currentTheme;
  },
  // Get the previously saved theme
  getPreviousTheme: () => {
    return (
      localStorage.getItem("previous-theme") ||
      localStorage.getItem("app-theme") ||
      "forest"
    );
  },
}));
