const db = require("../database/models")
const Recipe = db.Recipe;
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
  
      const { recipe_nama, recipe_ingredients, recipe_deskripsi } = req.body;
      let recipe_image = null;
  
      if (req.file) {
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/recipes/', sanitizedFilename);
        fs.renameSync(req.file.path, imagePath);
        recipe_image = `http://localhost:3000/images/recipes/${sanitizedFilename}`;
      }
  
      const ingredients = JSON.parse(recipe_ingredients); // Parse string JSON menjadi objek JavaScript
  
      const newRecipe = await Recipe.create({
        recipe_nama,
        recipe_ingredients: ingredients,
        recipe_image,
        recipe_deskripsi,
      });
  
      return res.status(200).json({
        success: true,
        message: 'Data berhasil disimpan.',
        data: {
          ...newRecipe.toJSON(),
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
        const result = await Recipe.findAndCountAll()
        res.json(result).status(200)
    } catch (error) {
        res.json(error).status(422)
    }
}

const show = async (req, res) => {const show = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Recipe.findByPk(id);
    if (data) {
      // Ubah format data recipe_ingredients
      const ingredients = data.recipe_ingredients.map((ingredient) => {
        return {
          nama: ingredient.nama,
          bahan: ingredient.bahan,
        };
      });

      const result = {
        ...data.toJSON(),
        recipe_ingredients: ingredients,
      };

      const response = {
        success: true,
        message: "Data berhasil ditemukan",
        data: result,
      };
      res.json(response).status(200);
    } else {
      const response = {
        success: false,
        message: `Data Recipe dengan ID ${id} tidak ditemukan`,
        data: {},
      };
      res.json(response).status(200);
    }
  } catch (error) {
    res.json(error).status(422);
  }
};

  const id = req.params.id;
  try {
    const data = await Recipe.findByPk(id);
    const result = data ? data : {};
    const response = {
      success: true,
      message: data ? "Data berhasil ditemukan" : `Data Recipe dengan ID ${id} tidak ditemukan`,
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
      const recipe = await Recipe.findByPk(id);
  
      if (!recipe) {
        return res.status(404).json({ message: 'recipe not found' });
      }

      // Validasi menggunakan express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
      // Mendapatkan URL gambar lama sebelum diupdate
      const oldImageUrl = recipe.recipe_image;
  
      if (req.file) {
        // Menghapus gambar lama jika ada
        if (oldImageUrl) {
          const imagePath = path.join(__dirname, '..', 'public/recipes/', getFileNameFromUrl(oldImageUrl));
          fs.unlinkSync(imagePath);
        }
      }
  
      // Mendapatkan URL gambar baru berdasarkan direktori dan nama file
      let imageUrl = oldImageUrl;
      if (req.file) {
        const sanitizedFilename = req.file.filename.replace(/\s+/g, '-');
        const imagePath = path.join(__dirname, '..', 'public/recipes/', sanitizedFilename);
        fs.renameSync(req.file.path, imagePath);
        imageUrl = `http://localhost:3000/images/recipes/${sanitizedFilename}`;
      }
  
      // Menggunakan validasi isIn untuk recipe_ingredients
      const { recipe_nama, recipe_ingredients, recipe_deskripsi } = req.body;
      const updatedRecipe = await recipe.update({
        recipe_nama: recipe_nama || recipe.recipe_nama,
        recipe_ingredients: JSON.parse(recipe_ingredients) || recipe.recipe_ingredients,
        recipe_image: imageUrl,
        recipe_deskripsi: recipe_deskripsi || recipe.recipe_deskripsi,
      });
  
      return res.status(200).json({ message: 'recipe updated', recipe: updatedRecipe });
  
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
  Recipe.findByPk(req.params.id)
      .then((row) => {
          if (row) {
              // Mendapatkan path file gambar
              const imagePath = row.recipe_image;

              // Hapus file gambar jika ada dan bukan gambar default
              if (imagePath) {
                filePath = path.join(__dirname, '..', 'public/recipes/', getFileNameFromUrl(imagePath));
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