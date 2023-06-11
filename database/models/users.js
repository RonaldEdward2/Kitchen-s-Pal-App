"use strict";
const { Model } = require("sequelize");
const { notNull, notEmpty, isEmail } = require('validator');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      nama: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: 'Nama is required' },
          notEmpty: { msg: 'Nama cannot be empty' },
        },
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'Email is required' },
          notEmpty: { msg: 'Email cannot be empty' },
          isEmail: { msg: 'Invalid email format' },
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: 'Password is required' },
          notEmpty: { msg: 'Password cannot be empty' },
          len: { args: [8], msg: 'Password must be at least 8 characters long' },
        },
      },
      alamat: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'Alamat is required' },
          notEmpty: { msg: 'Alamat cannot be empty' },
        },
      },
      latitude: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'Latitude is required' },
          notEmpty: { msg: 'Latitude cannot be empty' },
        },
      },
      longitude: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'Longitude is required' },
          notEmpty: { msg: 'Longitude cannot be empty' },
        },
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true, // Pastikan kolom ini dapat bernilai null
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true, // Pastikan kolom ini dapat bernilai null
      },
      detail: DataTypes.TEXT,
      image: {
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
    },
    { 
      sequelize,
      modelName: "Users",
      hooks: {
        beforeCreate: (user) => {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(user.password, salt);
        },
        beforeUpdate: (user) => {
          if (user.changed('password')) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
      },
    }
  );
  return Users;
};
