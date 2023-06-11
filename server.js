const express = require('express')
const app = express()
const routes = require('./routes')
require("dotenv").config()
app.use(express.static('public'));

app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(routes);

const server = app.listen(process.env.APP_PORT, () => console.log(`Api Berjalan di Port ${process.env.APP_PORT}`))

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Menutup server http.');
  server.close(() => {
    console.log('Server http ditutup.');
    process.exit(0);
  });
});

// Rute untuk mengakses gambar profil
app.get('/images/profile/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile(`${__dirname}/public/profiles/${imageName}`);
});

// Rute untuk mengakses gambar ingredients
app.get('/images/ingredients/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile(`${__dirname}/public/ingrediants/${imageName}`);
});

// Rute untuk mengakses gambar recipes
app.get('/images/recipes/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile(`${__dirname}/public/recipes/${imageName}`);
});

// Rute untuk mengakses gambar toko
app.get('/images/toko/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  res.sendFile(`${__dirname}/public/toko/${imageName}`);
});

// const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_KEY;
// console.log('JWT Secret Key:', jwtSecret);

// function getUserIdFromToken(token) {
//   try {
//     const decodedToken = jwt.verify(token, jwtSecret);
//     const userId = decodedToken.userToken.id;
//     return userId;
//   } catch (error) {
//     return null;
//   }
// }

// // Contoh penggunaan
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVG9rZW4iOnsiaWQiOjI1LCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20ifSwiaWF0IjoxNjg1OTY4NDQ0LCJleHAiOjE3MTc1MDQ0NDR9.AdqFvji3rB5xwNkTqnM-Q8rLsaNUnZXaq7TtagDzQEE'; // Ganti dengan token yang didapatkan setelah login
// const userId = getUserIdFromToken(token);
// if (userId) {
//   console.log('User ID:', userId);

// } else {
//   console.log('Token tidak valid atau sudah kedaluwarsa');
// }

