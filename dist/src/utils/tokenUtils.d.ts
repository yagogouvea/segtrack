export interface TokenPayload {
    id: string;
    email: string;
    permissions: string[];
}
export declare const generateToken: (payload: TokenPayload) => string;
export declare const verifyToken: (token: string) => TokenPayload;
//# sourceMappingURL=tokenUtils.d.ts.map