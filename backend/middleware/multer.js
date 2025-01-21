const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// File filter to validate uploaded files
const fileFilter = (req, file, cb) => {

  const allowedMimes = ['image/','application/pdf','text/plain'];

  if(allowedMimes.some(mime => file.mimetype.startsWith(mime)))
  {
     cb(null,true);
  }
  else
  {
    cb(new Error('Invalid file type. Only Images,text-files,and pdfs are allowed.'));
  }

  //logic of only image
  // if (file.mimetype.startsWith('image/')) {
  //   cb(null, true); // Accept only image files
  // } else {
  //   cb(new Error('Invalid file type. Only images are allowed.'));
  // }
};

const upload = multer({ storage, fileFilter });
module.exports = upload;
