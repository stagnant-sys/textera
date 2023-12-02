const asyncHandler = require("express-async-handler");

const Conversation = require('../models/conversation');
const User = require('../models/user');


// GET All user's conversations // SECURED
exports.user_conv_get = asyncHandler(async (req, res, next) => {
  console.log(req.token);
  if (req.headers.authorization !== req.params.id) {
    res.sendStatus(403);
  } else {
    const conv = await Conversation.find({ users: req.params.id })
    .sort({ updatedAt: -1 })
    .populate('users', 'username avatar');
    res.status(200).json(conv);
  }
})


// GET Conversation by ID // SECURED
exports.get_convById = asyncHandler(async (req, res, next) => {
  const conv = await Conversation.findById(req.params.id).populate('users', 'username avatar');
  const usersIds = [];
  conv.users.forEach((el) => usersIds.push(el._id.toString()))
  if (usersIds.includes(req.headers.authorization)) {
    res.status(200).json(conv);
  } else {
    res.sendStatus(403);
  }
})


// GET Conversation by users // SECURED
exports.get_conv_byUsers = asyncHandler(async (req, res, next) => {
  if (req.params.user1 === req.headers.authorization || req.params.user2 === req.headers.authorization) {
    const conv = await Conversation.find({users: { $all: [req.params.user1, req.params.user2] }});
    res.status(200).json(conv);  
  } else {
    res.sendStatus(403);
  }
})


// POST Create conversation
exports.create_conv = asyncHandler(async (req, res, next) => {
  const users = [];
  const user1 = await User.findById(req.body.user1);
  const user2 = await User.findById(req.body.user2);
  users.push(user1);
  users.push(user2);
  const conversation = new Conversation({
    users: users,
    lastMessage: '',
  })
  await conversation.save();
  res.json(conversation);
  res.status(200);
})


/*
TEST FUNCTIONS

GET All conversations
exports.get_conv = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.find().populate('users', 'username');
  res.json(conversation);
})
*/

