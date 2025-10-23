'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
export default function VideoPlayer({ data, className, loop = true, muted = true, autoPlay = true, }) {
    if (!data?.video)
        return null;
    const [inView, setInView] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const videoRef = useRef(null);
    const posterRef = useRef(null);
    const [active, setActive] = useState(false);
    const [showPoster, setShowPoster] = useState(false);
    const [quality, setQuality] = useState('high');
    useEffect(() => {
        setActive(inView);
    }, [inView]);
    useEffect(() => {
        if (!videoRef.current)
            return;
        if (active)
            videoRef.current.play().catch((err) => { });
        else
            videoRef.current.pause();
    }, [active, quality, videoRef]);
    useEffect(() => {
        if (!videoRef.current)
            return;
        const loadedData = () => setHasAudio(videoHasAudio(videoRef.current));
        const canPlay = () => {
            setShowPoster(false);
        };
        videoRef.current.addEventListener('loadeddata', loadedData);
        videoRef.current.addEventListener('canplay', canPlay);
        // Check if video is in view
        const observer = new IntersectionObserver(([entry]) => {
            setInView(entry.isIntersecting);
        }, { threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] });
        observer.observe(videoRef.current);
        return () => {
            videoRef.current?.removeEventListener('loadeddata', loadedData);
            videoRef.current?.removeEventListener('canplay', canPlay);
            observer.disconnect();
        };
    }, [active, videoRef]);
    useEffect(() => {
        clearTimeout(posterRef.current);
        posterRef.current = setTimeout(() => setShowPoster(true), 1000);
    }, [showPoster, videoRef]);
    return (_jsx("video", { ref: videoRef, src: quality ? data.video[`mp4${quality}`] : data.video.streamingUrl, className: className, muted: muted, loop: loop, autoPlay: autoPlay, playsInline: true, disablePictureInPicture: true, poster: showPoster ? `${data.video?.thumbnailUrl}?time=0` : undefined }));
}
const videoHasAudio = (video) => {
    if (!video)
        return false;
    return (video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount) ||
        Boolean(video.audioTracks?.length));
};
//# sourceMappingURL=VideoPlayer.js.map