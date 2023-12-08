const router = require("express").Router();
const {
  login,
  signUp,
  verifyProfile,
  logout,
} = require("../controllers/auth");
const { verifyToken } = require("../utils/middleware");

router
  .post("/login", login) // route: POST api/auth/login - User Login
  .post("/signup", signUp) // route: POST api/auth/signup - User Signup
  .post("/verify", verifyToken, verifyProfile) // route: POST api/auth/verify - Verify User Profile
  .get("/logout", verifyToken, logout); // route: POST api/auth/change-password - Change User Profile

module.exports = router;
