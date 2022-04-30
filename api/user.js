const express = require("express");
const usersRouter = express.Router();
const {
  getAllUsers,
  getUserByUsername,
  createUser,
  getUserById,
} = require("../db");
const { requireUser } = require("./utils");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
require("dotenv").config();

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});
usersRouter.post("/register", async (req, res, next) => {
  const { username, password, email } = req.body;
  try {
    const _user = await getUserByUsername(username);

    console.log("REACHING api", _user);
    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    } else {
      console.log(username + " " + password + " " + email + " register user");
      const user = await createUser({ username, password, email });

      if (user) {
        console.log(user, "user in backend");
        console.log(JWT_SECRET, "trying to get jwt secret");
        const token = jwt.sign(
          {
            id: user.id,
          },
          JWT_SECRET,
          { expiresIn: "1w" }
        );
        console.log("jwt signed in");
        console.log(token, "token in api");
        console.log(typeof token);
        res.send({ user, message: "you're signed up!", token });
      } else {
        next({
          name: "UserCreationError",
          message: "There was a problem with registration. Please try again.",
        });
      }
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = usersRouter;
