"use strict";
const express = require("express");
const user = require("../controllers/userController");
const { verifyToken } = require('../middleware/verify.js') 
const router = express.Router();
const { body } = require('express-validator');


router.get(`/api/v1/user`, user.index);
router.post(`/api/v1/user`, user.store);
router.get(`/api/v1/user/:id`, user.show);
router.delete(`/api/v1/user/:id`, user.destroy);

const multer = require("multer");

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan direktori penyimpanan file
    cb(null, "../pal-kitchen/public/profiles/");
  },
  filename: function (req, file, cb) {
    // Tentukan nama file yang disimpan
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// Membuat middleware untuk mengunggah file menggunakan multer
const upload = multer({ storage: storage });

router.put('/api/v1/user/:id', upload.single('image'), [
  body('image')
    .custom((value, { req }) => {
      if (!req.file) {
        return true; // Tidak ada file yang diunggah, validasi dianggap berhasil
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
], user.update);


module.exports = router;
