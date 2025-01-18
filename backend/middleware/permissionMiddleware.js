const { Permission } = require("../models/Permission");
const User = require("../models/User");

exports.checkPermission = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate("permissions");

      if (!user) 
      {
        res.status(404).json({ message: "User not found" });
      }

      const userPermissions = user.permissions;
      // console.log(userPermissions);
      if (!userPermissions) 
      {
        res.status(403).json({ message: "Permission for this is not defined"});
      }

      if (userPermissions.permissions[action]) 
      {
        next();
      } 
      else 
      {
        return res.status(403).json({message: "Access Denied. You dont have Permission"});
      }
    } 
    catch (error) 
    {
      console.log("Permission error", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};
