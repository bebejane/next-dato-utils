declare const tests: (req: Request) => Promise<Response>;
export default tests;
type PreviewLink = {
    label: string;
    url: string;
};
type RevalidateResponse = {
    revalidated: boolean;
    paths: string[];
    delays: number;
    event_type: string;
};
type TestResult = {
    model: string;
    previews?: PreviewLink[];
    revalidate?: RevalidateResponse;
};
export declare function testApiEndpoints(locale: string): Promise<TestResult[]>;
export declare const testResultsToString: (results: TestResult[]) => string;
export declare const testResultsToHtml: (results: TestResult[]) => string;
