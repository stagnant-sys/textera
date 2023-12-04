require('dotenv').config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require("express-validator");
const firebaseFn = require('../firebaseFunctions');

const User = require('../models/user');

// SUPABASE config
const supabaseInit = require('@supabase/supabase-js');
const supabase = supabaseInit.createClient(process.env.SUPABASE_PROJECT, process.env.SUPABASE_KEY);

// GET user profile JSON
exports.user_profile_get = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json(user);
});

// GET user by username
exports.user_username_get = asyncHandler(async (req, res, next) => {
  const user = await User.find({ username: req.params.username }).select('username');
  res.json(user);
})

// GET user contacts
exports.get_contacts = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('contacts', 'username avatar');
  res.json(user.contacts);
});

// GET signup view
exports.signup_get = asyncHandler(async (req, res, next) => {
  User.find({})
  .then((data, err) => {
    if (err) {
      console.log(err);
    }
    res.render('imagepage',{items: data})
  })
});

// POST signup form
exports.signup_post = [
  body('username', 'Username must contain between 5 and 20 characters')
    .trim()
    .isLength({ min: 5, max: 20 })
    .escape()
    .unescape("&#39;", "'")
    .custom(async (value) => {
      const username = await User.find({ username: value }).exec();
      if (username.length) {
        throw new Error('This username is already in use')
      }
    }),
  body('password', 'Password must contain at least 5 characters')
    .trim()
    .isLength({ min: 5 })
    .escape(),
  body('password_confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Password confirm doesn\'t match')
      } else {
        return true;
      };
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json(errors.array());
      return;
    } else {
    // Send to Supabase for authentication
    const id = new mongoose.Types.ObjectId();
    const { data, error } = await supabase.auth.signUp(
      {
        email: req.body.username + "@email.com",
        password: req.body.password,
        options: {
          data: {
            username: req.body.username,
            uid: id,
          }
        }
      }
    )
    const user = new User({
      _id: data.user.user_metadata.uid,
      email: req.body.username + '@email.com',
      username: req.body.username,
      //password: req.body.password,
      avatar: 'https://firebasestorage.googleapis.com/v0/b/textera-e04fe.appspot.com/o/system%2Fuser_default.png?alt=media&token=4261b87a-533c-4886-840a-45a4b9b51ff4',
    });
    if (req.file) {
      const filetypeCheck = /(gif|jpe?g|tiff?|png|webp|bmp)$/i
      if (filetypeCheck.test(req.file.mimetype)) {
        avatarUrl = await firebaseFn.uploadFile(req.file.path, req.file.filename);
        user.avatar = avatarUrl;  
      }
    }
    await user.save();
    res.status(200).json(errors);
    }
  })
]

// GET login view
exports.login_get = asyncHandler(async (req, res, next) => {
  res.render('login');
})

// POST Login (Supabase)
exports.login_post = asyncHandler(async (req, res, next) => {
  try {
    await supabase.auth.signInWithPassword({
      email: req.body.username + "@email.com",
      password: req.body.password,
    })
    res.status(200);
  } catch {
    res.sendStatus(500);
  }
})

// POST Add contact
exports.add_contact = asyncHandler(async (req, res, next) => {
  // Prevent user from adding itself
  if (req.params.user === req.params.contact) {
    const err = "You can't add yourself to your contacts.";
    res.status(400).json(err);
  } else {
    // Get both users
    const user = await User.findById(req.params.user);
    const contact = await User.findById(req.params.contact);
    if (!user || !contact) {
      res.sendStatus(404);
    } else if (user.contacts.includes(contact._id) || user._id === contact._id) {
      const err = 'You already have this user in your contacts.';
      res.status(400).json(err);
    } else {
      // Add users to each other's contacts
      user.contacts.push(contact);
      contact.contacts.push(user);
      await user.save();
      await contact.save();
      res.status(200).end();
    }
  }
})

// PATCH change user avatar // SECURED
exports.change_avatar = asyncHandler(async (req, res, next) => {
  const errors = []
  if (req.headers.authorization !== req.body.userID) {
    res.sendStatus(403);
  } else {
// Validate file type
    const filetypeCheck = /(gif|jpe?g|tiff?|png|webp|bmp)$/i
    if (req.file && filetypeCheck.test(req.file.mimetype)) {
      avatarUrl = await firebaseFn.uploadFile(req.file.path, req.file.filename);
      // Get user
      const user = await User.findById(req.body.userID);
      user.avatar = avatarUrl;
      await user.save();
      res.status(200).json({errors, newAvatar: avatarUrl})
    } else if (!req.file) {
      errors.push('Choose an image');
      res.status(500).json({errors});
    } else {
      errors.push('Wrong file type');
      res.status(500).json({errors});
    }
  }
})

// PATCH delete user avatar // SECURED
exports.delete_avatar = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization !== req.body.userID) {
    res.sendStatus(403);
  } else {
    try {
      const user = await User.findById(req.body.userID);
      user.avatar = 'https://firebasestorage.googleapis.com/v0/b/textera-e04fe.appspot.com/o/system%2Fuser_default.png?alt=media&token=4261b87a-533c-4886-840a-45a4b9b51ff4';
      await user.save();
      res.sendStatus(200);  
    } catch {
      res.status(500);
    }
  }
})

// PATCH change user status
exports.change_status = asyncHandler(async (req, res, next) => {
  const errors = []
  if (req.headers.authorization !== req.body.userID) {
    res.sendStatus(403);
  } else {
    try {
      const user = await User.findById(req.body.userID);
      user.status = req.body.status;
      await user.save();
      res.status(200).json({ errors });
    } catch {
      errors.push('Unexpected error');
      res.status(500).json({ errors });
    }
  }
})


// Verify JWT
exports.verify_user = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) =>{
    if (err) {
      res.json(err)
      res.status(403);
    } else {
      res.json({
        message: 'Authorized',
        authData
      }
        );
    }
  })
});