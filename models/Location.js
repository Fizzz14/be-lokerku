'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.belongsTo(models.Region, { foreignKey: 'regionId', as: 'region', constraints: false });
      Location.hasMany(models.Locker, { foreignKey: 'locationId', as: 'lockers', constraints: false });
      Location.hasMany(models.Booking, { foreignKey: 'locationId', as: 'bookings', constraints: false });
    }
  }

  Location.init(
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
      regionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      openHours: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '06.00 - 22.00'
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 4.8
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Aktif'
      },
    },
    { sequelize, modelName: 'Location' }
  );

  return Location;
};
