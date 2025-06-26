import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
export declare const COGNITO_CONFIG: {
    region: string;
    userPoolId: string;
    clientId: string;
    clientSecret: string;
    tokenUse: string;
    tokenExpiration: number;
};
export declare const cognitoClient: CognitoIdentityProviderClient;
export interface CognitoUser {
    username: string;
    email: string;
    sub: string;
    groups?: string[];
    empresa_id?: string;
    custom_attributes?: Record<string, string>;
}
export interface CognitoTokens {
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare enum CognitoGroups {
    ADMIN = "Administradores",
    GESTOR = "Gestores",
    USUARIO = "Usuarios"
}
//# sourceMappingURL=cognito.config.d.ts.map