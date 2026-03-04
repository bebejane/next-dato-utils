export type ScrollInfo = {
    isScrolling: boolean;
    isPageTop: boolean;
    isPageBottom: boolean;
    isScrolledUp: boolean;
    isScrolledDown: boolean;
    scrolledPosition: number;
    documentHeight: number;
    viewportHeight: number;
    timer: ReturnType<typeof setTimeout> | null;
};
export default function useScrollInfo(pageBottomLimit?: number): ScrollInfo;
