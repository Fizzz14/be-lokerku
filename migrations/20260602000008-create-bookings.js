'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      locationId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      lockerId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      sizeId: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Aktif'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    // Foreign key userId
    await queryInterface.addConstraint('Bookings', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_bookings_userId',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Foreign key locationId
    await queryInterface.addConstraint('Bookings', {
      fields: ['locationId'],
      type: 'foreign key',
      name: 'fk_bookings_locationId',
      references: {
        table: 'Locations',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Foreign key lockerId
    await queryInterface.addConstraint('Bookings', {
      fields: ['lockerId'],
      type: 'foreign key',
      name: 'fk_bookings_lockerId',
      references: {
        table: 'Lockers',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // Foreign key sizeId
    await queryInterface.addConstraint('Bookings', {
      fields: ['sizeId'],
      type: 'foreign key',
      name: 'fk_bookings_sizeId',
      references: {
        table: 'LockerSizes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};
