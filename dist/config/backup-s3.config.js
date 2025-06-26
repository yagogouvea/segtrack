"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBackupConfig = exports.backupConfig = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.backupConfig = {
    s3Client: new client_s3_1.S3Client({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
    }),
    bucket: 'segtrack-backups',
    backupRetentionDays: 30,
    backupPaths: {
        local: '/var/backups/completo',
        s3: 'mysql_backups'
    },
    database: {
        name: 'segtrack',
        user: 'segtrack_admin',
        host: process.env.DB_HOST || 'localhost'
    }
};
const validateBackupConfig = () => {
    const requiredEnvVars = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'DB_HOST'
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};
exports.validateBackupConfig = validateBackupConfig;
exports.default = exports.backupConfig;
//# sourceMappingURL=backup-s3.config.js.map