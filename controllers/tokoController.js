const db = require("../database/models")
const Toko = db.Toko;
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const store = async (req, res) => {
  try {
    // Validasi input menggunakan express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validasi gagal.',
        errors: errors.array(),
      });
    }

    const { toko_nama,toko_deskripsi } = req.body;
    let toko_image = null;

    if (req.file) {
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/toko/', sanitizedFilename);        
      fs.renameSync(req.file.path, imagePath);
      toko_image = `http://localhost:3000/images/toko/${sanitizedFilename}`;
    }

    const newToko = await Toko.create({
      toko_nama,
      toko_image,
      toko_deskripsi,
    });

    return res.status(200).json({
      success: true,
      message: 'Data berhasil disimpan.',
      data: {
        ...newToko.toJSON(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan data.',
      error: error.message,
    });
  }
};

const index = async (req, res) => {
    try {
        const result = await Toko.findAndCountAll()
        res.json(result).status(200)
    } catch (error) {
        res.json(error).status(422)
    }
}

const show = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Toko.findByPk(id);
    const result = data ? data : {};
    const response = {
      success: true,
      message: data ? "Data berhasil ditemukan" : `Data Toko dengan ID ${id} tidak ditemukan`,
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
      const toko = await Toko.findByPk(id);
  
      if (!toko) {
        return res.status(404).json({ message: 'toko not found' });
      }

      // Validasi menggunakan express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
      // Mendapatkan URL gambar lama sebelum diupdate
      const oldImageUrl = toko.toko_image;
  
      if (req.file) {
        // Menghapus gambar lama jika ada
        if (oldImageUrl) {
          const imagePath = path.join(__dirname, '..', 'public/toko/', getFileNameFromUrl(oldImageUrl));
          fs.unlinkSync(imagePath);
        }
      }
      
      // Mendapatkan URL gambar baru berdasarkan direktori dan nama file
      let imageUrl = oldImageUrl;
      if (req.file) {
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/toko/', sanitizedFilename);        
        fs.renameSync(req.file.path, imagePath);  
        imageUrl = `http://localhost:3000/images/toko/${sanitizedFilename}`;
      }
  
      const { toko_nama, toko_deskripsi } = req.body;
      await toko.update({
        toko_nama: toko_nama || toko.toko_nama,
        toko_image: imageUrl,
        toko_deskripsi: toko_deskripsi || toko.toko_deskripsi,
      }, {
        fields: ['toko_nama', 'toko_image', 'toko_deskripsi'],
      });
  
      return res.status(200).json({ message: 'toko updated', toko });
  
    } catch (error) {
      console.log(error);
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
  Toko.findByPk(req.params.id)
      .then((row) => {
          if (row) {
              // Mendapatkan path file gambar
              const imagePath = row.toko_image;

              // Hapus file gambar jika ada dan bukan gambar default
              if (imagePath) {
                filePath = path.join(__dirname, '..', 'public/toko/', getFileNameFromUrl(imagePath));
                fs.unlinkSync(filePath);
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