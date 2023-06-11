const db = require("../database/models")
const User = db.Users;
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');


const store = async (req, res) => {
  try {
    const { email } = req.body;

    // Cek apakah email sudah ada dalam database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Buat pengguna baru jika email belum ada
    const newUser = await User.create(req.body);

    return res.status(200).json({
      success: true,
      message: 'Data berhasil disimpan.',
      data: newUser,
    });
  } catch (error) {
    return res.status(422).json({
      success: false,
      message: 'Gagal menyimpan data.',
      error: error.message,
    });
  }
};

const index = async (req, res) => {
    try {
        const result = await User.findAndCountAll()
        res.json(result).status(200)
    } catch (error) {
        res.json(error).status(422)
    }
}

const show = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await User.findByPk(id);
    const result = data ? data : {};
    const response = {
      success: true,
      message: data ? "Data berhasil ditemukan" : `Data user dengan ID ${id} tidak ditemukan`,
      data: result,
    };
    res.json(response).status(200);
  } catch (error) {
    res.json(error).status(422);
  }
};

const update = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validasi menggunakan express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Mendapatkan URL gambar lama sebelum diupdate
    const oldImageUrl = user.image;

    if (req.file) {
      // Menghapus gambar lama jika ada, kecuali jika gambar adalah default_img_profile.png
      if (oldImageUrl && oldImageUrl !== 'http://localhost:3000/images/profile/default_img_profile.png') {
        const imagePath = path.join(__dirname, '..', 'public/profiles/', getFileNameFromUrl(oldImageUrl));
        fs.unlinkSync(imagePath);
      }
    }
    
    // Mendapatkan URL gambar baru berdasarkan direktori dan nama file
    let imageUrl = oldImageUrl;
    if (req.file) {

    const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
    const imagePath = path.join(__dirname, '..', 'public/profiles/', sanitizedFilename);        
    fs.renameSync(req.file.path, imagePath);  
    imageUrl = `http://localhost:3000/images/profile/${sanitizedFilename}`;
    }
    
    user.nama = req.body.nama || user.nama;
    user.email = req.body.email || user.email;
    user.latitude = req.body.latitude || user.latitude;
    user.longitude = req.body.longitude || user.longitude;
    user.detail = req.body.detail || user.detail;
    user.image = imageUrl;
    await user.save();
    return res.status(200).json({ message: 'User updated', user });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Digunakan untuk memperoleh nama file dari URL gambar lama, yang kemudian digunakan untuk menghapus file tersebut sebelum memperbarui gambar dengan yang baru.
const getFileNameFromUrl = (url) => {
  const segments = url.split('/');
  return segments[segments.length - 1];
};

const destroy = (req, res) => {
  let msg;
  User.findByPk(req.params.id)
      .then((row) => {
          if (row) {
              // Mendapatkan path file gambar
              const imagePath = row.image;

              // Hapus file gambar jika ada dan bukan gambar default
              if (imagePath && imagePath !== 'http://localhost:3000/images/profile/default_img_profile.png') {
                  fs.unlinkSync(imagePath);
              }

              row.destroy();
              msg = "berhasil dihapus";
          } else {
              msg = `ID ${req.params.id} tidak ditemukan`;
          }
          res.json({ message: msg });
      })
      .catch((err) => {
          res.json({ message: err.message });
      });
};


module.exports = {
    index, show, store,
    update, destroy
}