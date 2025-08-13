import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    
    const auth = getAuth(req); // safe way to get auth object
    
    if(!auth || !auth.userId){
        throw new UnauthorizedError("Unauthorized");
    }
    next();
}

export default isAuthenticated;


// import UnauthorizedError from "../../domain/errors/unauthorized-error";
// import { Request, Response, NextFunction } from "express";
// import { getAuth } from "@clerk/express";

// const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//   const auth = getAuth(req); // safe way to get auth object

//   if (!auth.userId) {
//     throw new UnauthorizedError("Unauthorized");
//   }

//   console.log(auth); // useful info: userId, sessionId, etc.
//   next();
// };




// const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
//     console.log('req:', req);
//     if (!req?.auth) {
//         //! req.auth will only be defined if the request sends a valid session token
//         throw new UnauthorizedError("Unauthorized");
//     }
//     //! By calling req.auth() or passing the request to getAuth() we can get the auth data from the request
//     //! userId can be obtained from the auth object
//     // console.log(req.auth());
//     // console.log(getAuth(req));
//     next();
// }

// export default isAuthenticated;