'use strict';
const {
    Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class CardlessTrans extends Model {

        /**
         * Associate Transaction with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    CardlessTrans.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        sessionId: {
            type: DataTypes.STRING,
        },
        transactionId: {
            type: DataTypes.STRING,
        },
        walletId: {
            type: DataTypes.STRING,
        },
        accountNo: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.STRING,
        },
        country: {
            type: DataTypes.STRING,
        },
        payCode: {
            type: DataTypes.STRING,
            unique: true
        },
        callbackUrl: DataTypes.STRING,
        currency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: DataTypes.STRING,
        type: DataTypes.STRING,
        statusCode: {
            type: DataTypes.STRING
        },
        statusMessage: {
            type: DataTypes.STRING
        }
    }, {
        sequelize,
        modelName: 'CardlessTrans',
    });

    return CardlessTrans;
}