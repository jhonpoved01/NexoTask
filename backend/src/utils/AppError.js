export class AppError extends Error {
    constructor(options) {
        const {
            code,
            message,
            status = 500,
            details = [],
            expose
        } = options;

        super(message);
        this.name = 'AppError';
        this.code = code;
        this.status = status;
        this.details = details;
        this.expose = Object.hasOwn(options, 'expose')
            ? expose
            : status < 500;
    }
}
