const jwt = require("jsonwebtoken");
const config = require("../utils/config");
const bcrypt = require("bcrypt");
const ErrorHandler = require("../utils/ErrorHandler");
const { asyncHandler } = require("../utils/middleware");
const logger = require("../utils/logger");
const ejs = require("ejs");
const path = require("path");
const sendMail = require("../utils/sendMail");
const { COOKIE_NAME } = require("../utils/constants");
const conn = require("../db/dbConfig");

// route: POST /auth/login || User Login
const login = asyncHandler(async (req, res, next) => {
  try {
    // Extract necessary data from the request body
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send({
        success: false,
        message: "Error: Missing Email or Password",
      });
    }
      let sql ="SELECT * FROM users WHERE email=?";
      conn.query(sql,[email], async (err, result)=>{
        if(err) throw err;
        
        const user = result[0];

        const isCorrectPassword = user
          ? await bcrypt.compare(password, user.password)
          : false;
        
        if (!(user && isCorrectPassword)) {
          return next(new ErrorHandler("Invalid username or password", 400));
        }
        res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          domain: config.COOKIE_DOMAIN,
          signed: true,
          path: "/",
        });
        const userForToken = {
          email: user.email,
          id: user._id,
        };
  
        const token = createToken(userForToken, config.SECRET, "7d");
  
        // Send a success message, token and the logged user as a response
        res.cookie(COOKIE_NAME, token, {
          path: "/",
          domain: config.COOKIE_DOMAIN,
          // days * hours * minutes * seconds * milliseconds
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          signed: true,
        });
        res.status(200).send({
          success: true,
          message: "Logged In Successfully.",
          user: { id: user.id, email: user.email },
        });

      });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const logout = asyncHandler(async (req, res, next) => {
  try {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: config.COOKIE_DOMAIN,
        signed: true,
        path: "/",
      });
      res.status(200).send({
        success: true,
        message: "Logged Out Successfully.",
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// route: POST /auth/signup || User Signup
const signUp = asyncHandler(async (req, res, next) => {
  try {
    // Extract necessary data from the request body
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    let sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, [email], async (err, result) => {
      if (err) throw err;

      const isEmailExist = result[0];
      //check if email exists
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exist.", 400));
      }
      logger.info(isEmailExist);

      const user = req.body;
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        domain: config.COOKIE_DOMAIN,
        signed: true,
        path: "/",
      });

      const { verificationCode, token } = createVerificationData(user);
      logger.info(verificationCode);
      const data = { user: { username }, verificationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/account-verification.ejs"),
        data
      );

      try {
        await sendMail({
          email,
          subject: "Activate Your Account",
          template: html,
          data,
        });

        res.cookie(COOKIE_NAME, token, {
          path: "/",
          domain: config.COOKIE_DOMAIN,
          // minutes * seconds * milliseconds
          maxAge: 10 * 60 * 1000, //10 minutes

          httpOnly: true,
          signed: true,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email: ${email} to verify your account.`,
        });
      } catch (error) {
        logger.error(error);
        return next(new ErrorHandler(error.message, 400));
      }
    });
  } catch (error) {
    logger.error(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

const verifyProfile = asyncHandler(async (req, res, next) => {
  try {
    // Extract the verification code from the request body
    const { verificationCode } = req.body;

    // Get the user from the database
    // const user = await userQueries.getUserByEmail(req.decodedToken.user.email);
    const {username, password, email} = req.decodedToken.user;
    let sql = "SELECT * FROM users WHERE email=?";
    conn.query(sql, [email], async (err, result) => {
      if (err) throw err;
      const user = result[0];
      logger.info(user);
      // If the user is already verified, return an error message
      if (user?.isVerified) {
        return next(new ErrorHandler("User is already verified.", 400));
      }
      // Validate the verification code
      if (
        parseInt(req.decodedToken.verificationCode) !==
        parseInt(verificationCode)
      ) {
        return next(new ErrorHandler("Invalid verification code.", 400));
      }

      // Save the user's account with status verified
      conn.query(
        "INSERT INTO users SET ?",
        {
          username,
          email,
          password: await generateHashPassword(password),
          isVerified: true,
        },
        (err, results) => {
          if (!err) {

            // Return a response to indicate that the profile has been verified
            let sql = "SELECT id,email,isVerified FROM users WHERE email=?";
            conn.query(sql, [email], (err, result) => {
              if (err) throw err;
              // Send a success message to the client
              res.status(200).json({
                success: true,
                message: "Account verified successfully.",
                result: result[0],
              });
            });
          } else {
            logger.error(err);
          }
        }
      );
    });
  } catch (error) {
    logger.error(error);
    return next(new ErrorHandler(error.message, 400));
  }
});

module.exports = { login, signUp, verifyProfile, logout };

const createVerificationData = (user) => {
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = createToken({ user, verificationCode }, config.SECRET, "5m");

  return { verificationCode, token };
};

//hash password
const generateHashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

const createToken = (data, secret, expiresIn) => {
  return jwt.sign(data, secret, { expiresIn });
};