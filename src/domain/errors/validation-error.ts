class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ValidationError.prototype); // ✅ Fix for instanceof
        this.name = "ValidationError";
    }
}

export default ValidationError;