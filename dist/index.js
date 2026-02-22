"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// IMPORTANT: dotenv must load BEFORE any other import that reads process.env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
exports.app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
exports.app.use((0, cors_1.default)({
    origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:8080', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
// Serve locally uploaded product images
const path_1 = __importDefault(require("path"));
exports.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
exports.app.use('/api', routes_1.default);
// Health check endpoint
exports.app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Error handling middleware
exports.app.use((err, req, res, next) => {
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
            exports.app.listen(PORT, () => {
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
                console.error('Could not connect to MongoDB after multiple attempts. Exiting.');
                process.exit(1);
            }
        }
    };
    tryConnect();
};
startServer();
