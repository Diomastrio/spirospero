import { toast } from "react-toastify";

export default formatParagraphSpacing = () => {
  const textarea = document.getElementById("content");
  if (!textarea) return;

  const start = textarea.selectionStart;
  const text = formData.content;

  // Add double line breaks between paragraphs
  // This regex looks for single line breaks and converts them to double line breaks
  const formattedText = text.replace(/([^\n])\n([^\n])/g, "$1\n\n$2");

  setFormData((prev) => ({ ...prev, content: formattedText }));

  // Set cursor position after formatting
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start, start);
  }, 0);

  toast.success("Paragraph spacing applied");
};
