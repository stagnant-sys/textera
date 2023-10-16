const asyncHandler = require("express-async-handler");
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const firebaseFn = require('../firebaseFunctions');

exports.user_profile_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

exports.signup_get = asyncHandler(async (req, res, next) => {
  User.find({})
  .then((data, err) => {
    if (err) {
      console.log(err);
    }
    res.render('imagepage',{items: data})
  })
});

exports.signup_post = asyncHandler(async (req, res, next) => {
  firebaseFn.uploadFile(req.file.path, 'test');
  res.end();
  /*const user = {
    name: req.body.name,
    password: req.body.password,
    status: '',
    avatar: {
      data: fs.readFileSync(path.join(__dirname, '..', '/uploads/' + req.file.filename)),
      contentType: 'image/png'
    }
  }
  User.create(user)
  .then((err, item) => {
    if (err) {
      console.log(err);
    } else {
      item.save();
      res.end();
    }
  });*/
})