const { S3Client } = require('@aws-sdk/client-s3');

// Check if AWS credentials are provided
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️  AWS credentials not found in environment variables');
    module.exports = {
        s3Client: null,
        BUCKET_NAME: null,
        isConfigured: false
    };
    return;
}

// Configure AWS SDK v3
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

console.log('✅ AWS S3 v3 configured successfully');
console.log(`📦 Bucket: ${BUCKET_NAME}`);
console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);

module.exports = {
    s3Client,
    BUCKET_NAME,
    isConfigured: true
};