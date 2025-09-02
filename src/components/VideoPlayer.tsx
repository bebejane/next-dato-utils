'use client';

import React, { useEffect, useState, useRef, CSSProperties } from 'react';

export type VideoPlayerProps = {
	data?: any;
	className?: string;
	videoClassName?: string;
	loop?: boolean;
	muted?: boolean;
	autoPlay?: boolean;
	controls?: boolean;
};

export default function VideoPlayer({
	data,
	className,
	videoClassName,
	loop = true,
	muted = true,
	autoPlay = true,
	controls = false,
}: VideoPlayerProps) {
	if (!data?.video) return null;

	const [inView, setInView] = useState(false);
	const [hasAudio, setHasAudio] = useState(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const posterRef = useRef<any | null>(null);
	const muteRef = useRef<HTMLDivElement | null>(null);
	const [active, setActive] = useState(false);
	const [showPoster, setShowPoster] = useState(false);
	const [quality, setQuality] = useState<String | null>('high');
	const [playing, setPlaying] = useState(false);
	const [showControls, setShowControls] = useState(false);

	function handleClick() {
		playing ? videoRef.current?.pause() : videoRef.current?.play();
	}

	function handleMouse(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		setShowControls(e.type === 'mouseenter');
	}

	useEffect(() => {
		setActive(inView);
	}, [inView]);

	useEffect(() => {
		if (!videoRef.current || !autoPlay) return;
		if (active) videoRef.current.play().catch((err) => {});
		else videoRef.current.pause();
	}, [active, quality, videoRef]);

	useEffect(() => {
		if (!videoRef.current) return;

		const loadedData = () => setHasAudio(videoHasAudio(videoRef.current));
		const canPlay = () => {
			setShowPoster(false);
		};

		const play = () => {
			setPlaying(true);
		};

		const pause = () => {
			setPlaying(false);
		};

		videoRef.current.addEventListener('loadeddata', loadedData);
		videoRef.current.addEventListener('canplay', canPlay);
		videoRef.current.addEventListener('play', play);
		videoRef.current.addEventListener('pause', pause);

		// Check if video is in view
		const observer = new IntersectionObserver(
			([entry]) => {
				setInView(entry.isIntersecting);
			},
			{ threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] }
		);

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

	return (
		<div
			className={className}
			style={controls ? { position: 'relative' } : undefined}
			onMouseEnter={handleMouse}
			onMouseLeave={handleMouse}
		>
			<video
				ref={videoRef}
				src={quality ? data.video[`mp4${quality}`] : data.video.streamingUrl}
				className={videoClassName}
				muted={muted}
				loop={loop}
				autoPlay={autoPlay}
				playsInline={true}
				disablePictureInPicture={true}
				poster={showPoster ? `${data.video?.thumbnailUrl}?time=0` : undefined}
			/>
			{controls && showControls && (
				<button style={buttonStyle} onClick={handleClick}>
					{playing ? <PauseButton /> : <PlayButton />}
				</button>
			)}
		</div>
	);
}

const videoHasAudio = (video: any) => {
	if (!video) return false;
	return video.mozHasAudio || Boolean(video.webkitAudioDecodedByteCount) || Boolean(video.audioTracks?.length);
};

const buttonStyle: CSSProperties = {
	all: 'unset',
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100px',
	height: '100px',
};

const PlayButton = () => {
	return (
		<svg
			width='100px'
			height='100px'
			viewBox='-0.5 0 7 7'
			version='1.1'
			xmlns='http://www.w3.org/2000/svg'
			style={{ backgroundColor: 'transparent' }}
		>
			<g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
				<g id='Dribbble-Light-Preview' transform='translate(-347.000000, -3766.000000)' fill='#ffffff'>
					<g id='icons' transform='translate(56.000000, 160.000000)'>
						<path
							d='M296.494737,3608.57322 L292.500752,3606.14219 C291.83208,3605.73542 291,3606.25002 291,3607.06891 L291,3611.93095 C291,3612.7509 291.83208,3613.26444 292.500752,3612.85767 L296.494737,3610.42771 C297.168421,3610.01774 297.168421,3608.98319 296.494737,3608.57322'
							id='play-[#1003]'
						></path>
					</g>
				</g>
			</g>
		</svg>
	);
};

const PauseButton = () => {
	return (
		<svg
			width='100px'
			height='100px'
			viewBox='-1 0 8 8'
			version='1.1'
			xmlns='http://www.w3.org/2000/svg'
			style={{ backgroundColor: 'transparent' }}
		>
			<g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
				<g id='Dribbble-Light-Preview' transform='translate(-227.000000, -3765.000000)' fill='#ffffff'>
					<g id='icons' transform='translate(56.000000, 160.000000)'>
						<path
							d='M172,3605 C171.448,3605 171,3605.448 171,3606 L171,3612 C171,3612.552 171.448,3613 172,3613 C172.552,3613 173,3612.552 173,3612 L173,3606 C173,3605.448 172.552,3605 172,3605 M177,3606 L177,3612 C177,3612.552 176.552,3613 176,3613 C175.448,3613 175,3612.552 175,3612 L175,3606 C175,3605.448 175.448,3605 176,3605 C176.552,3605 177,3605.448 177,3606'
							id='pause-[#1006]'
						></path>
					</g>
				</g>
			</g>
		</svg>
	);
};
