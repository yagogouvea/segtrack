import { Request, Response, NextFunction } from 'express';
export declare const validateId: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRequiredFields: (fields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEnum: <T extends {
    [key: string]: string;
}>(field: string, enumType: T) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map