"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// IMPORTANT: dotenv must load BEFORE any other import that reads process.env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: true, // Allow all origins during integration to prevent CORS blocks
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve locally uploaded product images
const path_1 = __importDefault(require("path"));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api', routes_1.default);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Root endpoint for deployment verification
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Parampara API',
        health: '/health',
        api: '/api'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});
// Connect to MongoDB and start the server
const startServer = async () => {
    const tryConnect = async (retries = 5, delay = 5000) => {
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI is not defined in the environment variables');
            }
            // Aggressive connection settings for unstable/restricted networks
            await mongoose_1.default.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000, // Keep trying to find a server
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                tlsAllowInvalidCertificates: true, // Allow self-signed certs (proxies)
            });
            console.log('Connected to MongoDB');
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
        catch (error) {
            console.error('❌ Failed to connect to MongoDB');
            console.error('Error:', error.message);
            if (error.reason)
                console.error('Reason:', error.reason);
            if (retries > 0) {
                console.log(`Retrying connection in ${delay / 1000} seconds... (${retries} attempts left)`);
                setTimeout(() => tryConnect(retries - 1, delay), delay);
            }
            else {
                console.error('Could not connect to MongoDB after multiple attempts. Server will remain active but database operations will fail.');
            }
        }
    };
    tryConnect();
};
startServer();
exports.default = app;
