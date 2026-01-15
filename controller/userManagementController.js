const { User, Transaction, UssdMenu } = require("../database/models");
const Sequelize = require("sequelize");
const crypto = require("crypto");
const { Op } = Sequelize;

/**
 * Hash PIN using SHA256
 */
const hashPin = (pin) => {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be a 4-digit number");
  }
  const hash = crypto.createHash("sha256");
  hash.update(pin);
  return hash.digest("hex");
};

/**
 * Generate random 4-digit PIN
 */
const generateRandomPin = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * List all users with pagination, filtering, and search
 * GET /api/users
 */
exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const wallet = req.query.wallet;
    const accountStatus = req.query.accountStatus;
    const country = req.query.country;

    // Build where clause
    const where = {};

    if (search) {
      where[Op.or] = [
        { walletId: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } },
        { accountNumber: { [Op.like]: `%${search}%` } },
        { alternatePhoneno: { [Op.like]: `%${search}%` } },
      ];
    }

    if (wallet) {
      where.wallet = wallet;
    }

    if (accountStatus) {
      where.accountStatus = accountStatus;
    }

    if (country) {
      where.country = country;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]],
      attributes: { exclude: ["pin"] }, // Exclude PIN from response
    });

    res.json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

/**
 * Get user details by ID
 * GET /api/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["pin"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

/**
 * Get user by walletId
 * GET /api/users/:walletId/details
 */
exports.getUserByWalletId = async (req, res) => {
  try {
    const { walletId } = req.params;

    const user = await User.findOne({
      where: { walletId },
      attributes: { exclude: ["pin"] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user by walletId error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

/**
 * Update user information
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, alternatePhoneno, accountNumber, country, type } =
      req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowed fields
    if (fullName !== undefined) user.fullName = fullName;
    if (alternatePhoneno !== undefined)
      user.alternatePhoneno = alternatePhoneno;
    if (accountNumber !== undefined) user.accountNumber = accountNumber;
    if (country !== undefined) user.country = country;
    if (type !== undefined) user.type = type;

    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["pin"] },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
};

/**
 * Update user account status
 * PATCH /api/users/:id/status
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;

    if (
      !accountStatus ||
      !["active", "inactive", "suspended", "blocked"].includes(accountStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid account status. Must be: active, inactive, suspended, or blocked",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["pin"] },
    });

    res.json({
      success: true,
      message: `User account ${accountStatus} successfully`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
    });
  }
};

/**
 * Enable user profile
 * PATCH /api/users/:id/enable
 */
exports.enableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = "active";
    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["pin"] },
    });

    res.json({
      success: true,
      message: "User profile enabled successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Enable user error:", error);
    res.status(500).json({
      success: false,
      message: "Error enabling user",
    });
  }
};

/**
 * Disable user profile
 * PATCH /api/users/:id/disable
 */
exports.disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.accountStatus = "inactive";
    await user.save();

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["pin"] },
    });

    res.json({
      success: true,
      message: "User profile disabled successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Disable user error:", error);
    res.status(500).json({
      success: false,
      message: "Error disabling user",
    });
  }
};

/**
 * Reset user PIN
 * POST /api/users/:id/reset-pin
 */
exports.resetPin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPin, generateRandom } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let pinToSet;

    if (generateRandom) {
      // Generate random 4-digit PIN
      pinToSet = generateRandomPin();
    } else if (newPin) {
      // Validate PIN format
      if (!/^\d{4}$/.test(newPin)) {
        return res.status(400).json({
          success: false,
          message: "PIN must be a 4-digit number",
        });
      }
      pinToSet = newPin;
    } else {
      return res.status(400).json({
        success: false,
        message: "Either newPin or generateRandom must be provided",
      });
    }

    // Hash the PIN
    const hashedPin = hashPin(pinToSet);

    // Update user PIN
    user.pin = hashedPin;
    await user.save();

    res.json({
      success: true,
      message: "PIN reset successfully",
      data: {
        userId: user.id,
        walletId: user.walletId,
        // Only return the PIN if it was randomly generated (for admin to share with user)
        ...(generateRandom && { temporaryPin: pinToSet }),
      },
    });
  } catch (error) {
    console.error("Reset PIN error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting PIN",
    });
  }
};

/**
 * Get all transactions for a user
 * GET /api/users/:id/transactions
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: { walletId: user.walletId },
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        transactions: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
    });
  }
};

/**
 * Get USSD session history for a user
 * GET /api/users/:id/ussd-sessions
 */
exports.getUserUssdSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { count, rows } = await UssdMenu.findAndCountAll({
      where: { walletId: user.walletId },
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        sessions: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user USSD sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user USSD sessions",
    });
  }
};
