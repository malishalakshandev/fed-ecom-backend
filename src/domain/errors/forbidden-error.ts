class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ForbiddenError.prototype); // ✅ Fix for instanceof
        this.name = "ForbiddenError";
    }
}

export default ForbiddenError;