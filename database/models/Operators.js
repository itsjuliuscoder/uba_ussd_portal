'use strict';
const {
    Model
} = require('sequelize');


module.exports = (sequelize, DataTypes) => {
    class Operators extends Model {
        
        /**
         * Associate Transaction with other models
         * @static
         * @param {object} models - The database models
         */
        static associate(models){
            // define association here
        }
    }

    Operators.init({
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
        modelName: 'Operators',
    });
    return Operators;
}

