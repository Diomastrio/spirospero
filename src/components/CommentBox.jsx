import React, { useEffect, useRef } from "react";
import { useThemeStore } from "../store/useThemeStore";

function CommentBox({ pageId }) {
  const commentBoxRef = useRef();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Load the CommentBox.io script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://unpkg.com/commentbox.io/dist/commentBox.min.js";
    document.body.appendChild(script);

    // Initialize CommentBox once the script is loaded
    script.onload = () => {
      if (window.commentBox) {
        window.commentBox(import.meta.env.VITE_COMMENTBOX_PROJECT_ID, {
          className: "commentbox",
          defaultBoxId: pageId, // Use chapter-specific identifier
          backgroundColor: "transparent", // Let our CSS handle background
          textColor: "inherit", // Use the current text color from theme
          // Add theme as a data attribute that CSS can use
          createBoxUrl(boxId, pageLocation) {
            return `${pageLocation.origin}${pageLocation.pathname}?theme=${theme}#${boxId}`;
          },
        });
      }
    };

    // Cleanup function
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (window.commentBox) {
        window.commentBox(import.meta.env.VITE_COMMENTBOX_PROJECT_ID, {
          className: "commentbox",
          defaultBoxId: pageId,
          operation: "destroy",
        });
      }
    };
  }, [pageId, theme]); // Add theme as dependency to re-initialize when theme changes

  return (
    <div
      ref={commentBoxRef}
      className="commentbox rounded-lg bg-base-200 p-6 shadow-lg mt-8"
      data-theme={theme} // Add theme as data attribute
    />
  );
}

export default CommentBox;
