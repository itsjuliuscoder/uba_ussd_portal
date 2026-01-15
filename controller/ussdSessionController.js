const { UssdMenu } = require("../database/models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

/**
 * List all USSD sessions with filters
 * GET /api/ussd-sessions
 */
exports.listSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { walletId, wallet, language, startDate, endDate, search } =
      req.query;

    // Build where clause
    const where = {};

    if (walletId) {
      where.walletId = walletId;
    }

    if (wallet) {
      where.wallet = wallet;
    }

    if (language) {
      where.language = language;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    if (search) {
      where[Op.or] = [
        { sessionId: { [Op.like]: `%${search}%` } },
        { walletId: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await UssdMenu.findAndCountAll({
      where,
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
    console.error("List USSD sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching USSD sessions",
    });
  }
};

/**
 * Get session details
 * GET /api/ussd-sessions/:sessionId
 */
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UssdMenu.findOne({
      where: { sessionId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    res.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session",
    });
  }
};

/**
 * Get active sessions
 * GET /api/ussd-sessions/active
 */
exports.getActiveSessions = async (req, res) => {
  try {
    // Consider sessions active if created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const activeSessions = await UssdMenu.findAll({
      where: {
        createdAt: { [Op.gte]: oneHourAgo },
        closeState: "0", // Not closed
      },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        sessions: activeSessions,
        count: activeSessions.length,
      },
    });
  } catch (error) {
    console.error("Get active sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching active sessions",
    });
  }
};

/**
 * Get session analytics
 * GET /api/ussd-sessions/analytics
 */
exports.getSessionAnalytics = async (req, res) => {
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

    // Total sessions
    const totalSessions = await UssdMenu.count({
      where: dateFilter,
    });

    // Sessions by wallet
    const sessionsByWallet = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        "wallet",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["wallet"],
      raw: true,
    });

    // Sessions by language
    const sessionsByLanguage = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        "language",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["language"],
      raw: true,
    });

    // Sessions by question type
    const sessionsByQuestionType = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        "questionType",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["questionType"],
      raw: true,
    });

    // Closed vs open sessions
    const closedSessions = await UssdMenu.count({
      where: {
        ...dateFilter,
        closeState: "1",
      },
    });

    const openSessions = await UssdMenu.count({
      where: {
        ...dateFilter,
        closeState: "0",
      },
    });

    // Unique users
    const uniqueUsers = await UssdMenu.findAll({
      where: dateFilter,
      attributes: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("walletId"))
          ),
          "uniqueUsers",
        ],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        total: totalSessions,
        closed: closedSessions,
        open: openSessions,
        uniqueUsers: parseInt(uniqueUsers[0]?.uniqueUsers || 0),
        byWallet: sessionsByWallet,
        byLanguage: sessionsByLanguage,
        byQuestionType: sessionsByQuestionType,
      },
    });
  } catch (error) {
    console.error("Get session analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session analytics",
    });
  }
};
