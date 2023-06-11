'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Toko extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Toko.init({
    toko_nama: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nama toko harus diisi.',
        },
      },
    },
    toko_image: {
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
    
    toko_deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Deskripsi toko harus diisi.',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Toko',
  });
  return Toko;
};