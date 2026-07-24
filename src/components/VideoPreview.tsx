import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play } from "lucide-react";

interface VideoPreviewProps {
  src: string;
  poster: string;
  label: string;
}

/**
 * The tabularis.dev hero video treatment: a poster that plays a muted inline
 * preview on hover and opens a full-screen player on click.
 */
export function VideoPreview({ src, poster, label }: VideoPreviewProps) {
  const [open, setOpen] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [hovering, setHovering] = useState(false);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);

  const preloadVideo = useCallback(() => {
    if (preloadRef.current) return;
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.src = src;
    video.addEventListener("canplaythrough", () => setPreviewReady(true), {
      once: true,
    });
    video.load();
    preloadRef.current = video;
  }, [src]);

  const handleEnter = useCallback(() => {
    preloadVideo();
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setHovering(true);
  }, [preloadVideo]);

  const previewing = hovering && previewReady && !open;

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    if (previewing) {
      video.play().catch(() => {});
      return;
    }
    video.pause();
    video.currentTime = 0;
  }, [previewing]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const overlay = open && (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="w-full max-w-4xl overflow-hidden rounded-xl border border-default bg-elevated shadow-2xl"
      >
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          className="block h-auto w-full"
          aria-label={label}
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={handleEnter}
        onPointerLeave={() => setHovering(false)}
        onFocus={preloadVideo}
        onTouchStart={preloadVideo}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className="group relative block w-full overflow-hidden rounded-lg border border-default focus:outline-none focus:ring-2 focus:ring-focus"
      >
        <img src={poster} alt="" className="block w-full" loading="lazy" />
        {previewReady && (
          <video
            ref={previewRef}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              previewing ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors group-hover:bg-accent-primary"
        >
          <Play size={12} fill="currentColor" />
          Watch demo
        </span>
      </button>
      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
