const {Sequelize, DataTypes} = require('sequelize');
module.exports = function(sequelize) {
    const Products = sequelize.define("Products", {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            field: 'price',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isAuction: {
            field: 'isAuction',
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        auctionEnd:{
            field: 'auctionEnd',
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            field: 'status',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        phone: {
            field: 'phone',
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            field: 'location',
            type: DataTypes.STRING,
            allowNull: false,
        },
        hashtag:{
            field: 'hashtag',
            type: DataTypes.STRING,
            allowNull: true,
        },
        image:{
            field: 'image',
            type: DataTypes.STRING,
            allowNull: false,
        },
        intro:{
            field: 'intro',
            type: DataTypes.STRING,
            allowNull: true,
        }
    }, {
        tableName: 'Products',
        underscored: false,
        freezeTableName: true,
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci"
    });
    return Products;
};
