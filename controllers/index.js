const router = require("express").Router();
const { currentDate } = require("../utils/helpers");
const { User, Post, Comment } = require("../models");

router.get("/", (req, res) => {
  res.render("main");
}); //renders the main page

router.get("/home", async (req, res) => {
  //renders the homepage, which changes if your logged in
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
  res.render("login"); //renders the login page
});

router.get("/signup", async (req, res) => {
  res.render("signup"); //renders the signup page
});

router.get("/comment:id", async (req, res) => {
  //renders the comment page
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
    let areComments = true;
    if ((await selectedPost[0]["comments.id"]) == null) {
      areComments = false;
    }

    console.log(selectedPost[0]["comments.id"]);
    console.log(areComments);
    res.render("add-comment", {
      userData,
      post: firstRes,
      selectedPost,
      areComments,
    });
  } else {
    res.render("login");
  }
});

router.post("/newcomment:id", async (req, res) => {
  //adds the comment to the table
  const newComment = await Comment.create({
    post_id: req.params.id,
    description: req.body.comment,
    user_id: req.session.userId,
  });
  newComment;
  res.redirect(`/comment${req.params.id}`);
});

router.get("/deletepost:id", async (req, res) => {
  //deletes post
  if (req.session.logged_in) {
    //delete post, saves a js file being made
    const deletePost = await Post.destroy({
      where: { id: req.params.id },
    });
    deletePost;
    res.redirect("/dashboard");
  } else res.render("login");
});

router.post("/updatepost:id", async (req, res) => {
  //updates post in the table
  if (req.session.logged_in) {
    const updatePost = await Post.update(
      { title: req.body.title, description: req.body.description },
      { where: { id: req.params.id } }
    );
    updatePost;
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

router.get("/updatepost:id", async (req, res) => {
  //renders the selected post
  if (req.session.logged_in) {
    const selectedPost = await Post.findOne({
      where: { id: req.params.id },
      raw: true,
    });
    console.log(selectedPost);
    res.render("updatePost", selectedPost);
  } else {
    res.render("login");
  }
});

router.get("/dashboard", async (req, res) => {
  //renders the dashboard for the user
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
  //checks the login
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
  //renders the newpost page
  if (req.session.logged_in) {
    const date = currentDate();
    console.log(date);
    res.render("newpost");
  } else {
    res.render("dashboard");
  }
});

router.post("/newpost", async (req, res) => {
  //saves the newpost
  const newPost = await Post.create({
    title: req.body.title,
    description: req.body.description,
    user_id: req.session.userId,
  });
  newPost;
  res.render("newpost", { message: "New post created!" });
});

router.get("/logout", async (req, res) => {
  //logs the user out
  if (req.session.logged_in) {
    req.session.destroy();
    res.redirect("/home");
  } else {
    res.redirect("/login");
  }
});

router.post("/signup", async (req, res) => {
  //saves userdata to the table
  const newUser = await User.create({
    name: req.body.username,
    password: req.body.password,
  });
  newUser;
  res.redirect("/login");
});

module.exports = router;
