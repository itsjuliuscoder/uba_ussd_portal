const {
  User,
  Transaction,
  UssdMenu,
  CardlessTrans,
  AirtimeDataTrans,
} = require("../database/models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;
const moment = require("moment");

/**
 * Get overall statistics
 * GET /api/dashboard/stats
 */
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Get total users
    const totalUsers = await User.count();

    // Get active users (users with accountStatus = 'active')
    const activeUsers = await User.count({
      where: { accountStatus: "active" },
    });

    // Get total transactions
    const totalTransactions = await Transaction.count({
      where: dateFilter,
    });

    // Get successful transactions
    const successfulTransactions = await Transaction.count({
      where: {
        ...dateFilter,
        status: { [Op.in]: ["success", "completed", "SUCCESS"] },
      },
    });

    // Get total transaction amount
    const transactionAmounts = await Transaction.findAll({
      where: {
        ...dateFilter,
        status: { [Op.in]: ["success", "completed", "SUCCESS"] },
      },
      attributes: [
        [
          Sequelize.fn(
            "SUM",
            Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
          ),
          "totalAmount",
        ],
      ],
      raw: true,
    });

    const totalAmount = parseFloat(transactionAmounts[0]?.totalAmount || 0);

    // Get total USSD sessions
    const totalSessions = await UssdMenu.count({
      where: dateFilter,
    });

    // Get active sessions (sessions created in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeSessions = await UssdMenu.count({
      where: {
        createdAt: { [Op.gte]: oneHourAgo },
      },
    });

    // Get new users today
    const todayStart = moment().startOf("day").toDate();
    const newUsersToday = await User.count({
      where: {
        createdAt: { [Op.gte]: todayStart },
      },
    });

    // Get transactions today
    const transactionsToday = await Transaction.count({
      where: {
        createdAt: { [Op.gte]: todayStart },
      },
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
        },
        transactions: {
          total: totalTransactions,
          successful: successfulTransactions,
          today: transactionsToday,
          totalAmount: totalAmount,
        },
        sessions: {
          total: totalSessions,
          active: activeSessions,
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
};

/**
 * Get transaction summary by type, status, date range
 * GET /api/dashboard/transactions-summary
 */
exports.getTransactionsSummary = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "type" } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt[Op.lte] = new Date(endDate);
      }
    }

    let summary;

    if (groupBy === "type") {
      summary = await Transaction.findAll({
        where: dateFilter,
        attributes: [
          "type",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
            ),
            "totalAmount",
          ],
        ],
        group: ["type"],
        raw: true,
      });
    } else if (groupBy === "status") {
      summary = await Transaction.findAll({
        where: dateFilter,
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
            ),
            "totalAmount",
          ],
        ],
        group: ["status"],
        raw: true,
      });
    } else if (groupBy === "wallet") {
      summary = await Transaction.findAll({
        where: dateFilter,
        attributes: [
          "operator",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
            ),
            "totalAmount",
          ],
        ],
        group: ["operator"],
        raw: true,
      });
    }

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    console.error("Get transactions summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions summary",
    });
  }
};

/**
 * Get user growth trends over time
 * GET /api/dashboard/user-growth
 */
exports.getUserGrowth = async (req, res) => {
  try {
    const { period = "day", days = 30 } = req.query;
    const startDate = moment()
      .subtract(parseInt(days), "days")
      .startOf("day")
      .toDate();

    let dateFormat;
    switch (period) {
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        dateFormat = "%Y-%u";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const growth = await User.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
          "period",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
      ],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
          "ASC",
        ],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: { growth },
    });
  } catch (error) {
    console.error("Get user growth error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user growth data",
    });
  }
};

/**
 * Get revenue analytics by period
 * GET /api/dashboard/revenue
 */
exports.getRevenue = async (req, res) => {
  try {
    const { period = "day", days = 30 } = req.query;
    const startDate = moment()
      .subtract(parseInt(days), "days")
      .startOf("day")
      .toDate();

    let dateFormat;
    switch (period) {
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "week":
        dateFormat = "%Y-%u";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const revenue = await Transaction.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
        status: { [Op.in]: ["success", "completed", "SUCCESS"] },
      },
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
          "period",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
          ),
          "totalAmount",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "transactionCount"],
      ],
      group: [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
      ],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), dateFormat),
          "ASC",
        ],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: { revenue },
    });
  } catch (error) {
    console.error("Get revenue error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue data",
    });
  }
};

/**
 * Get USSD session statistics
 * GET /api/dashboard/ussd-sessions
 */
exports.getUssdSessions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt[Op.lte] = new Date(endDate);
      }
    }

    // Get total sessions
    const totalSessions = await UssdMenu.count({
      where: dateFilter,
    });

    // Get active sessions (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeSessions = await UssdMenu.count({
      where: {
        ...dateFilter,
        createdAt: { [Op.gte]: oneHourAgo },
      },
    });

    // Get sessions by wallet
    const sessionsByWallet = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        "wallet",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["wallet"],
      raw: true,
    });

    // Get sessions by language
    const sessionsByLanguage = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        "language",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["language"],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        total: totalSessions,
        active: activeSessions,
        byWallet: sessionsByWallet,
        byLanguage: sessionsByLanguage,
      },
    });
  } catch (error) {
    console.error("Get USSD sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching USSD session statistics",
    });
  }
};
