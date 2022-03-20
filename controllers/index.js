const router = require("express").Router();
const { raw } = require("body-parser");
const e = require("express");
const { currentDate } = require("../utils/helpers");
const session = require("express-session");
const { User, Post } = require("../models");

router.get("/", (req, res) => {
  res.render("main");
});

router.get("/home", async (req, res) => {
  isLogged = req.session.logged_in;
  const userPosts = await Post.findAll({
    attributes: { exclude: ["password"] },
    include: [
      {
        model: User,
        attributes: ["name"],
      },
    ],
    raw: true,
  });
  console.log(userPosts);
  res.render("home", { userPosts, isLogged });
});

router.get("/login", async (req, res) => {
  res.render("login");
});

router.get("/signup", async (req, res) => {
  res.render("signup");
});

router.get("/dashboard", async (req, res) => {
  if (req.session.logged_in) {
    const userPosts = await Post.findAll({
      where: { user_id: req.session.userId },
      raw: true,
    });
    console.log(userPosts);
    res.render("dashboardLoggedin", { userPosts });
  } else {
    res.render("login");
  }
});

router.post("/login", async (req, res) => {
  const checkPW = await User.findOne({
    where: { name: req.body.username },
  });

  if (!checkPW) {
    res.render("login", { message: "Invalid username or password" });
  } else {
    const validPassword = checkPW.checkPassword(req.body.password);
    if (validPassword) {
      req.session.logged_in = true;
      req.session.user = req.body.username;
      req.session.userId = checkPW.id;

      res.render("dashboard");
    } else {
      res.render("login", { message: "Invalid username or password" });
    }
  }
});

router.get("/newpost", async (req, res) => {
  if (req.session.logged_in) {
    const date = currentDate();
    console.log(date);
    res.render("newpost");
  } else {
    res.render("dashboard");
  }
});

router.post("/newpost", async (req, res) => {
  const newPost = await Post.create({
    title: req.body.title,
    description: req.body.description,
    user_id: req.session.userId,
  });
  newPost;
  res.render("newpost", { message: "New post created!" });
});

router.get("/logout", async (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy();
    res.render("home");
  } else {
    res.status(404).end();
  }
});

router.post("/signup", async (req, res) => {
  const newUser = await User.create({
    name: req.body.username,
    password: req.body.password,
  });
  newUser;
  res.render("dashboard");
});

module.exports = router;
