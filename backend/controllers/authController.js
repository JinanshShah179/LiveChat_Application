const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Permission = require('../models/Permission');

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

    const { name, email, password, confirmPassword,role } = req.body;
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

      const newUserRole = role || 'user';

      const newUser = new User({
        name,
        email,
        password,
        profilePhoto,
        role:newUserRole,
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
    const user = await User.findOne({ email }).populate('permissions');
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
        profilePhoto: user.profilePhoto,
        role:user.role,
        permissions:user.permissions.permissions,
      }
    });
  } 
  catch (err) 
  {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Create User Controller
exports.adminCreateUser = async (req, res) => {

  const { name, email, password, role } = req.body;

  try {
    // Validate role
    let permission = await Permission.findOne({role});

    if(!permission)
    {
      permission = new Permission({
        role,
        permissions: {
          view_chat: false,
          text_chat: false,
          add_member: false,
          delete_group: false,
        },
      });
      await permission.save();
    }

    const userRole = role || 'user';  // Default to 'user' if no role is specified

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user with the given details (excluding profile photo and confirm password)
    const newUser = new User({
      name,
      email,
      password,
      role: userRole,
      permissions:permission._id,
    });
    
    // Hash the password before saving
    // const hashedPassword = await bcrypt.hash(password, 10);
    // newUser.password = hashedPassword;

    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      userId: newUser._id,
      name: newUser.name,
      user: {
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions:permission.permissions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};



