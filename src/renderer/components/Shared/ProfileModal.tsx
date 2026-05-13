// src/renderer/components/Shared/ProfileViewDialog.tsx
import React from 'react';
import { User, LogOut, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useProfileView } from '../../hooks/useProfileView';
import Modal from '../UI/Modal';

interface ProfileViewDialogProps {
  hook: ReturnType<typeof useProfileView>;
}

const ProfileViewDialog: React.FC<ProfileViewDialogProps> = ({ hook }) => {
  const {
    isOpen,
    loading,
    loggedIn,
    userInfo,
    close,
    handleSignOut,
    handleReauth,
  } = hook;

  return (
    <Modal isOpen={isOpen} onClose={close} title="Account" size="sm">
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
        </div>
      ) : !loggedIn ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#272727] flex items-center justify-center mb-3">
            <User size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-400 mb-4">Not signed in to YouTube</p>
          <button
            onClick={handleReauth}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition"
          >
            <RefreshCw size={16} />
            Sign in with YouTube
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {userInfo?.avatar ? (
              <img src={userInfo.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#272727] flex items-center justify-center">
                <User size={24} className="text-gray-300" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-white">{userInfo?.name || 'YouTube User'}</p>
              {userInfo?.email && <p className="text-xs text-gray-400">{userInfo.email}</p>}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                  <CheckCircle size={10} /> Signed in
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#272727] pt-3 space-y-2">
            <button
              onClick={handleReauth}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-[#272727] transition text-sm text-gray-300"
            >
              <RefreshCw size={16} /> Re‑authenticate
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-[#272727] transition text-sm text-red-400"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProfileViewDialog;