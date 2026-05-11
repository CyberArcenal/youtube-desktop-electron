// src/renderer/pages/home/components/TrendingBanner.tsx
import React from 'react';

interface TrendingBannerProps {
  onSignInClick: () => void;
}

const TrendingBanner: React.FC<TrendingBannerProps> = ({ onSignInClick }) => {
  return (
    <div className="mb-4 p-3 bg-yellow-900/30 text-yellow-500 rounded-lg text-sm flex justify-between items-center">
      <span>
        Showing trending videos.{' '}
        <button onClick={onSignInClick} className="underline">
          Sign in
        </button>{' '}
        for your personalized feed.
      </span>
    </div>
  );
};

export default TrendingBanner;