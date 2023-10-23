const asyncHandler = require("express-async-handler");

const Group = require('../models/group');
const User = require('../models/user');

// GET user's groups
exports.user_groups_get = asyncHandler(async (req, res, next) => {
  const groups = await Group.find({ users: req.params.id });
  res.json(groups);
})


// test functions
exports.create_group = asyncHandler(async (req, res, next) => {
  const users = [];
  const user1 = await User.findById('6531038900a6fb5d566f0be2');
  const user2 = await User.findById('653103fee34793b9b2491f19');
  const user3 = await User.findById('65318e150d029949f5b5b1b9');
  users.push(user1);
  users.push(user2);
  users.push(user3);
  const group = new Group({
    users: users,
    title: 'Test group',
    admin: user1,
  })
  await group.save();
  res.end;
})

exports.get_group = asyncHandler(async (req, res, next) => {
  const group = await Group.find().populate('users', 'username').populate('admin', 'username');
  res.json(group);
})
