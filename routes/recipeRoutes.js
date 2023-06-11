"use strict";
const express = require("express");
const recipe = require("../controllers/recipeController");
const { verifyToken } = require('../middleware/verify.js') 
const { body } = require('express-validator');
const router = express.Router();
const multer = require("multer");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan direktori penyimpanan file
    cb(null, "../pal-kitchen/public/recipes/");
  },
  filename: function (req, file, cb) {
    // Tentukan nama file yang disimpan
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Membuat middleware untuk mengunggah file menggunakan multer
const upload = multer({ storage: storage });

router.get(`/api/v1/recipe`, recipe.index);
router.get(`/api/v1/recipe/:id`, recipe.show);
router.delete(`/api/v1/recipe/:id`, recipe.destroy);

router.post('/api/v1/recipe', upload.single('recipe_image'), [
  body('recipe_nama').notEmpty().withMessage('Nama bahan tidak boleh kosong'),
  body('recipe_deskripsi').notEmpty().withMessage('Deskripsi bahan tidak boleh kosong'),
  body('recipe_image')
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
], recipe.store);

router.put("/api/v1/recipe/:id", upload.single("recipe_image"),[
  body('recipe_image')
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
], recipe.update);

module.exports = router;
