class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype); // ✅ Fix for instanceof
        this.name = "NotFoundError";
    }
}

export default NotFoundError;