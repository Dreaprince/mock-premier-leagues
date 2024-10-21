import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
    decoded?: {
        role: string; 
    };
}

const rolesMiddleware = (roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.decoded;
        
        if (!user) {
            res.status(403).json({ message: 'User not authenticated' });
            return; // Ensure the function stops here and does not proceed
        }

        if (!roles.includes(user.role)) {
            res.status(403).json({ message: 'You do not have permission to access this resource' });
            return; // Ensure the function stops here and does not proceed
        }

        next(); // Call next() if the user has the correct role
    };
};

export default rolesMiddleware;
