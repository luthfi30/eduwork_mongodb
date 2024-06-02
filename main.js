//imports
require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");

const PORT = process.env.PORT || 4000;

//database connection
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: "my secret key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.sessionID.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

//set template engine
app.set("view engine", "ejs");

//routes prefix
app.use("/", require("./routes/routes"));

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
