"use strict";
const express = require("express");
const ingredient = require("../controllers/ingredientsController");
const { verifyToken } = require('../middleware/verify.js') 
const { body } = require('express-validator');
const router = express.Router();
const multer = require("multer");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan direktori penyimpanan file
    cb(null, "../pal-kitchen/public/ingredients/");
  },
  filename: function (req, file, cb) {
    // Tentukan nama file yang disimpan
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Membuat middleware untuk mengunggah file menggunakan multer
const upload = multer({ storage: storage });

router.get(`/api/v1/ingredient`, ingredient.index);
router.get(`/api/v1/ingredient/:id`, ingredient.show);
router.delete(`/api/v1/ingredient/:id`, ingredient.destroy);

router.post('/api/v1/ingredient', upload.single('ingredient_image'), [
  body('ingredient_nama').notEmpty().withMessage('Nama bahan tidak boleh kosong'),
  body('ingredient_jenis')
    .notEmpty().withMessage('Jenis bahan tidak boleh kosong')
    .isIn(['buah', 'sayuran', 'daging']).withMessage('Jenis bahan tidak valid'),
  body('ingredient_deskripsi').notEmpty().withMessage('Deskripsi bahan tidak boleh kosong'),
  body('ingredient_image')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Gambar bahan tidak ditemukan');
      }
      
      const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedFormats.includes(req.file.mimetype)) {
        throw new Error('Format gambar tidak valid. Hanya diperbolehkan format JPG, JPEG, dan PNG');
      }
      
      const maxSize = 500 * 1024; // 500KB
      if (req.file.size > maxSize) {
        throw new Error('Ukuran gambar terlalu besar. Maksimal 500KB');
      }
      
      return true;
    }),
], ingredient.store);

router.put("/api/v1/ingredient/:id", upload.single("ingredient_image"),[
  body('ingredient_image')
  .custom((value, { req }) => {
    if (!req.file) {
      throw new Error('Gambar bahan tidak ditemukan');
    }
    
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(req.file.mimetype)) {
      throw new Error('Format gambar tidak valid. Hanya diperbolehkan format JPG, JPEG, dan PNG');
    }
    
    const maxSize = 500 * 1024; // 500KB
    if (req.file.size > maxSize) {
      throw new Error('Ukuran gambar terlalu besar. Maksimal 500KB');
    }
    
    return true;
  }),
], ingredient.update);

module.exports = router;
