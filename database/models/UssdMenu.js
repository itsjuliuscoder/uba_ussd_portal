'use strict';
const {
    Model
} = require('sequelize');

/**
 * UssdMenu Model
 * @module models/UssdMenu
 */

module.exports = (sequelize, DataTypes) => {
    /**
     * UssdMenu Class
     * @class
     * @extends Model
     */
    class UssdMenu extends Model {
        /**
         * Associate UssdMenu with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    /**
     * Initialize UssdMenu model
     * @param {object} attrs - The attributes for UssdMenu model
     * @param {object} options - The options for UssdMenu model
     */
    UssdMenu.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        walletId: {
            type: DataTypes.STRING,
        },
        sessionId: {
            type: DataTypes.STRING,
            unique: true
        },
        questionType: DataTypes.STRING,
        wallet: DataTypes.STRING,
        closeState: DataTypes.STRING,
        items: DataTypes.TEXT,
        steps: DataTypes.STRING,
        language: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'UssdMenu',
    });
    return UssdMenu;
};