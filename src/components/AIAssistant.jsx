import React, { useState, useRef, useEffect } from "react";
import { Bot, X, MessageSquare, Send } from "lucide-react";
import { chatWithAgent } from "../services/geminiService";

export default function AIAssistant({ contextData, role = "reader" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const replyText = await chatWithAgent(
      userMessage.content,
      messages,
      contextData,
      role,
    );

    if (replyText) {
      setMessages([...newMessages, { role: "model", content: replyText }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 p-4 rounded-full bg-primary text-primary-content shadow-lg hover:shadow-xl transition-all z-50 ${isOpen ? "hidden" : "flex"}`}
        title="AI Assistant"
      >
        <Bot size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 left-6 w-80 md:w-96 bg-base-100 shadow-2xl rounded-2xl border border-base-300 flex flex-col z-50 overflow-hidden"
          style={{ height: "500px", maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="bg-primary text-primary-content p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-bold">
                {role === "author" ? "Author Copilot" : "Reader Guide"}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm btn-square text-primary-content"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-base-200">
            {messages.length === 0 ? (
              <div className="text-center text-base-content/60 mt-10">
                <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
                <p>
                  Hi! I'm here to help you{" "}
                  {role === "author"
                    ? "write and edit"
                    : "explore and understand"}{" "}
                  this novel.
                </p>
                <p className="text-sm mt-2">Ask me anything!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                  >
                    <div
                      className={`chat-bubble ${msg.role === "user" ? "chat-bubble-primary" : "chat-bubble-secondary"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="chat chat-start">
                    <div className="chat-bubble chat-bubble-secondary opacity-70">
                      <span className="loading loading-dots loading-sm"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-base-100 border-t border-base-300">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="input input-bordered flex-1"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-square"
                disabled={!input.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
