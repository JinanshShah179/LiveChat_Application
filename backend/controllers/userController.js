const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage }).single('profilePhoto');

exports.getUsers = async (req, res) => 
{
  try 
  {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  }
  catch (err) 
  {
    res.status(500).json({ message: 'Error fetching users' });
  }
};


exports.updateUserProfile = async (req, res) => {
  try 
  {
    const user = await User.findById(req.userId);

    if (!user) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle profile photo upload
    if (req.file) 
    {
      const photoPath = path.join('uploads', req.file.filename).replace(/\\/g, '/');
      user.profilePhoto = photoPath; 
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePhoto: updatedUser.profilePhoto,
    });
  } 
  catch (error) 
  {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.userId);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || null,
      });
    } 
    else 
    {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) 
  {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
