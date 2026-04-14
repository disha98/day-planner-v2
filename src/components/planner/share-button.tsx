"use client";

import { useState, useCallback } from "react";
import { Share2, Copy, Check, Link2Off } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export function ShareButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpen = useCallback(async () => {
    setLoading(true);
    setModalOpen(true);
    try {
      // Check for existing share first
      const checkRes = await fetch("/api/share");
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.isActive) {
          setShareUrl(
            `${window.location.origin}/share/${checkData.token}`
          );
          setIsActive(true);
          setLoading(false);
          return;
        }
      }
      // Create new share
      const res = await fetch("/api/share", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setShareUrl(`${window.location.origin}/share/${data.token}`);
        setIsActive(true);
      } else {
        console.error("Share API error:", data);
      }
    } catch (err) {
      console.error("Share fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const handleStopSharing = useCallback(async () => {
    await fetch("/api/share", { method: "DELETE" });
    setIsActive(false);
    setShareUrl(null);
    setModalOpen(false);
  }, []);

  const handleClose = useCallback(() => {
    setModalOpen(false);
    setCopied(false);
  }, []);

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-1.5 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm cursor-pointer"
      >
        <Share2 size={13} />
        Share
      </button>

      <Modal open={modalOpen} onClose={handleClose} title="Share Calendar">
        {loading ? (
          <div className="py-4 text-center text-sm text-stone-400">
            Creating share link...
          </div>
        ) : isActive && shareUrl ? (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              Anyone with this link can view your calendar (read-only).
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-sm border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 text-stone-600 select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                  copied
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              onClick={handleStopSharing}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-red-500 transition-colors"
            >
              <Link2Off size={12} />
              Stop sharing
            </button>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-stone-400">
            Failed to create share link. Please try again.
          </div>
        )}
      </Modal>
    </>
  );
}
