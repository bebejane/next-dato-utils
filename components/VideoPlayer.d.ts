export type VideoPlayerProps = {
    data?: any;
    className?: string;
    videoClassName?: string;
    loop?: boolean;
    muted?: boolean;
    autoPlay?: boolean;
    controls?: boolean;
};
export default function VideoPlayer({ data, className, videoClassName, loop, muted, autoPlay, controls, }: VideoPlayerProps): import("react/jsx-runtime").JSX.Element | null;
