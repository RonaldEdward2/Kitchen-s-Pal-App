'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama: {
        type: Sequelize.STRING(100)
      },
      email: {
        type: Sequelize.STRING(50)
      },
      password: {
        type: Sequelize.STRING(100)
      },
      alamat: {
        type: Sequelize.TEXT
      },
      latitude: {
        type: Sequelize.STRING(50)
      },
      longitude: {
        type: Sequelize.STRING(50)
      },
      detail: {
        type: Sequelize.TEXT
      },
      img: {
        type: Sequelize.STRING(100)
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};