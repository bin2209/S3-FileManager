const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Allow common file types including CSV
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar|csv|xlsx|xls|json|xml/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    
    // Common MIME types for allowed files
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv',
        'application/zip', 'application/x-rar-compressed',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json', 'application/xml', 'text/xml'
    ];
    
    const mimetypeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (mimetypeAllowed || extname) {
        return cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: images, documents, CSV, Excel, and archives.`));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});

// Generate unique filename
const generateFileName = (originalName) => {
    const timestamp = Date.now();
    const randomId = uuidv4();
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomId}.${extension}`;
};

module.exports = {
    upload,
    generateFileName
};