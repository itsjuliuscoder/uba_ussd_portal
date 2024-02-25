'use strict';
const {
    Model
} = require('sequelize');

/**
 * User Model
 * @module models/User
 */

module.exports = (sequelize, DataTypes) => {
    /**
     * User Class
     * @class
     * @extends Model
     */
    class User extends Model {
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
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        walletId: {
            type: DataTypes.STRING,
            unique: true
        },
        accountNumber: DataTypes.STRING,
        fullName: DataTypes.STRING,
        country: DataTypes.STRING,
        wallet: DataTypes.STRING,
        type: DataTypes.STRING,
        pin: DataTypes.STRING,
        accountStatus: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};


