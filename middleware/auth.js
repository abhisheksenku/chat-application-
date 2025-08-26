const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')|| req.cookies.token;;
    console.log('Token received:', token);

    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    const UserId = decoded.UserId;
    const user = await User.findByPk(UserId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = { authenticate };

// const jwt = require('jsonwebtoken');
// const User = require('../models/users');
// require('dotenv').config();


// const authenticate = (req, res, next) => {
//     try {
//         const token = req.header('Authorization');
//         console.log("Token received:", token);

//         if (!token) {
//             return res.status(401).json({ success: false, message: 'No token provided' });
//         }

//         const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

//         console.log("Decoded JWT:", decoded);

//         const userId = decoded.userId;

//         User.findByPk(userId).then(user => {
//             if (!user) {
//                 return res.status(404).json({ success: false, message: 'User not found' });
//             }

//             req.user = user;
//             next();
//         }).catch(err => {
//             console.error("Database error:", err);
//             return res.status(500).json({ success: false, message: 'Database error' });
//         });

//     } catch (error) {
//         console.error("Authentication error:", error.message);
//         return res.status(401).json({ success: false, message: 'Authentication failed' });
//     }
// };

// module.exports = { authenticate };
