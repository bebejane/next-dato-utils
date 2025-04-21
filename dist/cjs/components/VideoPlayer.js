"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VideoPlayer;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function VideoPlayer({ data, className, loop = true, muted = true, autoPlay = true }) {
    if (!data?.video)
        return null;
    const [inView, setInView] = (0, react_1.useState)(false);
    const [hasAudio, setHasAudio] = (0, react_1.useState)(false);
    const videoRef = (0, react_1.useRef)(null);
    const posterRef = (0, react_1.useRef)(null);
    const muteRef = (0, react_1.useRef)(null);
    const [active, setActive] = (0, react_1.useState)(false);
    const [showPoster, setShowPoster] = (0, react_1.useState)(false);
    const [quality, setQuality] = (0, react_1.useState)('high');
    (0, react_1.useEffect)(() => { setActive(inView); }, [inView]);
    (0, react_1.useEffect)(() => {
        if (!videoRef.current)
            return;
        if (active)
            videoRef.current.play().catch((err) => { });
        else
            videoRef.current.pause();
    }, [active, quality, videoRef]);
    (0, react_1.useEffect)(() => {
        if (!videoRef.current)
            return;
        const loadedData = () => setHasAudio(videoHasAudio(videoRef.current));
        const canPlay = () => { setShowPoster(false); };
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
    (0, react_1.useEffect)(() => {
        clearTimeout(posterRef.current);
        posterRef.current = setTimeout(() => setShowPoster(true), 1000);
    }, [showPoster, videoRef]);
    return ((0, jsx_runtime_1.jsx)("video", { ref: videoRef, src: quality ? data.video[`mp4${quality}`] : data.video.streamingUrl, className: className, muted: muted, loop: loop, autoPlay: autoPlay, playsInline: true, disablePictureInPicture: true, poster: showPoster ? `${data.video?.thumbnailUrl}?time=0` : undefined }));
}
const videoHasAudio = (video) => {
    if (!video)
        return false;
    return (video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount) ||
        Boolean(video.audioTracks?.length));
};
//# sourceMappingURL=VideoPlayer.js.map