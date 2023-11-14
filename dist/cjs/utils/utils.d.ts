import { ReactNode } from "react";
export declare const isServer: boolean;
export declare const chunkArray: (array: any[] | ReactNode[], chunkSize: number) => any[][];
export declare const parseDatoError: (err: any) => string;
export declare const parseDatoCMSApiError: (e: any) => string;
export declare const isEmpty: (obj: any) => boolean;
export declare const capitalize: (str: string, lower?: boolean) => string;
export declare const sleep: (ms: number) => Promise<unknown>;
export declare const rInt: (min: number, max: number) => number;
export declare const truncateParagraph: (s: string, sentances?: number, ellipsis?: boolean, minLength?: number) => string;
export declare const truncateWords: (text: string, maxLength: number) => string;
export declare const sortSwedish: <T>(arr: T[], key?: string) => T[];
export declare const awaitElement: <T>(selector: string) => Promise<NonNullable<T>>;
