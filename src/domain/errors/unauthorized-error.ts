class UnauthorizedError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype); // ✅ Fix for instanceof
        this.name = "UnauthorizedError";
    }
}

export default UnauthorizedError;