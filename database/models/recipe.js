'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Recipe.init({
    recipe_nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nama resep tidak boleh kosong',
        },
      },
    },
    recipe_image: {
      type: DataTypes.STRING(255),
      validate: {
        isImageValid(value) {
          if (!/\.(jpg|jpeg|png)$/.test(value)) {
            throw new Error('Format file harus JPG, JPEG, atau PNG');
          }
        },
        isFileSizeValid(value) {
          const maxSize = 500 * 1024; // 500 KB
          if (value && value.length > maxSize) {
            throw new Error('Ukuran file melebihi batas maksimal (500 KB)');
          }
        },
      },
    },    
    recipe_ingredients: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Bahan resep tidak boleh kosong',
        },
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Bahan resep harus berupa array');
          }
        },
      },
    },
    recipe_deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Deskripsi resep tidak boleh kosong',
        },
      },
    },
  },
   {
    sequelize,
    modelName: 'Recipe',
  });
  return Recipe;
};