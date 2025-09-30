const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Check for required environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
    console.warn('🔧 Please create a .env file with your AWS credentials');
    console.warn('📋 Copy .env.example to .env and fill in your values');
}

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (wrapped in try-catch for better error handling)
try {
    app.use('/api', require('./routes/files'));
} catch (error) {
    console.error('❌ Error loading routes:', error.message);
    
    // Fallback routes when AWS is not configured
    app.use('/api/*', (req, res) => {
        res.status(503).json({
            error: 'AWS S3 not configured',
            message: 'Please set up your .env file with AWS credentials',
            missingVars: missingEnvVars
        });
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'S3 File Manager API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (missingEnvVars.length > 0) {
        console.log('\n📋 Setup Instructions:');
        console.log('1. Copy .env.example to .env');
        console.log('2. Fill in your AWS credentials');
        console.log('3. Restart the server');
        console.log('\n⚠️  API endpoints will return 503 until configured');
    }
}).on('error', (err) => {
    console.error('❌ Server failed to start:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`💡 Port ${PORT} is already in use. Try a different port or kill the existing process.`);
    }
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});