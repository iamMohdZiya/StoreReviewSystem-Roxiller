const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(60), 
    allowNull: false,
    validate: {
      len: {
        args: [20, 60], 
        msg: "Name must be between 20 and 60 characters"
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true 
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  address: {
    type: DataTypes.STRING(400), 
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER'),
    defaultValue: 'NORMAL_USER',
    allowNull: false
  }
}, {
  timestamps: true 
});

module.exports = User;