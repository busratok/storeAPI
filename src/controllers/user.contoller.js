"use strict";

const User = require("../models/userModel");
const passwordEncrypt = require("../helpers/passwordEncrypt");

module.exports = {
  list: async (req, res) => {
    const data = await User.find();
    res.status(200).send({
      isError: false,
      data,
    });
  },
  create: async (req, res) => {
    const data = await User.create(req.body);
    res.status(201).send({
      isError: false,
      data,
    });
  },
  read: async (req, res) => {
    const data = await User.findOne({ _id: req.params?.id });
    res.status(200).send({
      isError: false,
      data,
    });
  },
  update: async (req, res) => {
    const result = await User.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });
    res.status(201).send({
      isError: false,
      body: req.body,
      newData: await User.findOne({ _id: req.params?.id }),
      result,
    });
  },
  delete: async (req, res) => {
    const data = await User.deleteOne({ _id: req.params?.id });
    res.sendStatus(data.deletedCount ? 204 : 404);
  },
  login: async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      const user = await User.findOne({ email });
      if (user && user.password == passwordEncrypt(password)) {
        /* SESSION */
        req.session.id = user.id;
        req.session.password = user.password;
        /* SESSION */

        /* COOKIE */
        if (req.body?.remindMe) {
          req.session.remindMe = req.body.remindMe;
          // SET maxAge:
          req.sessionOptions.maxAge = 1000 * 60 * 60 * 24 * 3; // 3 days
        }
        /* COOKIE */

        res.status(200).send({
          error: false,
          message: "Login OK",
          user,
        });
      } else {
        res.errorStatusCode = 401;
        throw new Error("Login parameters are not true.");
      }
    } else {
      res.errorStatusCode = 401;
      throw new Error("Email and password are required.");
    }
  },
  logout: async (req, res) => {
    req.session = null;
    res.status(200).send({
      isError: false,
      message: "Logout OK",
    });
  },
};
