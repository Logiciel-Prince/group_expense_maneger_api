import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number | string;
    nodeEnv: string;
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
    };
    cors: {
        allowedOrigins: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
}

export const config: Config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || "development",
    mongodb: {
        uri:
            process.env.MONGODB_URI ||
            "mongodb://localhost:27017/group-expense-manager",
    },
    jwt: {
        secret: process.env.JWT_SECRET || "your-secret-key",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
            "http://localhost:19000",
        ],
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    },
};
