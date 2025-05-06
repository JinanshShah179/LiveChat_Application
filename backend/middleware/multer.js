const multer = require("multer");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// File filter to validate uploaded files
const fileFilter = (req, file, cb) => {

  const allowedMimes = [
    "image/",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/zip",
    "application/x-zip-compressed",
  ];

  if (allowedMimes.some((mime) => file.mimetype.startsWith(mime))) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type..."));
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
