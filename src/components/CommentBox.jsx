import React, { useEffect, useRef } from "react";

function CommentBox({ pageId }) {
  const commentBoxRef = useRef();

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
        });
      }
    };

    // Cleanup function
    return () => {
      document.body.removeChild(script);
      if (window.commentBox) {
        window.commentBox(import.meta.env.VITE_COMMENTBOX_PROJECT_ID, {
          className: "commentbox",
          defaultBoxId: pageId,
          operation: "destroy",
        });
      }
    };
  }, [pageId]);

  return (
    <div
      ref={commentBoxRef}
      className="commentbox rounded-lg bg-base-200 p-6 shadow-lg mt-8"
    />
  );
}

export default CommentBox;
