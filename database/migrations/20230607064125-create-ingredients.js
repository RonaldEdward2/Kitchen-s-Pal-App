'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ENUM_VAL = ['sayuran', 'buah', 'daging']
    await queryInterface.createTable('Ingredients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ingredientnama: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ingredientjenis: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: ENUM_VAL,
        validate:{
          notNull: {message:"Role is required"},
          isIn:{
            args: {ENUM_VAL},
            msg: "Role must be sayuran, buah dan daging"
          }
        }
      },
      ingredientimage: {
        type: Sequelize.STRING
      },
      ingredientdeskripsi: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Ingredients');
  }
};