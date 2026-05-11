// src/renderer/pages/watch/components/ReplyInput.tsx
import React, { useState } from "react";

interface ReplyInputProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export const ReplyInput: React.FC<ReplyInputProps> = ({ onSubmit, onCancel }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 bg-[#272727] text-white rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm transition"
      >
        Reply
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 bg-[#3f3f3f] hover:bg-[#4f4f4f] rounded-full text-white text-sm transition"
      >
        Cancel
      </button>
    </div>
  );
};