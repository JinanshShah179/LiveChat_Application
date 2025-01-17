const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => 
{
  const authHeader = req.headers.authorization;

  // console.log({authHeader},req.headers)
  
  // console.log('Authorization Header:', authHeader); 

  if (!authHeader || !authHeader.startsWith('Bearer ')) 
  {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  // console.log(token);

  try 
  {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded Token:', decoded); 
    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  }
  catch (err) 
  {
    console.error('JWT Error:', err.message);
    res.status(401).json({ message: 'Invalid token or token expired' });
  }
};

