const { Operators } = require("../database/models");
const { Op } = require("sequelize");

/**
 * List all operators
 * GET /api/operators
 */
exports.listOperators = async (req, res) => {
  try {
    const { country, status, search } = req.query;

    const where = {};

    if (country) {
      where.country = country;
    }

    if (status !== undefined) {
      where.status = status === "true" || status === true;
    }

    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    }

    const operators = await Operators.findAll({
      where,
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data: { operators },
    });
  } catch (error) {
    console.error("List operators error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching operators",
    });
  }
};

/**
 * Get operator details
 * GET /api/operators/:id
 */
exports.getOperator = async (req, res) => {
  try {
    const { id } = req.params;

    const operator = await Operators.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    res.json({
      success: true,
      data: { operator },
    });
  } catch (error) {
    console.error("Get operator error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching operator",
    });
  }
};

/**
 * Create new operator
 * POST /api/operators
 */
exports.createOperator = async (req, res) => {
  try {
    const { name, network_id, country, status = true } = req.body;

    if (!name || !network_id || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, network_id, and country are required",
      });
    }

    const operator = await Operators.create({
      name,
      network_id,
      country,
      status: status === true || status === "true",
    });

    res.status(201).json({
      success: true,
      message: "Operator created successfully",
      data: { operator },
    });
  } catch (error) {
    console.error("Create operator error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Operator with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating operator",
    });
  }
};

/**
 * Update operator
 * PUT /api/operators/:id
 */
exports.updateOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, network_id, country, status } = req.body;

    const operator = await Operators.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    if (name !== undefined) operator.name = name;
    if (network_id !== undefined) operator.network_id = network_id;
    if (country !== undefined) operator.country = country;
    if (status !== undefined)
      operator.status = status === true || status === "true";

    await operator.save();

    res.json({
      success: true,
      message: "Operator updated successfully",
      data: { operator },
    });
  } catch (error) {
    console.error("Update operator error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Operator with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error updating operator",
    });
  }
};

/**
 * Delete operator (soft delete by setting status to false)
 * DELETE /api/operators/:id
 */
exports.deleteOperator = async (req, res) => {
  try {
    const { id } = req.params;

    const operator = await Operators.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    // Soft delete by setting status to false
    operator.status = false;
    await operator.save();

    res.json({
      success: true,
      message: "Operator deleted successfully",
    });
  } catch (error) {
    console.error("Delete operator error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting operator",
    });
  }
};

/**
 * Toggle operator status
 * PATCH /api/operators/:id/status
 */
exports.toggleOperatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const operator = await Operators.findByPk(id);

    if (!operator) {
      return res.status(404).json({
        success: false,
        message: "Operator not found",
      });
    }

    if (status !== undefined) {
      operator.status = status === true || status === "true";
    } else {
      // Toggle if status not provided
      operator.status = !operator.status;
    }

    await operator.save();

    res.json({
      success: true,
      message: `Operator ${
        operator.status ? "activated" : "deactivated"
      } successfully`,
      data: { operator },
    });
  } catch (error) {
    console.error("Toggle operator status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating operator status",
    });
  }
};
