const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage }).single('profilePhoto');

// Signup Controller

exports.signup = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload error' });
    }

    const { name, email, password, confirmPassword } = req.body;
    const profilePhoto = req.file?.path;

    try 
    {
      if (password !== confirmPassword) 
      {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) 
      {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = new User({
        name,
        email,
        password,
        profilePhoto,
      });

      await newUser.save();

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'User registered successfully',
        token
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try 
  {
    const user = await User.findOne({ email });
    if (!user) 
    {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
    {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      userId : user._id,
      name : user.name,
      user:{
        userId: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto
      }
    });
  } 
  catch (err) 
  {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
