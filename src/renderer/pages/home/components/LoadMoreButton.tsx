// src/renderer/pages/home/components/LoadMoreButton.tsx
import React from 'react';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, loading }) => {
  return (
    <div className="flex justify-center mt-8 mb-12">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-6 py-2 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-white text-sm transition disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Loading...
          </div>
        ) : (
          'Load more'
        )}
      </button>
    </div>
  );
};

export default LoadMoreButton;