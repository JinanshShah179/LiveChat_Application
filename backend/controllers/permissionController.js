const Permission = require("../models/Permission");

exports.updatePermissions = async (req, res) => {
  const { role, permissions } = req.body;

  try {
    let permission = await Permission.findOne({ role });

    if (!permission) {
      permission = new Permission({
        role,
        permissions,
      });
    } else {
      permission.permissions = permissions;
    }

    await permission.save();
    res.status(200).json({
      message: "Permission Updated Succesfully",
      permission: permission.permissions,
    });
  } catch (error) {
    // console.log(err);
    res.status(500).json({ message: "The role you provided is not found" });
  }
};

exports.getPermissions = async (req, res) => {
  const role = req.body.role;
  console.log("Role", role);
  try {
    if (!role) {
      return res.status(404).json({ message: "Role is required" });
    }

    if (!["admin", "user", "guest", "host"].includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const permission = await Permission.findOne({ role });
    if (!permission) {
      return res
        .status(404)
        .json({ message: "Permission not found for this role" });
    }
    console.log(permission);
    res.status(200).json({
      permission: permission.permissions,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};
