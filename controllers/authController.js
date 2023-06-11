const db = require("../database/models");
const Users = db.Users;
const Blacklist = db.Blacklist
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const register = async (input, res) => {
  try {
    const { email } = input;

    // Cek apakah email sudah ada dalam database
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Buat pengguna baru jika email belum ada
    const save = await Users.create(input);

    return res.status(200).json({
      success: true,
      message: "Data berhasil disimpan.",
      data: save,
    });
  } catch (error) {
    return res.status(422).json(error);
  }
};

// data token akan ditampilkan dan bisa di simpan di cache frontend dan juga disimpan di database
const authentication = async (req, res) => {
  try {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const user = await Users.findOne({ where: { email: email } });

    if (!user) {
      res.status(422).json({ message: "User not found" });
      return;
    }

    const verify = await bcrypt.compare(password, user.password);

    if (!verify) {
      res.status(422).json({ message: "Incorrect password" });
      return;
    }

    const userToken = {
      id: user.id,
      email: user.email,
    };

    jwt.sign(
      { userToken },
      process.env.JWT_KEY,
      {
        expiresIn: "365d",
      },
      async (err, token) => {
        if (err) {
          res.status(500).json({ message: "Token creation failed" });
        } else {
          // Menyimpan token ke tabel pengguna
          user.token = token;
          await user.save();

          res.status(200).json({ token: token });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Authentication failed" });
  }
};

const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });

    await user.update({ resetPasswordToken: token });

    return res
      .status(200)
      .json({ message: "Reset password token created", token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await Users.findOne({ where: { resetPasswordToken: token } });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    await user.update({ password: password, resetPasswordToken: null });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      await Blacklist.create({ token: token });

      // Cari pengguna berdasarkan token
      const user = await Users.findOne({ where: { token: token } });
      if (user) {
        // Hapus isi kolom token pada pengguna
        user.token = null;
        await user.save();
      }

      res.json({ message: 'Logout successfully' }).status(200);
    } else {
      res.json({ message: 'Token required' }).status(422);
    }
  } catch (error) {
    console.log(error);
    res.json({ message: error }).status(422);
  }
};


module.exports = {
  register,
  authentication,
  resetPasswordRequest,
  resetPassword,logout
};
