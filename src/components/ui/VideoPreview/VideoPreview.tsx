import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import clsx from 'clsx';
import {Play} from 'lucide-react';
import styles from './VideoPreview.module.scss';

interface VideoPreviewProps {
    src: string;
    poster: string;
    label: string;
    aspectRatio?: string;
}

export function VideoPreview({src, poster, label, aspectRatio = '16 / 9'}: VideoPreviewProps) {
    const [open, setOpen] = useState(false);
    const [previewReady, setPreviewReady] = useState(false);
    const [hovering, setHovering] = useState(false);
    const preloadRef = useRef<HTMLVideoElement | null>(null);
    const previewRef = useRef<HTMLVideoElement | null>(null);

    const ratioStyle = {'--ratio': aspectRatio} as CSSProperties;

    const preloadVideo = useCallback(() => {
        if (preloadRef.current) return;
        const video = document.createElement('video');
        video.preload = 'auto';
        video.muted = true;
        video.src = src;
        video.addEventListener('canplaythrough', () => setPreviewReady(true), {once: true});
        video.load();
        preloadRef.current = video;
    }, [src]);

    const handleEnter = useCallback(() => {
        preloadVideo();
        if (!window.matchMedia('(hover: hover)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
            if (event.key === 'Escape') setOpen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const overlay = open && (
        <div
            className={styles.overlay}
            onClick={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
            }}
        >
            <div role="dialog" aria-modal="true" aria-label={label} className={styles.player} style={ratioStyle}>
                <video src={src} poster={poster} controls autoPlay playsInline aria-label={label} />
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
                className={styles.preview}
                style={ratioStyle}
            >
                <img src={poster} alt="" loading="lazy" decoding="async" className={styles.media} />
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
                        className={clsx(styles.media, styles.video, previewing && styles.videoVisible)}
                    />
                )}
                <span aria-hidden="true" className={styles.gradient} />
                <span aria-hidden="true" className={styles.badge}>
                    <Play size={12} fill="currentColor" />
                    Watch demo
                </span>
            </button>
            {overlay ? createPortal(overlay, document.body) : null}
        </>
    );
}
