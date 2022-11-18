const path = require('path');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Products = require('./products')(sequelize, Sequelize);
db.Users = require('./users')(sequelize, Sequelize);
db.Wishes = require('./wishes')(sequelize, Sequelize);
db.Biddings = require('./biddings')(sequelize, Sequelize);

db.Users.hasMany(db.Products, {
    foreignKey: 'seller',
    allowNull: false,
    constraints: true,
    onDelete: 'cascade'
});
db.Users.hasMany(db.Wishes, {
    foreignKey: 'user',
    allowNull: false,
    constraints: true,
    onDelete: 'cascade'
});
db.Users.hasMany(db.Biddings, {
    foreignKey: 'user',
    allowNull: false,
    constraints: true,
    onDelete: 'cascade'
});
db.Users.hasMany(db.Products, {
    foreignKey: 'buyer',
    allowNull: true,
    constraints: true,
    onDelete: 'set null'
});

db.Products.belongsTo(db.Users,{
    foreignKey: 'seller'
})
db.Products.belongsTo(db.Users,{
    foreignKey: 'buyer'
})
db.Products.hasMany(db.Wishes, {
    foreignKey: 'product',
    allowNull: false,
    constraints: true,
    onDelete: 'cascade'
});
db.Products.hasMany(db.Biddings, {
    foreignKey: 'product',
    allowNull: false,
    constraints: true,
    onDelete: 'cascade'
});

db.Wishes.belongsTo(db.Users,{
    foreignKey: 'user'
})
db.Wishes.belongsTo(db.Products,{
    foreignKey: 'product'
})

db.Biddings.belongsTo(db.Users,{
    foreignKey: 'user'
})
db.Biddings.belongsTo(db.Products,{
    foreignKey: 'product'
})

module.exports = db;