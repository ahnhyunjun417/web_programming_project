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
            field: 'status', // 0 일반 판매 중, 1 경매 판매 중, 2 판매 완료
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
        image1:{
            field: 'image1',
            type: DataTypes.STRING,
            allowNull: false,
        },
        image2:{
            field: 'image2',
            type: DataTypes.STRING,
            allowNull: true,
        },
        image3:{
            field: 'image3',
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
