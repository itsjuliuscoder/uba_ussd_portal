'use strict';
const {
    Model
} = require('sequelize');

/**
 * CardValidation Model
 * @module models/CardValidation
 */

module.exports = (sequelize, DataTypes) => {
    /**
     * CardValidation Class
     * @class
     * @extends Model
     */
    class CardValidation extends Model {
        /**
         * Associate CardValidation with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    /**
     * Initialize CardValidation model
     * @param {object} attrs - The attributes for CardValidation model
     * @param {object} options - The options for CardValidation model
     */
    CardValidation.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        sessionId: DataTypes.STRING,
        pan: {
            type: DataTypes.STRING,
        },
        accountNumber: DataTypes.STRING,
        walletId: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'CardValidation',
    });
    return CardValidation;
};