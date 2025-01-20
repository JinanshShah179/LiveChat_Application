const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport(
  {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: 
  {
    user: "jinanshshah179@gmail.com",
    pass: "fhvbrutjfsmvpmpz",
  },
});


function sendMail(to,sub,msg)
{
    transporter.sendMail({
        to:to,
        subject:sub,
        html:msg
    });
    // console.log("Mail sent...");
}

exports.default = sendMail;

// fhvb rutj fsmv pmpz