declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string
    }
  }
}

export { };