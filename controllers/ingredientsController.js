const db = require("../database/models")
const Ingredient = db.Ingredients;
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

    const { ingredient_nama, ingredient_jenis, ingredient_deskripsi } = req.body;
    let ingredient_image = null;

    if (req.file) {
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/ingredients/', sanitizedFilename);        
      fs.renameSync(req.file.path, imagePath);
      ingredient_image = `http://localhost:3000/images/ingredients/${sanitizedFilename}`;
    }

    const newIngredient = await Ingredient.create({
      ingredient_nama,
      ingredient_jenis,
      ingredient_image,
      ingredient_deskripsi,
    });

    return res.status(200).json({
      success: true,
      message: 'Data berhasil disimpan.',
      data: {
        ...newIngredient.toJSON(),
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
        const result = await Ingredient.findAndCountAll()
        res.json(result).status(200)
    } catch (error) {
        res.json(error).status(422)
    }
}

const show = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Ingredient.findByPk(id);
    const result = data ? data : {};
    const response = {
      success: true,
      message: data ? "Data berhasil ditemukan" : `Data Ingredient dengan ID ${id} tidak ditemukan`,
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
      const ingredient = await Ingredient.findByPk(id);
  
      if (!ingredient) {
        return res.status(404).json({ message: 'Ingredient not found' });
      }

      // Validasi menggunakan express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
      // Mendapatkan URL gambar lama sebelum diupdate
      const oldImageUrl = ingredient.ingredient_image;
  
      if (req.file) {
        // Menghapus gambar lama jika ada
        if (oldImageUrl) {
          const imagePath = path.join(__dirname, '..', 'public/ingredients/', getFileNameFromUrl(oldImageUrl));
          fs.unlinkSync(imagePath);
        }
      }
      
      // Mendapatkan URL gambar baru berdasarkan direktori dan nama file
      let imageUrl = oldImageUrl;
      if (req.file) {
        // warning! ini dindah karan baru
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/ingredients/', sanitizedFilename);        
        fs.renameSync(req.file.path, imagePath);  
        imageUrl = `http://localhost:3000/images/ingredients/${sanitizedFilename}`;
      }
  
      // Menggunakan validasi isIn untuk ingredient_jenis
      const { ingredient_nama, ingredient_jenis, ingredient_deskripsi } = req.body;
      await ingredient.update({
        ingredient_nama: ingredient_nama || ingredient.ingredient_nama,
        ingredient_jenis: ingredient_jenis || ingredient.ingredient_jenis,
        ingredient_image: imageUrl,
        ingredient_deskripsi: ingredient_deskripsi || ingredient.ingredient_deskripsi,
      }, {
        fields: ['ingredient_nama', 'ingredient_jenis', 'ingredient_image', 'ingredient_deskripsi'],
        validate: {
          ingredient_jenis: {
            isIn: [['buah', 'sayuran', 'daging']],
          },
        },
      });
  
      return res.status(200).json({ message: 'Ingredient updated', ingredient });
  
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
  Ingredient.findByPk(req.params.id)
      .then((row) => {
          if (row) {
              // Mendapatkan path file gambar
              const imagePath = row.ingredient_image;

              // Hapus file gambar jika ada dan bukan gambar default
              if (imagePath) {
                filePath = path.join(__dirname, '..', 'public/ingredients/', getFileNameFromUrl(imagePath));
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