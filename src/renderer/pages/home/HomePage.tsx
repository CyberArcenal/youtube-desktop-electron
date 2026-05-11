// src/renderer/pages/home/HomePage.tsx
import React from 'react';
import VideoGrid from '../../components/Shared/VideoGrid';
import { AuthModal } from '../../components/Auth/AuthModal';
import { useHomeFeed } from './hooks/useHomeFeed';
import SkeletonGrid from './components/SkeletonGrid';
import LoginPrompt from './components/LoginPrompt';
import TrendingBanner from './components/TrendingBanner';
import LoadMoreButton from './components/LoadMoreButton';
import ScrollToTopButton from './components/ScrollToTopButton';

const HomePage: React.FC = () => {
  const {
    videos,
    loading,
    loadingMore,
    error,
    loggedIn,
    hasMore,
    showLoginPrompt,
    setShowLoginPrompt,
    showAuthModal,
    setShowAuthModal,
    onAuthSuccess,
    loadMore,
    retry,
  } = useHomeFeed();

  if (loading && videos.length === 0) return <SkeletonGrid />;

  if (error && videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={retry} className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white">
          Retry
        </button>
      </div>
    );
  }

  if (!loggedIn && videos.length === 0 && !showLoginPrompt && !loading) {
    return <LoginPrompt onSignIn={() => setShowLoginPrompt(true)} />;
  }

  if (showLoginPrompt && !loggedIn) {
    return (
      <LoginPrompt
        onSignIn={() => setShowAuthModal(true)}
        message="You'll need to authenticate with your Google account"
      />
    );
  }

  return (
    <div className="relative">
      {!loggedIn && <TrendingBanner onSignInClick={() => setShowAuthModal(true)} />}
      <VideoGrid videos={videos} title={loggedIn ? 'Recommended for you' : 'Trending now'} />
      {hasMore && videos.length > 0 && <LoadMoreButton onClick={loadMore} loading={loadingMore} />}
      {videos.length > 10 && <ScrollToTopButton />}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={onAuthSuccess} />
    </div>
  );
};

export default HomePage;