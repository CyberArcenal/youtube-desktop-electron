// src/renderer/pages/home/components/LoginPrompt.tsx
import React from 'react';

interface LoginPromptProps {
  onSignIn: () => void;
  message?: string;
}

const LoginPrompt: React.FC<LoginPromptProps> = ({ onSignIn, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-gray-400 mb-4">{message || 'Sign in to see your personalized home feed'}</p>
      <button
        onClick={onSignIn}
        className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-medium"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginPrompt;