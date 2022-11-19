const {Sequelize, DataTypes} = require('sequelize');
module.exports = function(sequelize) {
    const Users = sequelize.define("Users", {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            field: 'userId',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            field: 'password',
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            field: 'isActive',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        authority:{ // 1: 구매자 2: 판매자 3: 관리자
            field: 'authority',
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        tableName: 'Users',
        underscored: false,
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
    });
    return Users;
};
