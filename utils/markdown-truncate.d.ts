declare const markdownTruncate: (text?: string, options?: {
    limit: number;
    ellipsis: boolean;
}) => string;
export default markdownTruncate;
