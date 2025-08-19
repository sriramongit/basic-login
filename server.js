require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const userModel = require("./models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const port = 3000;

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  // console.log(req.body);
  const password = req.body.password;
  const email = req.body.email ? req.body.email.toLowerCase() : "";

  let foundUser = await userModel.findOne({ email });

  if (!foundUser) {
    res.send(
      `Error: No user found with this id: ${email} \n\nPlease go to the sign up page`
    );
  } else {
    //password decryptiong and authentication
    bcrypt.compare(password, foundUser.password, function (err, result) {
      if (result) {
        let token = jwt.sign(
          { email: foundUser.email },
          process.env.JWT_SECRET
        );
        res.cookie("token", token);
        res.redirect("/dashboard");
      } else res.status(500).send("invalid credentials entered");
    });
  }
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.post("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/create", async (req, res) => {
  const { name, setPass, confPass } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase() : "";

  if (!name || !email || !setPass || !confPass) {
    res.send("Error: all fields are required");
  } else if (setPass !== confPass) {
    res.send("Error: Set password and confirm password must be same");
  } else {
    //creating the user
    let foundUser = await userModel.findOne({ email });
    if (foundUser) {
      res.send("Error: A User already exists with this email");
    } else {
      //password encryption and saving cookies in the browser
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(setPass, salt, async function (err, hash) {
          // Store hash in your password DB.
          const createdUser = await userModel.create({
            name,
            email,
            password: hash,
          });
          let token = jwt.sign({ email }, process.env.JWT_SECRET);
          res.cookie("token", token);
          res.redirect("/");
        });
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
