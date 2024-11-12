'use strict';
const {
    Model
} = require('sequelize');

/**
 * Network Operator Model
 * @module models/NetworkOperator
 */

module.exports = (sequelize, DataTypes) => {
    /**
     * User Class
     * @class
     * @extends Model
     */
    class NetworkOperators extends Model {
        /**
         * Associate User with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    /**
     * Initialize User model
     * @param {object} attrs - The attributes for User model
     * @param {object} options - The options for User model
     */
    NetworkOperators.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        name: DataTypes.STRING,
        network_id: DataTypes.INTEGER,
        country: DataTypes.STRING,
        status: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'network_operators',
    });
    return NetworkOperators;
};


