const config = require("./utils/config");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const { isAuth, verifyToken } = require("./utils/middleware");
const cookieParser = require("cookie-parser");
const conn = require("./db/dbConfig");

const app = express();

app.use(cors({origin:config.ORIGIN, credentials: true}));
app.use(express.json());
app.use(cookieParser(config.COOKIE_SECRET))

app.use(middleware.requestLogger);

app.use("/api/auth", authRouter);

app.use(middleware.unknownEndpoint);

const port = config.PORT || 8080;

// connect to database
conn.connect((err) => {
  if (err) throw err;
  console.log(`Connected with mysql database : ${config.DATABASE}...`);
  app.listen(port, () => {
    logger.error(`Server running on ${port}`);
  });
});


app.use(middleware.errorMiddleware);
