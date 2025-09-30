const express = require('express');
const router = express.Router();
const { 
    PutObjectCommand, 
    GetObjectCommand, 
    ListObjectsV2Command, 
    DeleteObjectCommand, 
    HeadObjectCommand 
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, BUCKET_NAME, isConfigured } = require('../config/aws');
const { upload, generateFileName } = require('../middleware/upload');

// Middleware to check if AWS is configured
const checkAWSConfig = (req, res, next) => {
    if (!isConfigured || !s3Client || !BUCKET_NAME) {
        return res.status(503).json({
            error: 'AWS S3 not configured',
            message: 'Please set up your environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME)',
            hint: 'Copy .env.example to .env and fill in your AWS credentials'
        });
    }
    next();
};

// Apply AWS config check to all routes
router.use(checkAWSConfig);

// Upload file to S3
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const fileName = generateFileName(req.file.originalname);
        
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
            // Removed ACL parameter as bucket doesn't support ACLs
        });

        await s3Client.send(uploadCommand);

        // Generate URL for the uploaded file
        const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

        res.json({
            message: 'File uploaded successfully',
            file: {
                originalName: req.file.originalname,
                fileName: fileName,
                size: req.file.size,
                url: fileUrl,
                key: fileName
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to upload file',
            message: error.message 
        });
    }
});

// Download file from S3
router.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        const headCommand = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename
        });

        // Check if file exists
        try {
            await s3Client.send(headCommand);
        } catch (error) {
            if (error.name === 'NotFound') {
                return res.status(404).json({ error: 'File not found' });
            }
            throw error;
        }

        // Get file stream using GetObjectCommand
        const getObjectCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename
        });

        const result = await s3Client.send(getObjectCommand);
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', result.ContentType || 'application/octet-stream');
        
        // Pipe the readable stream to response
        result.Body.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Failed to download file',
            message: error.message 
        });
    }
});

// List all files in S3 bucket
router.get('/files', async (req, res) => {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            MaxKeys: 100 // Limit to 100 files
        });

        const result = await s3Client.send(listCommand);
        
        const files = (result.Contents || []).map(file => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${file.Key}`
        }));

        res.json({
            files: files,
            count: files.length,
            isTruncated: result.IsTruncated || false
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ 
            error: 'Failed to list files',
            message: error.message 
        });
    }
});

// Delete file from S3
router.delete('/delete/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        const headCommand = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename
        });

        // Check if file exists
        try {
            await s3Client.send(headCommand);
        } catch (error) {
            if (error.name === 'NotFound') {
                return res.status(404).json({ error: 'File not found' });
            }
            throw error;
        }

        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename
        });

        await s3Client.send(deleteCommand);

        res.json({
            message: 'File deleted successfully',
            filename: filename
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ 
            error: 'Failed to delete file',
            message: error.message 
        });
    }
});

// Get file metadata
router.get('/info/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        const headCommand = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename
        });

        const result = await s3Client.send(headCommand);

        res.json({
            filename: filename,
            size: result.ContentLength,
            contentType: result.ContentType,
            lastModified: result.LastModified,
            etag: result.ETag,
            url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`
        });
    } catch (error) {
        console.error('Info error:', error);
        if (error.name === 'NotFound') {
            return res.status(404).json({ error: 'File not found' });
        }
        res.status(500).json({ 
            error: 'Failed to get file info',
            message: error.message 
        });
    }
});

module.exports = router;