"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CognitoGroups = exports.cognitoClient = exports.COGNITO_CONFIG = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
exports.COGNITO_CONFIG = {
    region: process.env.AWS_REGION || 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID || '',
    clientId: process.env.COGNITO_CLIENT_ID || '',
    clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
    tokenUse: 'access', // ou 'id'
    tokenExpiration: 3600000, // 1 hora em milissegundos
};
// Cliente do Cognito
exports.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
    region: exports.COGNITO_CONFIG.region,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
// Enum para grupos de usuários
var CognitoGroups;
(function (CognitoGroups) {
    CognitoGroups["ADMIN"] = "Administradores";
    CognitoGroups["GESTOR"] = "Gestores";
    CognitoGroups["USUARIO"] = "Usuarios";
})(CognitoGroups || (exports.CognitoGroups = CognitoGroups = {}));
