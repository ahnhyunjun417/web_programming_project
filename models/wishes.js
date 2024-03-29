const {Sequelize, DataTypes} = require('sequelize');
module.exports = function(sequelize) {
    const Wishes = sequelize.define("Wishes", {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        }
    }, {
        tableName: 'Wishes',
        underscored: false,
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
    });
    return Wishes;
};
