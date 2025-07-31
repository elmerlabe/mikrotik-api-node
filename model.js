const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

const Sale = sequelize.define("Sale", {
    date: DataTypes.STRING,
    time: DataTypes.STRING,
    code: DataTypes.STRING,
    amount: DataTypes.STRING,
    ip: DataTypes.STRING,
    mac: DataTypes.STRING,
    profile: DataTypes.STRING,
    comment: DataTypes.STRING,
})

module.exports = {Sale}