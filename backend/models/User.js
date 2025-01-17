const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: 
    {
      type: String,
      required: true,
    },
    email: 
    { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: 
    { 
      type: String, 
      required: true 
    },
    profilePhoto: 
    { 
      type: String,
      required:false
    },
    role: 
    { type: String, 
      enum: ["user", "admin","guest","host"], default: "user" 
    },
    permissions:
    {
      type:mongoose.Schema.Types.ObjectId,
      ref : "Permission",
      required:false,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) 
{
  if (!this.isModified("password")) return next();
  try 
  {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } 
  catch (err) 
  {
    next(err);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) 
{
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
