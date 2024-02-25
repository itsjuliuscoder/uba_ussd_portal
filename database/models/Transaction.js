'use strict';
const {
    Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {

        /**
         * Associate Transaction with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    Transaction.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        walletId: {
            type: DataTypes.STRING,
        },
        transactionId: {
            type: DataTypes.STRING,
            unique: true
        },
        amount: DataTypes.STRING,
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: DataTypes.STRING,
        statusCode: {
            type: DataTypes.STRING
        },
        statusMessage: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CBAReference: {
            type: DataTypes.STRING
        },
    }, {
        sequelize,
        modelName: 'Transaction',
    });

    return Transaction;
}