// src/renderer/pages/home/components/SkeletonGrid.tsx
import React from 'react';

const SkeletonGrid: React.FC = () => {
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-[#272727] aspect-video rounded-xl"></div>
            <div className="mt-2 h-4 bg-[#272727] rounded w-3/4"></div>
            <div className="mt-1 h-3 bg-[#272727] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;