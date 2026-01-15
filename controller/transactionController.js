const {
  Transaction,
  AirtimeDataTrans,
  CardlessTrans,
  User,
} = require("../database/models");
const Sequelize = require("sequelize");
const { Op } = Sequelize;

/**
 * List all transactions with filters
 * GET /api/transactions
 */
exports.listTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { type, status, walletId, startDate, endDate, search } = req.query;

    // Build where clause
    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (walletId) {
      where.walletId = walletId;
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
        { transactionId: { [Op.like]: `%${search}%` } },
        { walletId: { [Op.like]: `%${search}%` } },
        { sessionId: { [Op.like]: `%${search}%` } },
        { sender: { [Op.like]: `%${search}%` } },
        { receiver: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
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
    console.error("List transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
    });
  }
};

/**
 * Get transaction details
 * GET /api/transactions/:id
 */
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction",
    });
  }
};

/**
 * Get transaction summary with filters
 * GET /api/transactions/summary
 */
exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate, type, status } = req.query;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
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

    const summary = await Transaction.findAll({
      where,
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalCount"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
          ),
          "totalAmount",
        ],
        [
          Sequelize.fn(
            "AVG",
            Sequelize.cast(Sequelize.col("amount"), "DECIMAL(10,2)")
          ),
          "averageAmount",
        ],
      ],
      raw: true,
    });

    // Get count by status
    const byStatus = await Transaction.findAll({
      where,
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    // Get count by type
    const byType = await Transaction.findAll({
      where,
      attributes: [
        "type",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["type"],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        summary: summary[0] || {},
        byStatus,
        byType,
      },
    });
  } catch (error) {
    console.error("Get transaction summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction summary",
    });
  }
};

/**
 * Export transactions to CSV/Excel
 * POST /api/transactions/export
 */
exports.exportTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, status, format = "csv" } = req.body;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
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

    const transactions = await Transaction.findAll({
      where,
      order: [["id", "DESC"]],
    });

    if (format === "csv") {
      // Simple CSV export
      const csvHeader =
        "Transaction ID,Wallet ID,Type,Amount,Currency,Status,Operator,Created At\n";
      const csvRows = transactions
        .map((t) => {
          return `${t.transactionId || ""},${t.walletId || ""},${
            t.type || ""
          },${t.amount || ""},${t.currency || ""},${t.status || ""},${
            t.operator || ""
          },${t.createdAt || ""}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=transactions_${Date.now()}.csv`
      );
      res.send(csvHeader + csvRows);
    } else {
      // Return JSON for Excel export (frontend can handle Excel conversion)
      res.json({
        success: true,
        data: { transactions },
      });
    }
  } catch (error) {
    console.error("Export transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting transactions",
    });
  }
};

/**
 * List airtime/data transactions
 * GET /api/transactions/airtime-data
 */
exports.listAirtimeDataTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, walletId, startDate, endDate } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (walletId) {
      where.walletId = walletId;
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

    const { count, rows } = await AirtimeDataTrans.findAndCountAll({
      where,
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
    console.error("List airtime/data transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching airtime/data transactions",
    });
  }
};

/**
 * List cardless withdrawal transactions
 * GET /api/transactions/cardless
 */
exports.listCardlessTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, walletId, startDate, endDate } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (walletId) {
      where.walletId = walletId;
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

    const { count, rows } = await CardlessTrans.findAndCountAll({
      where,
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
    console.error("List cardless transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cardless transactions",
    });
  }
};

/**
 * Update transaction status
 * PATCH /api/transactions/:id/status
 */
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusCode, statusMessage } = req.body;

    const transaction = await Transaction.findByPk(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (status !== undefined) {
      transaction.status = status;
    }
    if (statusCode !== undefined) {
      transaction.statusCode = statusCode;
    }
    if (statusMessage !== undefined) {
      transaction.statusMessage = statusMessage;
    }

    await transaction.save();

    res.json({
      success: true,
      message: "Transaction status updated successfully",
      data: { transaction },
    });
  } catch (error) {
    console.error("Update transaction status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating transaction status",
    });
  }
};
