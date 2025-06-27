import { S3Client } from '@aws-sdk/client-s3';

export const backupConfig = {
    s3Client: new S3Client({
        region: 'us-east-1', // Ajuste para sua região AWS
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
        }
    }),
    bucket: process.env.AWS_S3_BUCKET || (() => { throw new Error('AWS_S3_BUCKET não definida'); })(),
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

export const validateBackupConfig = () => {
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

export default backupConfig; 