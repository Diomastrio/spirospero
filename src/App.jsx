import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Browse from "./pages/Browse";
import { useThemeStore } from "./store/useThemeStore";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/Login";
import NovelNestDashboard from "./pages/Dashboard";
import Homepage from "./pages/Home";
import RegisterPage from "./pages/Register";
import Profile from "./pages/Profile";
import Publish from "./pages/Publish";
import CreateNovel from "./pages/CreateNovel";
import EditNovel from "./pages/EditNovel";
import ChaptersList from "./components/ChaptersList";
import ChapterForm from "./components/ChapterForm";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import Bookmarks from "./pages/Bookmark";
import NovelDetail from "./pages/NovelDetail";
import ChapterView from "./pages/ChapterView";
import ImportDoc from "./pages/ImportDoc";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  const { theme } = useThemeStore();

  // Apply theme on mount and whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="min-h-screen transition-colors duration-300"
        data-theme={theme}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/novel/:id" element={<NovelDetail />} />
          <Route
            path="/novel/:novelId/chapter/:chapterId"
            element={<ChapterView />}
          />
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/import-doc" element={<ImportDoc />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/create-novel" element={<CreateNovel />} />
            <Route path="/novel/:id/edit" element={<EditNovel />} />
            <Route path="/novel/:novelId/chapters" element={<ChaptersList />} />
            <Route
              path="/novel/:novelId/chapter/new"
              element={<ChapterForm />}
            />
            <Route
              path="/novel/:novelId/chapter/:chapterId/edit"
              element={<ChapterForm />}
            />
            <Route path="/dashboard" element={<NovelNestDashboard />} />
            {/* Add other admin-only routes here */}
          </Route>
        </Routes>
        <Toaster />
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
