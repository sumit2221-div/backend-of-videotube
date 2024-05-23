import { ApiError } from "./apierror.js";

const errorHandler = (err, req, res, next) => {
    // If the error is an instance of ApiError, use its status code and message
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: false,
            statusCode: err.statuscode,
            message: err.message,
            error: err.error
        });
    }

    // For all other errors, use a generic status code and message
    console.error('Internal Server Error:', err);  // Log detailed error
    return res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Internal Server Error',
        error: err.message
    });
};

export default errorHandler;
