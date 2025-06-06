import { Response } from 'express';
export declare const sendResponse: {
    ok: (res: Response, data: unknown) => void;
    created: (res: Response, data: unknown) => void;
    noContent: (res: Response) => void;
    badRequest: (res: Response, message?: string) => void;
    unauthorized: (res: Response, message?: string) => void;
    forbidden: (res: Response, message?: string) => void;
    notFound: (res: Response, message?: string) => void;
    error: (res: Response, error: unknown) => void;
};
//# sourceMappingURL=response.d.ts.map