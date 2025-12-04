const { sequelize } = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');


User.hasOne(Store, { foreignKey: 'ownerId', as: 'managedStore' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });


User.hasMany(Rating, { onDelete: 'CASCADE' });
Rating.belongsTo(User);


Store.hasMany(Rating, { onDelete: 'CASCADE' });
Rating.belongsTo(Store);

const syncDB = async () => {
 
    await sequelize.sync({ alter: true }); 
    console.log("All models were synchronized successfully.");
};

module.exports = { User, Store, Rating, syncDB };