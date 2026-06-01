'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessCard extends Model {
    static associate(models) {
      AccessCard.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking', constraints: false });
    }
  }

  AccessCard.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      accessCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qrPayload: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
      },
    },
    { sequelize, modelName: 'AccessCard' }
  );

  return AccessCard;
};
