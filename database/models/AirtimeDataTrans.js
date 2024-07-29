'use strict';
const {
    Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class AirtimeDataTrans extends Model {

        /**
         * Associate Transaction with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    AirtimeDataTrans.init({
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
        modelName: 'AirtimeDataTrans',
    });

    return AirtimeDataTrans;
}