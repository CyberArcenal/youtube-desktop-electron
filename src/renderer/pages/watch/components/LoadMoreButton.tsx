// src/renderer/pages/watch/components/LoadMoreButton.tsx
import React from "react";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, loading }) => {
  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-5 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-white text-sm transition disabled:opacity-50"
      >
        {loading ? "Loading..." : "Load more comments"}
      </button>
    </div>
  );
};