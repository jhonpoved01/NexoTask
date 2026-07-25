export function sendSuccess(response, {
    status = 200,
    data = null,
    message
}) {
    return response.status(status).json({ data, message });
}

export function sendList(response, {
    status = 200,
    data = [],
    message
}) {
    return response.status(status).json({
        data,
        meta: {
            total: data.length
        },
        message
    });
}

export function sendError(response, {
    status,
    code,
    message,
    details = []
}) {
    return response.status(status).json({
        error: {
            code,
            message,
            details
        }
    });
}
