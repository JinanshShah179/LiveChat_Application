const Permission = require("../models/Permission");

exports.updatePermissions = async (req, res) => {
  const { updatedPermissions } = req.body;

  console.log("Received Permissions Data:",updatedPermissions);
  try 
  {
    if (!updatedPermissions || typeof updatedPermissions !== "object") {
      return res.status(400).json({ message: "Invalid permissions data" });
    }

    // Iterate over each role in `updatedPermissions`
    const roles = Object.keys(updatedPermissions);
    for (const role of roles) {
      const rolePermissions = updatedPermissions[role];

      if (!["admin", "user", "guest", "host"].includes(role)) {
        return res.status(400).json({ message: `Invalid role: ${role}` });
      }


      // Find the permission document for the role and update it
      let permission = await Permission.findOne({ role });

      if (!permission) {
        // If the role does not exist, create a new permission document
        permission = new Permission({ role, permissions: rolePermissions });
      } else {
        // Update the existing permissions
        permission.permissions = rolePermissions;
      }

      // Save the permission document
      await permission.save();
    }

    res.status(200).json({ message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPermissions = async (req, res) => {
  const { role } = req.body;

  console.log("Role", role, req.body);
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

exports.getPermissions2 = async (req, res) => {
  try {
    const permissions = await Permission.find({});

    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: "No permission found" });
    }

    const permissionByRole = permissions.reduce((acc, permission) => {
      acc[permission.role] = permission.permissions;
      return acc;
    }, {});

    res.status(200).json({
      message: "Permission reterived succesfully",
      permissions: permissionByRole,
    });
  } catch (error) {
    console.log("Error in reterving permissions", error);
    res.status(500).json({ message: "Server error" });
  }
};
