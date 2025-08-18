class AlreadyExistError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AlreadyExistError.prototype); // ✅ Fix for instanceof
        this.name = "AlreadyExistError";
    }
}

export default AlreadyExistError;