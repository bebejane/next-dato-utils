export type VideoPlayerProps = {
    data?: any;
    className?: string;
    videoClassName?: string;
    loop?: boolean;
    muted?: boolean;
    autoPlay?: boolean;
    contols?: boolean;
};
export default function VideoPlayer({ data, className, videoClassName, loop, muted, autoPlay, contols, }: VideoPlayerProps): import("react/jsx-runtime").JSX.Element | null;
