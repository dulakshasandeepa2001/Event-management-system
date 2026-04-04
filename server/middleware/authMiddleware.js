// that code use for create auth middleware to protect routes and authorize user based on their role
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Rep from '../models/Rep.js'

// Protect routes
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) return res.status(401).json({ message: "Not authorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findById(decoded.id);

        if (!user) {
            const rep = await Rep.findById(decoded.id);
            if (rep) {
                req.user = {
                    _id: rep._id,
                    u_name: rep.r_name,
                    u_email: rep.r_email,
                    u_role: rep.r_role || 'batchrep',
                    isBatchRep: true,
                    sourceModel: 'Rep',
                };
                return next();
            }
        }

        if (!user) return res.status(401).json({ message: 'Token invalid or expired' });

        user.sourceModel = 'User';
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalid or expired" });
    }
};

// Role-based access
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.u_role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
        next();
    };
};