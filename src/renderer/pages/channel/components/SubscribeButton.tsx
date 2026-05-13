// src/renderer/pages/channel/components/SubscribeButton.tsx
import React from 'react';
import { Bell, BellOff } from 'lucide-react';

interface SubscribeButtonProps {
  isSubscribed: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const SubscribeButton: React.FC<SubscribeButtonProps> = ({
  isSubscribed,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}
        ${
          isSubscribed
            ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
            : 'bg-red-600 text-white hover:bg-red-700'
        }
      `}
    >
      {isSubscribed ? (
        <>
          <BellOff size={16} />
          Subscribed
        </>
      ) : (
        <>
          <Bell size={16} />
          Subscribe
        </>
      )}
    </button>
  );
};