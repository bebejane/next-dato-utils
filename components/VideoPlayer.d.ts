import React from 'react';
export type VideoPlayerProps = {
    data?: any;
    className?: string;
    videoClassName?: string;
    loop?: boolean;
    muted?: boolean;
    autoPlay?: boolean;
    controls?: boolean;
};
export default function VideoPlayer({ data, className, videoClassName, loop, muted, autoPlay, controls, }: VideoPlayerProps): React.JSX.Element | null;
