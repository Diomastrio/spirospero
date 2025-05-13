import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
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
  Sparkles,
  X,
  Wand2,
  ClipboardPaste, // Added
  Check, // Added
  Copy, // Added
  AlignJustify, // Add this for paragraph spacing icon
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNovel } from "../services/novelHooks";
import {
  useChapter,
  useCreateChapter,
  useUpdateChapter,
  useUploadChapterImage, // Add this import
} from "../services/chapterHooks";
import { getWritingInspiration } from "../services/geminiService";
import { toast } from "react-hot-toast";
// *** NEW: Comparison Modal Component ***
const ComparisonModal = ({
  isOpen,
  onClose,
  originalText,
  pastedText,
  onKeepOriginal,
  onKeepPasted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-base-300 flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center">
            <ClipboardPaste size={18} className="mr-2" />
            Compare Text
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-base-300 rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {/* Modern Border Container */}
          <div className="border border-base-300 rounded-md p-1">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Original Text Panel */}
              <div className="flex-1 bg-base-200 p-3 rounded">
                <h4 className="text-sm font-semibold mb-2 border-b border-base-300 pb-1">
                  Original (Selected)
                </h4>
                <pre className="whitespace-pre-wrap text-sm font-mono break-words">
                  {originalText}
                </pre>
                <div className="mt-3 text-right">
                  <button
                    onClick={onKeepOriginal}
                    className="btn btn-sm btn-outline btn-success flex items-center gap-1"
                  >
                    <Check size={16} /> Keep This
                  </button>
                </div>
              </div>

              {/* Pasted Text Panel */}
              <div className="flex-1 bg-base-200 p-3 rounded">
                <h4 className="text-sm font-semibold mb-2 border-b border-base-300 pb-1">
                  Pasted (From Clipboard)
                </h4>
                <pre className="whitespace-pre-wrap text-sm font-mono break-words">
                  {pastedText || (
                    <span className="opacity-50">
                      (Clipboard empty or could not read)
                    </span>
                  )}
                </pre>
                <div className="mt-3 text-right">
                  {pastedText && (
                    <button
                      onClick={onKeepPasted}
                      className="btn btn-sm btn-outline btn-success flex items-center gap-1"
                    >
                      <Check size={16} /> Keep This
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-base-300 flex justify-end">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
// *** END: Comparison Modal Component ***

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
  const { uploadChapterImage, isUploading: isUploadingImage } =
    useUploadChapterImage(); // Add this with your other hooks

  const [formData, setFormData] = useState({
    title: "",
    chapter_number: 1,
    content: "",
  });

  const [viewMode, setViewMode] = useState("write"); // "write" or "preview"
  const [focusMode, setFocusMode] = useState(false); // Added focus mode state

  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [inspirationType, setInspirationType] = useState("continue");
  const [inspirationPrompt, setInspirationPrompt] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  const [showSelectionPrompt, setShowSelectionPrompt] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });
  const [selectionPrompt, setSelectionPrompt] = useState("");
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const textareaRef = useRef(null);

  // State for custom context menu
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuSelectionRange, setContextMenuSelectionRange] =
    useState(null);

  // State for comparison modal
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState({
    original: "",
    pasted: "",
  });

  // Add fileInputRef
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditMode && chapter) {
      setFormData({
        title: chapter.title || "",
        chapter_number: chapter.chapter_number || 1,
        content: chapter.content || "",
      });
    }
  }, [isEditMode, chapter]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showContextMenu]);

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
      case "paragraphSpacing":
        // Format the entire text with proper paragraph spacing
        const formattedText = text.replace(/([^\n])\n([^\n])/g, "$1\n\n$2");
        setFormData((prev) => ({ ...prev, content: formattedText }));
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start);
        }, 0);
        toast.success("Paragraph spacing applied");
        return; // Exit early since we're handling the state update differently
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

  // Combined handler for selection changes (mouse up, key up)
  const handleSelectionChange = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || viewMode !== "write") {
      setShowSelectionPrompt(false); // Hide AI prompt if not writing or no textarea
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedText = formData.content.substring(start, end);
      if (selectedText.trim()) {
        // Keep existing AI prompt logic
        setSelectionRange({ start, end });
        const textareaRect = textarea.getBoundingClientRect();
        const selectionRect = getSelectionCoords(textarea); // Make sure this function exists and works
        setSelectionPosition({
          x: selectionRect ? selectionRect.x : textareaRect.left + 100,
          y: selectionRect ? selectionRect.y - 40 : textareaRect.top - 40, // Adjust Y position
        });
        setShowSelectionPrompt(true);
      } else {
        setShowSelectionPrompt(false);
      }
    } else {
      setShowSelectionPrompt(false); // Hide AI prompt if selection is cleared
    }
    // Always hide context menu on selection change
    setShowContextMenu(false);
  }, [formData.content, viewMode]); // Add dependencies

  // Handler for right-click context menu
  const handleContextMenu = useCallback(
    (event) => {
      const textarea = textareaRef.current;
      if (!textarea || viewMode !== "write") return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Only show context menu if there's a selection
      if (start !== end) {
        event.preventDefault(); // Prevent default browser context menu
        setShowSelectionPrompt(false); // Hide AI prompt if context menu is shown
        setContextMenuPosition({ x: event.clientX, y: event.clientY });
        setContextMenuSelectionRange({ start, end }); // Store the range for later use
        setShowContextMenu(true);
      } else {
        setShowContextMenu(false); // Hide if no selection on right click
      }
    },
    [viewMode]
  ); // Add dependencies

  // *** MODIFIED: Opens the comparison modal ***
  const handlePasteForComparison = async () => {
    if (!contextMenuSelectionRange) return;

    try {
      const pastedText = await navigator.clipboard.readText();
      const { start, end } = contextMenuSelectionRange;
      const originalText = formData.content.substring(start, end);

      setComparisonData({ original: originalText, pasted: pastedText });
      setShowComparisonModal(true); // Open the modal
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      toast.error(
        "Failed to paste from clipboard. Browser permissions might be needed."
      );
    } finally {
      setShowContextMenu(false); // Hide context menu after action
      // Keep contextMenuSelectionRange, it's needed for insertion
    }
  };

  // *** NEW: Function to insert chosen text from modal ***
  const insertComparedText = (textToInsert) => {
    if (!contextMenuSelectionRange) return;

    const { start, end } = contextMenuSelectionRange;
    const currentContent = formData.content;

    const newContent =
      currentContent.substring(0, start) +
      textToInsert +
      currentContent.substring(end);

    setFormData((prev) => ({ ...prev, content: newContent }));

    // Focus and set cursor position after update
    const textarea = textareaRef.current;
    if (textarea) {
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + textToInsert.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowComparisonModal(false); // Close modal
    setContextMenuSelectionRange(null); // Clear the range
    toast.success("Text updated from comparison.");
  };

  // *** NEW: Handlers for modal buttons ***
  const handleKeepOriginal = () => {
    insertComparedText(comparisonData.original);
  };

  const handleKeepPasted = () => {
    insertComparedText(comparisonData.pasted);
  };

  const getSelectionCoords = (textarea) => {
    if (!textarea) return null;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return null; // No selection

    const properties = [
      "lineHeight",
      "paddingTop",
      "paddingLeft",
      "borderTopWidth",
      "borderLeftWidth",
      "fontFamily",
      "fontSize",
    ];
    const computedStyle = window.getComputedStyle(textarea);
    const context = document.createElement("canvas").getContext("2d");
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const textBefore = textarea.value.substring(0, start);
    const lines = textBefore.split("\n");
    const lineIndex = lines.length - 1;
    const charIndex = lines[lineIndex].length;

    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const borderTop = parseFloat(computedStyle.borderTopWidth);
    const borderLeft = parseFloat(computedStyle.borderLeftWidth);

    const x =
      paddingLeft + borderLeft + context.measureText(lines[lineIndex]).width;
    const y = paddingTop + borderTop + lineIndex * lineHeight;

    const textareaRect = textarea.getBoundingClientRect();

    return {
      x: textareaRect.left + x - textarea.scrollLeft,
      y: textareaRect.top + y - textarea.scrollTop,
    };
  };

  const processSelectedText = async () => {
    if (!selectionRange || !selectionPrompt.trim()) return;

    setIsProcessingSelection(true);

    const selectedText = formData.content.substring(
      selectionRange.start,
      selectionRange.end
    );
    const prompt = `Modify this text: "${selectedText}"\n\nInstructions: ${selectionPrompt}\n\nProvide ONLY the modified text, no explanations.`;

    try {
      const result = await getWritingInspiration(prompt);
      if (result) {
        const modifiedText = result.trim();

        const newContent =
          formData.content.substring(0, selectionRange.start) +
          modifiedText +
          formData.content.substring(selectionRange.end);

        setFormData((prev) => ({ ...prev, content: newContent }));
        toast.success("Text modified successfully");
      }
    } catch (error) {
      console.error("Error processing text:", error);
      toast.error("Failed to process text");
    } finally {
      setIsProcessingSelection(false);
      setShowSelectionPrompt(false);
      setSelectionPrompt("");
    }
  };

  const countWords = (text) => {
    if (!text || text.trim() === "") return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      // Use the hook function to upload the image
      const imageUrl = await uploadChapterImage(file);

      // Insert the markdown with the image URL at cursor position
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = formData.content.substring(start, end) || "Image";

      const imageMarkdown = `![${selectedText}](${imageUrl})`;
      const newText =
        formData.content.substring(0, start) +
        imageMarkdown +
        formData.content.substring(end);

      setFormData((prev) => ({ ...prev, content: newText }));

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
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

  const contentEditorSection =
    viewMode === "write" ? (
      <div className={`flex flex-col ${focusMode ? "focus-mode" : ""}`}>
        <textarea
          id="content"
          name="content"
          rows={focusMode ? 30 : 20} // More rows in focus mode
          required
          ref={textareaRef}
          className={`w-full px-3 py-2 border ${
            focusMode ? "border-0 shadow-none" : "border-gray-300"
          } rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary font-mono ${
            focusMode ? "h-[80vh]" : "lg:min-h-[600px]"
          }`}
          placeholder={
            focusMode
              ? "Write freely..."
              : "Write your chapter content here using Markdown..."
          }
          value={formData.content}
          onChange={handleChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onContextMenu={handleContextMenu}
          style={focusMode ? { fontSize: "1.1rem", lineHeight: "1.7" } : {}}
        />
        {!focusMode && (
          <div className="mt-2 flex justify-between items-center">
            <div className="text-xs">
              Use Markdown syntax for formatting: **bold**, *italic*,
              [links](url), etc.
            </div>
            <div className="text-sm font-medium">
              {countWords(formData.content).toLocaleString()} words
            </div>
          </div>
        )}
      </div>
    ) : (
      <div className="flex flex-col">
        <div className="w-full h-[500px] lg:h-[600px] overflow-y-auto border border-gray-300 rounded-b-md p-4 prose prose-lg max-w-none bg-base-100">
          {" "}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {formData.content || "Preview will appear here..."}
          </ReactMarkdown>
        </div>
        <div className="mt-2 text-right text-sm font-medium">
          {countWords(formData.content).toLocaleString()} words
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen ${focusMode ? "bg-base-100" : ""}`}>
      {/* Only show header when not in focus mode */}
      {!focusMode ? (
        <>
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
              <div className="mb-8">
                <Link
                  to={`/novel/${novelId}/chapters`}
                  className="flex items-center text-primary hover:underline"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Chapters
                </Link>
              </div>
              {/* Rest of the regular UI */}
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
                          onClick={() =>
                            insertMarkdown("italic", "italic text")
                          }
                          className="p-1 hover:bg-base-100 rounded"
                          title="Italic"
                        >
                          <Italic size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertMarkdown("unorderedList", "list item")
                          }
                          className="p-1 hover:bg-base-100 rounded"
                          title="Bullet List"
                        >
                          <List size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertMarkdown("orderedList", "list item")
                          }
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
                          onClick={() => insertMarkdown("paragraphSpacing")}
                          className="p-1 hover:bg-base-100 rounded"
                          title="Format Paragraph Spacing"
                        >
                          <AlignJustify size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowInspirationModal(true)}
                          className="p-1 hover:bg-base-100 rounded text-indigo-500"
                          title="Get AI Inspiration"
                        >
                          <Sparkles size={18} />
                        </button>
                        {/* File input (hidden) */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        {/* Replace your existing image button with this */}
                        <button
                          type="button"
                          onClick={handleImageButtonClick}
                          className="p-1 hover:bg-base-100 rounded"
                          title="Upload Image"
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Image size={18} />
                          )}
                        </button>
                        <div className="flex-grow"></div>
                        <button
                          type="button"
                          onClick={() => setFocusMode(!focusMode)}
                          className={`p-1 px-2 mr-2 rounded ${
                            focusMode
                              ? "bg-primary text-primary-content"
                              : "hover:bg-base-100"
                          }`}
                          title={
                            focusMode ? "Exit focus mode" : "Enter focus mode"
                          }
                        >
                          {focusMode ? (
                            <Eye size={18} className="inline" />
                          ) : (
                            <Eye size={18} className="inline" />
                          )}
                          {!focusMode && <span className="ml-1">Focus</span>}
                        </button>
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
                      {contentEditorSection}
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
          </div>
        </>
      ) : (
        // Simplified UI for focus mode
        <div className="fixed inset-0 flex flex-col bg-base-100 z-50">
          {/* Minimal header for focus mode */}
          <div className="p-4 bg-base-100 shadow-sm flex justify-between items-center">
            <h2 className="text-xl font-medium">
              {formData.title || "Writing..."}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm opacity-70">
                {countWords(formData.content).toLocaleString()} words
              </div>
              <button
                onClick={() => setFocusMode(false)}
                className="btn btn-sm"
                title="Exit focus mode"
              >
                Exit Focus Mode
              </button>
            </div>
          </div>

          {/* Just the editor in focus mode */}
          <div className="flex-grow p-4 mx-auto w-full max-w-4xl">
            {viewMode === "write" ? (
              <textarea
                id="content-focus"
                name="content"
                className="w-full h-full p-6 text-lg border-none focus:outline-none focus:ring-0 bg-base-100 font-serif"
                value={formData.content}
                onChange={handleChange}
                onKeyUp={handleSelectionChange}
                placeholder="Start writing..."
                ref={textareaRef}
                style={{ lineHeight: "1.7" }}
              />
            ) : (
              // Preview in focus mode
              <div className="w-full h-full overflow-y-auto p-6 prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {formData.content || "Preview will appear here..."}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always include modals regardless of mode */}
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

      {/* Custom Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-base-100 shadow-lg rounded-md border border-base-300 p-1 text-sm"
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handlePasteForComparison}
            className="flex items-center w-full px-3 py-1 hover:bg-base-200 rounded"
          >
            <ClipboardPaste size={14} className="mr-2" />
            Paste for Comparison
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparisonModal}
        onClose={() => {
          setShowComparisonModal(false);
          setContextMenuSelectionRange(null);
        }}
        originalText={comparisonData.original}
        pastedText={comparisonData.pasted}
        onKeepOriginal={handleKeepOriginal}
        onKeepPasted={handleKeepPasted}
      />

      {showSelectionPrompt && (
        <div
          className="fixed z-50 bg-base-100 shadow-lg rounded-lg border border-primary p-2 flex flex-col"
          style={{
            top: `${selectionPosition.y}px`,
            left: `${selectionPosition.x}px`,
            maxWidth: "300px",
          }}
        >
          <div className="flex items-center gap-1 mb-2 text-xs font-medium text-primary">
            <Wand2 size={14} />
            Modify selected text
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              className="input input-bordered input-sm flex-grow"
              placeholder="Instruction for Gemini..."
              value={selectionPrompt}
              onChange={(e) => setSelectionPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  processSelectedText();
                }
                e.stopPropagation();
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={processSelectedText}
              disabled={isProcessingSelection}
            >
              {isProcessingSelection ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowSelectionPrompt(false)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterForm;
