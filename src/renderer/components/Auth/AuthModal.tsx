// src/renderer/components/Auth/AuthModal.tsx
import React, { useEffect, useState } from "react";
import { X, Copy, Check, QrCode, Keyboard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = "qr" | "manual";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending",
  );
  const [activeTab, setActiveTab] = useState<TabType>("qr");

  // Buuin ang kumpletong URL para sa QR code
  const getQRValue = () => {
    if (!verificationUrl) return null;
    if (!userCode) return verificationUrl;
    // Siguruhing may tamang separator
    const separator = verificationUrl.includes("?") ? "&" : "?";
    return `${verificationUrl}${separator}user_code=${userCode}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    window.backendAPI.youtubeAuthenticate().catch(console.error);

    const removePending = window.backendAPI.on("auth:pending", (_, data) => {
      setVerificationUrl(data.verificationUrl);
      setUserCode(data.userCode);
      setStatus("pending");
    });

    const removeSuccess = window.backendAPI.on(
      "auth:success",
      (_, credentials) => {
        console.log("Auth success:", credentials);
        setStatus("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      },
    );

    const removeError = window.backendAPI.on("auth:error", (_, err) => {
      console.error("Auth error:", err);
      setStatus("error");
    });

    return () => {
      removePending();
      removeSuccess();
      removeError();
    };
  }, [isOpen, onSuccess, onClose]);

  const copyToClipboard = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInBrowser = () => {
    if (verificationUrl) {
      if (window.backendAPI.openExternal) {
        window.backendAPI.openExternal(verificationUrl);
      } else {
        window.open(verificationUrl, "_blank");
      }
    }
  };

  if (!isOpen) return null;

  const qrValue = getQRValue();

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-xl max-w-md w-full p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Sign in to YouTube</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {status === "pending" && verificationUrl && (
          <>
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === "qr"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <QrCode size={16} />
                QR Code
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === "manual"
                    ? "text-red-500 border-b-2 border-red-500"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Keyboard size={16} />
                Manual Code
              </button>
            </div>

            {activeTab === "qr" && (
              <div>
                <p className="text-gray-300 mb-4 text-center">
                  I‑scan ang QR code gamit ang iyong phone. Diretso ka na sa
                  pagpili ng account.
                </p>
                {qrValue && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-3 rounded-xl">
                      <QRCodeSVG value={qrValue} size={180} />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Kung hindi gumana, subukan ang "Manual Code".
                </p>
              </div>
            )}

            {activeTab === "manual" && (
              <div>
                <p className="text-gray-300 mb-4">
                  I-click ang link sa ibaba o kaya ay ilagay ang code nang
                  manu-mano:
                </p>
                <div className="bg-[#0f0f0f] p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-400 mb-1">
                    Verification URL (may kasamang code):
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const fullUrl = getQRValue(); // gamitin ang buong URL
                        if (fullUrl) {
                          if (window.backendAPI.openExternal) {
                            window.backendAPI.openExternal(fullUrl);
                          } else {
                            window.open(fullUrl, "_blank");
                          }
                        }
                      }}
                      className="text-blue-400 text-sm break-all flex-1 hover:underline"
                    >
                      {getQRValue() || verificationUrl}
                    </a>
                    <button
                      onClick={() => {
                        const fullUrl = getQRValue();
                        if (fullUrl) {
                          navigator.clipboard.writeText(fullUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="p-1 hover:bg-[#272727] rounded"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-400 mb-1">
                    Your code (kung kailangan manu-mano):
                  </p>
                  <p className="text-2xl font-mono font-bold text-white tracking-wider">
                    {userCode}
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  I-click ang link sa itaas para direktang pumili ng account.
                </p>
              </div>
            )}
          </>
        )}

        {status === "pending" && !verificationUrl && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-white" />
            </div>
            <p className="text-white font-medium">Successfully signed in!</p>
            <p className="text-gray-400 text-sm mt-1">Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-6">
            <p className="text-red-500">
              Authentication failed. Please try again.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-red-600 rounded-full text-white text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
