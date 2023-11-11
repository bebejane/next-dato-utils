declare module 'markdown-truncate' {
  function truncateMarkdown(string: string, opt: { limit: number, ellipsis: boolean }): string;
  export = truncateMarkdown;
}