'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role', constraints: false });
      User.hasMany(models.Booking, { foreignKey: 'userId', as: 'bookings', constraints: false });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: DataTypes.STRING,
      address: DataTypes.TEXT,
      roleId: DataTypes.BIGINT,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Aktif',
      },
      image: DataTypes.STRING,
    },
    { sequelize, modelName: 'User' }
  );

  return User;
};
