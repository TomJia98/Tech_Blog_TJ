const router = require("express").Router();
const bodyParser = require("body-parser");
const app = require("express");
const { currentDate } = require("../utils/helpers");
const session = require("express-session");
const { User, Post, Comment } = require("../models");

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

  res.render("home", { userPosts, isLogged });
});

router.get("/login", async (req, res) => {
  res.render("login");
});

router.get("/signup", async (req, res) => {
  res.render("signup");
});

router.get("/comment:id", async (req, res) => {
  if (req.session.logged_in) {
    let data = req.params.id;

    const selectedPost = await Post.findAll({
      include: [
        {
          model: Comment,
          include: {
            model: User,
          },
        },
      ],
      where: {
        id: data,
      },
      raw: true,
    });
    const firstRes = selectedPost[0];

    const postId = firstRes["user_id"];
    const userData = await User.findOne({
      where: { id: postId },
      raw: true,
    });
    console.log(firstRes);
    res.render("add-comment", {
      userData,
      post: firstRes,
      selectedPost,
    });
  } else {
    res.render("login");
  }
});

router.post("/newcomment:id", async (req, res) => {
  const newComment = await Comment.create({
    post_id: req.params.id,
    description: req.body.comment,
    user_id: req.session.userId,
  });
  newComment;
  res.redirect(`/comment${req.params.id}`);
});

router.get("/dashboard", async (req, res) => {
  if (req.session.logged_in) {
    const userPosts = await Post.findAll({
      where: { user_id: req.session.userId },
      raw: true,
    });
    console.log(userPosts);
    res.render("dashboard", { userPosts });
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

      const userPosts = await Post.findAll({
        where: { user_id: req.session.userId },
        raw: true,
      });

      res.render("dashboard", { userPosts });
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
    res.redirect("/home");
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
  req.session.logged_in = true;
  req.session.user = req.body.username;
  req.session.userId = checkPW.id;
  res.render("dashboard");
});

module.exports = router;
