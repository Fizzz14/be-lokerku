'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user', constraints: false });
      Booking.belongsTo(models.Location, { foreignKey: 'locationId', as: 'location', constraints: false });
      Booking.belongsTo(models.Locker, { foreignKey: 'lockerId', as: 'locker', constraints: false });
      Booking.belongsTo(models.LockerSize, { foreignKey: 'sizeId', as: 'size', constraints: false });
      Booking.hasOne(models.Payment, { foreignKey: 'bookingId', as: 'payment', constraints: false });
      Booking.hasOne(models.AccessCard, { foreignKey: 'bookingId', as: 'accessCard', constraints: false });
    }
  }

  Booking.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      lockerId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      sizeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notes: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Aktif',
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    { sequelize, modelName: 'Booking' }
  );

  return Booking;
};
