export type SliderProps = {
    children: React.ReactElement<HTMLElement>;
    hide?: boolean;
    display?: 'flex' | 'block' | 'inline-block';
    speed?: number;
};
export default function Slider({ children, hide, display, speed }: SliderProps): import("react/jsx-runtime").JSX.Element;
