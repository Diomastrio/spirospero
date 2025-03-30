import { PaletteIcon } from "lucide-react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useEffect } from "react";

function ThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  // Apply theme on mount and whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Force a reload of styles
    document.body.style.transition = "background-color 0.2s ease";
    // Debug
    console.log("Theme changed to:", theme);
  }, [theme]);

  // Format theme objects for consistent rendering
  const themeObjects = THEMES.map((themeName) => ({
    name: themeName,
    label: themeName.charAt(0).toUpperCase() + themeName.slice(1),
    colors: getThemeColors(themeName),
  }));

  return (
    <div className="dropdown dropdown-end">
      {/* DROPDOWN TRIGGER */}
      <button tabIndex={0} className="btn btn-ghost btn-circle">
        <PaletteIcon className="size-5" />
      </button>

      <div
        tabIndex={0}
        className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl
        w-56 border border-base-content/10 max-h-[70vh] overflow-y-auto"
      >
        {themeObjects.map((themeOption) => (
          <button
            key={themeOption.name}
            className={`
                w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
                ${
                  theme === themeOption.name
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-base-content/5"
                }
              `}
            onClick={() => setTheme(themeOption.name)}
          >
            <PaletteIcon className="size-4" />
            <span className="text-sm font-medium">{themeOption.label}</span>

            {/* THEME PREVIEW COLORS */}
            <div className="ml-auto flex gap-1">
              {themeOption.colors.map((color, i) => (
                <span
                  key={i}
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function to generate theme colors
function getThemeColors(themeName) {
  // Default colors for each theme (primary, secondary, accent, neutral)
  const colorMap = {
    light: ["#570df8", "#f000b8", "#37cdbe", "#3d4451"],
    dark: ["#661AE6", "#D926AA", "#1FB2A5", "#191D24"],
    cupcake: ["#65c3c8", "#ef9fbc", "#eeaf3a", "#291334"],
    bumblebee: ["#e0a82e", "#f9d72f", "#f38c00", "#333c4d"],
    emerald: ["#66cc8a", "#377cfb", "#f59e0b", "#333c4d"],
    corporate: ["#4b6bfb", "#7b92b2", "#67e8f9", "#191D24"],
    synthwave: ["#e779c1", "#58c7f3", "#f3cc30", "#251e2d"],
    retro: ["#ef9995", "#2cb67d", "#7611a6", "#16161a"],
    cyberpunk: ["#ff7598", "#75d1f0", "#d8b935", "#1a103d"],
    valentine: ["#e96d7b", "#a991f7", "#88dbdd", "#4f2b3c"],
    halloween: ["#f28c18", "#6d3a9c", "#51a800", "#212121"],
    garden: ["#5c7f67", "#63a948", "#f9cb51", "#eeeae8"],
    forest: ["#1eb854", "#1d9bf0", "#fbbf24", "#1f242a"],
    aqua: ["#09ecf3", "#966fb3", "#38bdf8", "#1a2234"],
    lofi: ["#0d0d0d", "#1a1919", "#e1e1e1", "#737373"],
    pastel: ["#d1c1d7", "#f6cbd1", "#b4e9d2", "#70acc7"],
    fantasy: ["#6e0b75", "#007ebd", "#00b389", "#141b1f"],
    wireframe: ["#b8b8b8", "#c6c6c6", "#d1d1d1", "#e5e5e5"],
    black: ["#373737", "#757575", "#a6adbb", "#272626"],
    luxury: ["#ffffff", "#152747", "#f8b525", "#000000"],
    dracula: ["#ff79c6", "#bd93f9", "#8be9fd", "#414558"],
    cmyk: ["#45AEEE", "#E93CAC", "#ECEC4B", "#1f2937"],
    autumn: ["#8C0327", "#D85251", "#F9CB40", "#694E4E"],
    business: ["#1C4E80", "#7EA8BE", "#A5D8DD", "#EA6947"],
    acid: ["#FF00F4", "#00FFFF", "#FAEF5D", "#141414"],
    lemonade: ["#D9CB50", "#8BBEE8", "#BDF7B7", "#5B6770"],
    night: ["#BF40BF", "#818CF8", "#38BDF8", "#171212"],
    coffee: ["#DB924B", "#263E3F", "#10576E", "#E6E0D4"],
    winter: ["#0891b2", "#111827", "#d1d5db", "#796055"],
    dim: ["#9FE88D", "#7FD8BE", "#C3AEFF", "#1c232b"],
    nord: ["#81A1C1", "#EBCB8B", "#BF616A", "#3B4252"],
    sunset: ["#FF865B", "#FD5D5D", "#FFC371", "#080202"],
  };

  return colorMap[themeName] || ["#333", "#666", "#999", "#ccc"];
}

export default ThemeSelector;
