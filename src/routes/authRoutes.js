const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    const user = new User({ email, password, first_name, last_name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'You must provide email' });
  }

  const user = await User.findOne({ email });
  if(!user) {
    return res.status(404).send({ error: 'Email not found' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY');
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: 'Invalid email and passwor' });
  }
});

router.use(requireAuth);

router.get('/users', async (req, res) => {
  const users = await User.find({ _id: req.user._id });

  res.send(users);
});

module.exports = router;
