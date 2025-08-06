"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    if (error.code === 'P2002') {
        res.status(400).json({
            error: 'Duplicate entry',
            message: 'A record with this information already exists'
        });
        return;
    }
    if (error.code === 'P2025') {
        res.status(404).json({
            error: 'Record not found',
            message: 'The requested resource was not found'
        });
        return;
    }
    if (error.name === 'ValidationError') {
        res.status(400).json({
            error: 'Validation error',
            message: error.message,
            details: error.errors
        });
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            error: 'Invalid token',
            message: 'Authentication token is invalid'
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            error: 'Token expired',
            message: 'Authentication token has expired'
        });
        return;
    }
    const status = error.status || error.statusCode || 500;
    res.status(status).json({
        error: status === 500 ? 'Internal server error' : error.message,
        message: status === 500 ? 'Something went wrong on our end' : error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map