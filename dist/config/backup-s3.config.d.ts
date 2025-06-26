import { S3Client } from '@aws-sdk/client-s3';
export declare const backupConfig: {
    s3Client: S3Client;
    bucket: string;
    backupRetentionDays: number;
    backupPaths: {
        local: string;
        s3: string;
    };
    database: {
        name: string;
        user: string;
        host: string;
    };
};
export declare const validateBackupConfig: () => void;
export default backupConfig;
//# sourceMappingURL=backup-s3.config.d.ts.map