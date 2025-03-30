import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Loader,
  Eye,
  Edit,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Code,
  Sparkles, // Add this import
  X, // Add this import
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNovel } from "../services/novelHooks";
import {
  useChapter,
  useCreateChapter,
  useUpdateChapter,
} from "../services/chapterHooks";
import { getWritingInspiration } from "../services/geminiService"; // Add this import
import { toast } from "react-hot-toast";

const ChapterForm = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();

  // Make isEditMode determination more robust
  const isEditMode = Boolean(chapterId && chapterId !== "new");

  const { data: novel, isLoading: isLoadingNovel } = useNovel(novelId);
  const { data: chapter, isLoading: isLoadingChapter } = useChapter(
    isEditMode ? chapterId : null
  );

  const { createChapter, isLoading: isCreating } = useCreateChapter();
  const { updateChapter, isLoading: isUpdating } = useUpdateChapter();

  const [formData, setFormData] = useState({
    title: "",
    chapter_number: 1,
    content: "",
  });

  const [viewMode, setViewMode] = useState("write"); // "write" or "preview"

  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [inspirationType, setInspirationType] = useState("continue");
  const [inspirationPrompt, setInspirationPrompt] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  useEffect(() => {
    if (isEditMode && chapter) {
      setFormData({
        title: chapter.title || "",
        chapter_number: chapter.chapter_number || 1,
        content: chapter.content || "",
      });
    }
  }, [isEditMode, chapter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "chapter_number" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      updateChapter({ id: chapterId, ...formData });
    } else {
      createChapter({ novel_id: novelId, ...formData });
    }
  };

  const insertMarkdown = (tag, placeholder = "") => {
    const textarea = document.getElementById("content");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end) || placeholder;

    let insertion = "";
    switch (tag) {
      case "bold":
        insertion = `**${selectedText}**`;
        break;
      case "italic":
        insertion = `*${selectedText}*`;
        break;
      case "unorderedList":
        insertion = `\n- ${selectedText}`;
        break;
      case "orderedList":
        insertion = `\n1. ${selectedText}`;
        break;
      case "link":
        insertion = `[${selectedText}](url)`;
        break;
      case "image":
        insertion = `![${selectedText}](image-url)`;
        break;
      case "code":
        insertion = `\`${selectedText}\``;
        break;
      default:
        insertion = selectedText;
    }

    const newText = text.substring(0, start) + insertion + text.substring(end);
    setFormData((prev) => ({ ...prev, content: newText }));

    // Focus and set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertion.length,
        start + insertion.length
      );
    }, 0);
  };

  const handleGetInspiration = async () => {
    setIsLoadingInspiration(true);

    let prompt;
    if (inspirationType === "custom" && inspirationPrompt) {
      prompt = inspirationPrompt;
    } else if (inspirationType === "continue") {
      prompt =
        "Continue this scene in a natural way. Write 2-3 paragraphs that would fit next in the story.";
    } else if (inspirationType === "character") {
      prompt =
        "Suggest character development or dialogue that would enhance this scene.";
    } else if (inspirationType === "setting") {
      prompt =
        "Enhance the setting description in a way that fits the tone of the story.";
    }

    try {
      const result = await getWritingInspiration(prompt, formData.content);
      if (result) {
        setInspiration(result);
      }
    } catch (error) {
      console.error("Error getting inspiration:", error);
    } finally {
      setIsLoadingInspiration(false);
    }
  };

  const insertInspiration = () => {
    if (!inspiration) return;

    const textarea = document.getElementById("content");
    const cursorPos = textarea.selectionEnd;
    const text = formData.content;

    const newContent =
      text.substring(0, cursorPos) +
      "\n\n" +
      inspiration +
      "\n\n" +
      text.substring(cursorPos);
    setFormData((prev) => ({ ...prev, content: newContent }));
    setShowInspirationModal(false);
    setInspiration("");
    toast.success("Inspiration added to your chapter");
  };

  const isLoading = isLoadingNovel || (isEditMode && isLoadingChapter);
  const isSaving = isCreating || isUpdating;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/novel/${novelId}/chapters`}
            className="flex items-center text-primary hover:underline"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Chapters
          </Link>
        </div>

        <div className="bg-base-200 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <BookOpen className="mr-3 text-primary" size={24} />
            <div>
              <h1 className="text-2xl font-bold">
                {isEditMode ? "Edit Chapter" : "Add New Chapter"}
              </h1>
              <p className="text-sm opacity-70">{novel?.title}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Chapter Number */}
              <div>
                <label
                  htmlFor="chapter_number"
                  className="block text-sm font-medium mb-2"
                >
                  Chapter Number <span className="">*</span>
                </label>
                <input
                  id="chapter_number"
                  name="chapter_number"
                  type="number"
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.chapter_number}
                  onChange={handleChange}
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2"
                >
                  Chapter Title <span className="">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Chapter title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium mb-2"
                >
                  Content <span className="">*</span>
                </label>

                {/* Markdown Toolbar */}
                <div className="flex mb-2 space-x-2 bg-base-300 p-2 rounded-t-md">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("bold", "bold text")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Bold"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("italic", "italic text")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Italic"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("unorderedList", "list item")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Bullet List"
                  >
                    <List size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("orderedList", "list item")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Numbered List"
                  >
                    <ListOrdered size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("link", "link text")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Link"
                  >
                    <LinkIcon size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("image", "image alt")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Image"
                  >
                    <Image size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("code", "code")}
                    className="p-1 hover:bg-base-100 rounded"
                    title="Inline Code"
                  >
                    <Code size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInspirationModal(true)}
                    className="p-1 hover:bg-base-100 rounded text-indigo-500"
                    title="Get AI Inspiration"
                  >
                    <Sparkles size={18} />
                  </button>
                  <div className="flex-grow"></div>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setViewMode("write")}
                      className={`p-1 px-2 rounded-l ${
                        viewMode === "write"
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-100"
                      }`}
                    >
                      <Edit size={18} className="mr-1 inline" /> Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`p-1 px-2 rounded-r ${
                        viewMode === "preview"
                          ? "bg-primary text-primary-content"
                          : "hover:bg-base-100"
                      }`}
                    >
                      <Eye size={18} className="mr-1 inline" /> Preview
                    </button>
                  </div>
                </div>

                {/* Editor or Preview based on mode */}
                {viewMode === "write" ? (
                  <textarea
                    id="content"
                    name="content"
                    rows={20}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="Write your chapter content here using Markdown..."
                    value={formData.content}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="w-full h-[500px] overflow-y-auto border border-gray-300 rounded-b-md p-4 prose prose-lg max-w-none bg-base-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.content || "Preview will appear here..."}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Markdown Help Text */}
                <div className="mt-2 text-xs ">
                  Use Markdown syntax for formatting: **bold**, *italic*,
                  [links](url), etc.
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`btn btn-primary px-6 ${
                    isSaving ? "loading" : ""
                  }`}
                >
                  {isSaving
                    ? isEditMode
                      ? "Saving..."
                      : "Creating..."
                    : isEditMode
                    ? "Save Changes"
                    : "Create Chapter"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showInspirationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-lg max-w-xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-lg font-medium flex items-center">
                <Sparkles size={18} className="mr-2 text-indigo-500" />
                AI Writing Assistant
              </h3>
              <button
                onClick={() => setShowInspirationModal(false)}
                className="p-1 hover:bg-base-300 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  What kind of inspiration do you need?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inspirationType"
                      value="continue"
                      checked={inspirationType === "continue"}
                      onChange={() => setInspirationType("continue")}
                      className="mr-2"
                    />
                    Continue the story
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inspirationType"
                      value="character"
                      checked={inspirationType === "character"}
                      onChange={() => setInspirationType("character")}
                      className="mr-2"
                    />
                    Character development/dialogue
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inspirationType"
                      value="setting"
                      checked={inspirationType === "setting"}
                      onChange={() => setInspirationType("setting")}
                      className="mr-2"
                    />
                    Setting description
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="inspirationType"
                      value="custom"
                      checked={inspirationType === "custom"}
                      onChange={() => setInspirationType("custom")}
                      className="mr-2"
                    />
                    Custom prompt
                  </label>
                </div>
              </div>

              {inspirationType === "custom" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Your prompt
                  </label>
                  <textarea
                    value={inspirationPrompt}
                    onChange={(e) => setInspirationPrompt(e.target.value)}
                    placeholder="E.g., Write a twist for my story, suggest a conflict resolution..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
              )}

              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGetInspiration}
                  disabled={
                    isLoadingInspiration ||
                    (inspirationType === "custom" && !inspirationPrompt)
                  }
                  className="btn btn-primary"
                >
                  {isLoadingInspiration ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Get Inspiration"
                  )}
                </button>
              </div>

              {inspiration && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Inspiration
                  </label>
                  <div className="bg-base-200 p-3 rounded-md border border-base-300 prose max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {inspiration}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={insertInspiration}
                      className="btn btn-sm btn-primary"
                    >
                      Insert at Cursor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterForm;
