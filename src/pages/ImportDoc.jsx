import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  ClipboardPaste,
  Edit,
  Eye,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image,
  Code,
  Sparkles,
  AlignLeft,
  Wand2,
  X,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getWritingInspiration } from "../services/geminiService";
import { getChatGPTInspiration } from "../services/openaiService";

function ImportDoc() {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [viewMode, setViewMode] = useState("edit"); // 'edit' or 'preview'
  const [modelType, setModelType] = useState("gemini"); // 'gemini' or 'chatgpt'
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [inspirationType, setInspirationType] = useState("continue");
  const [inspirationPrompt, setInspirationPrompt] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [isLoadingInspiration, setIsLoadingInspiration] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handlePaste = async (event) => {
    try {
      const pastedText = await navigator.clipboard.readText();
      setContent(pastedText);
      setFileName("Pasted Content");
      toast.success("Content pasted from clipboard.");
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      toast.error(
        "Failed to paste from clipboard. Browser permissions might be needed, or try pasting directly into the text area."
      );
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Basic check for text files
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target.result);
          setFileName(file.name);
          toast.success(`File "${file.name}" loaded.`);
        };
        reader.onerror = (e) => {
          console.error("File reading error:", e);
          toast.error("Failed to read the file.");
        };
        reader.readAsText(file);
      } else {
        toast.error(
          "Invalid file type. Please upload a plain text file (.txt)."
        );
      }
      // Reset file input value so the same file can be loaded again if needed
      event.target.value = null;
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const insertMarkdown = (tag, placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
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
    setContent(newText);

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
    if (!inspirationPrompt && inspirationType === "custom") {
      toast.error("Please enter a custom prompt first");
      return;
    }

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
      // Use the selected model
      let result;
      if (modelType === "gemini") {
        result = await getWritingInspiration(prompt, content);
      } else {
        result = await getChatGPTInspiration(prompt, content);
      }

      if (result) {
        setInspiration(result);
        setIsLoadingInspiration(false);
      }
    } catch (error) {
      console.error("Error getting inspiration:", error);
      toast.error("Failed to generate inspiration. Please try again later.");
      setIsLoadingInspiration(false);
    }
  };

  const insertInspiration = () => {
    if (!inspiration) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionEnd;
    const newContent =
      content.substring(0, cursorPos) +
      "\n\n" +
      inspiration +
      "\n\n" +
      content.substring(cursorPos);

    setContent(newContent);
    setShowInspirationModal(false);
    setInspiration("");
    toast.success("Inspiration added to your document");
  };

  // Placeholder for saving logic
  const handleSave = () => {
    // TODO: Implement saving logic
    // - Where should this content be saved? (New novel, chapter, etc.)
    // - Call appropriate mutation/API
    console.log("Saving content:", content);
    toast.info("Save functionality not yet implemented.");
  };

  const editorView = (
    <>
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

        {/* Model Selection */}
        <div className="ml-auto flex items-center space-x-2">
          <span className="text-xs font-medium">AI Model:</span>
          <div className="join">
            <button
              className={`join-item btn btn-xs ${
                modelType === "gemini" ? "btn-active" : ""
              }`}
              onClick={() => setModelType("gemini")}
            >
              <Wand2 size={12} className="mr-1" />
              Gemini
            </button>
            <button
              className={`join-item btn btn-xs ${
                modelType === "chatgpt" ? "btn-active" : ""
              }`}
              onClick={() => setModelType("chatgpt")}
            >
              <AlignLeft size={12} className="mr-1" />
              ChatGPT
            </button>
          </div>
        </div>
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        className="w-full h-96 px-3 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary font-mono bg-base-100"
        placeholder="Paste content here or upload a .txt file..."
        value={content}
        onChange={handleContentChange}
      />
    </>
  );

  const previewView = (
    <div className="w-full h-96 overflow-y-auto border border-gray-300 rounded-md p-4 prose prose-lg max-w-none bg-base-100">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "Preview will appear here..."}
      </ReactMarkdown>
    </div>
  );

  const inspirationModal = showInspirationModal && (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Get AI Inspiration</h3>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Prompt:</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={inspirationPrompt}
            onChange={(e) => setInspirationPrompt(e.target.value)}
            placeholder="Enter your custom prompt here..."
          ></textarea>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={() => setShowInspirationModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGetInspiration}
            disabled={isLoadingInspiration}
          >
            {isLoadingInspiration ? "Loading..." : "Generate Inspiration"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Import & Edit Document
        </h1>

        <div className="bg-base-200 rounded-xl p-8 shadow-lg">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={triggerFileSelect}
              className="btn btn-outline btn-primary flex-1"
            >
              <Upload size={18} className="mr-2" /> Upload .txt File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,text/plain"
              className="hidden"
            />
            <button
              onClick={handlePaste}
              className="btn btn-outline btn-secondary flex-1"
            >
              <ClipboardPaste size={18} className="mr-2" /> Paste from Clipboard
            </button>
          </div>

          {fileName && (
            <div className="mb-4 text-sm text-center opacity-80">
              <FileText size={14} className="inline mr-1" /> Loaded:{" "}
              <span className="font-medium">{fileName}</span>
            </div>
          )}

          {/* Editor/Preview Toggle */}
          <div className="flex mb-2 justify-end">
            <div className="tabs tabs-boxed">
              <button
                onClick={() => setViewMode("edit")}
                className={`tab ${viewMode === "edit" ? "tab-active" : ""}`}
              >
                <Edit size={16} className="mr-1" /> Edit
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`tab ${viewMode === "preview" ? "tab-active" : ""}`}
              >
                <Eye size={16} className="mr-1" /> Preview
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="mb-6">
            {viewMode === "edit" ? editorView : previewView}
          </div>

          {/* Instructions */}
          <div className="text-xs opacity-70 mb-6 p-3 bg-base-300 rounded-md">
            <p className="font-semibold mb-1">How to Import:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Upload:</strong> Export your Google Doc as a Plain Text
                (.txt) file and upload it using the button above.
              </li>
              <li>
                <strong>Paste:</strong> Copy the content from your Google Doc
                (Ctrl+C or Cmd+C) and use the "Paste" button or paste directly
                (Ctrl+V or Cmd+V) into the text area.
              </li>
            </ul>
          </div>

          {/* Save Button (Placeholder) */}
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn btn-primary">
              Save Content (Not Implemented)
            </button>
          </div>
        </div>

        {/* Include the inspiration modal */}
        {inspirationModal}
      </div>
    </div>
  );
}

export default ImportDoc;
