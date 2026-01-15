"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * Admin Model
 * @module models/Admin
 */

module.exports = (sequelize, DataTypes) => {
  /**
   * Admin Class
   * @class
   * @extends Model
   */
  class Admin extends Model {
    /**
     * Associate Admin with other models
     * @static
     * @param {object} models - The database models
     */
    static associate(models) {
      // define association here
    }

    /**
     * Compare password with hashed password
     * @param {string} password - Plain text password
     * @returns {boolean} - True if password matches
     */
    async comparePassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }

  /**
   * Initialize Admin model
   * @param {object} attrs - The attributes for Admin model
   * @param {object} options - The options for Admin model
   */
  Admin.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: "admin",
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Admin",
      hooks: {
        beforeCreate: async (admin) => {
          if (admin.password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
        beforeUpdate: async (admin) => {
          if (admin.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(admin.password, salt);
          }
        },
      },
    }
  );
  return Admin;
};
