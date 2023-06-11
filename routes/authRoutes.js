'use strict';
const express = require('express');
const auth = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const postParam = (req) => {
  const data = {
    nama: req.body.nama.trim(),
    email: req.body.email,
    password: req.body.password,
    alamat: req.body.alamat.trim(),
    latitude: req.body.latitude.trim(),
    longitude: req.body.longitude.trim(),
    detail: req.body.detail.trim()
  };

  return data;
}

const registerValidator = [
  body('nama').notEmpty(),
  body('email').notEmpty().withMessage('required value').isEmail(),
  body('alamat').notEmpty(),
  body('password').notEmpty(),
  body('latitude').notEmpty(),
  body('longitude').notEmpty(),
  body('detail').notEmpty()
];

const loginValidator = [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/api/v1/auth/register', registerValidator, (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }

  auth.register(postParam(req), res);
});

router.post('/api/v1/auth/login', loginValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors);
  }
  auth.authentication(req, res);
});
router.post('/api/v1/auth/reset-password', auth.resetPasswordRequest);
router.put('/api/v1/auth/reset-password/:token', auth.resetPassword);
router.post(`/api/v1/auth/logout`, auth.logout)

module.exports = router;