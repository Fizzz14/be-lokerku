'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AccessCards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      bookingId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      accessCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      qrPayload: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cardStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Foreign key bookingId
    await queryInterface.addConstraint('AccessCards', {
      fields: ['bookingId'],
      type: 'foreign key',
      name: 'fk_access_cards_bookingId',
      references: {
        table: 'Bookings',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('AccessCards');
  }
};
