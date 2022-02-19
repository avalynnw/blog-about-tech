const router = require('express').Router();
const { User } = require('../../models');

// create a new user
router.post('/', async (req, res) => {
  try {
    const userData = await User.create(req.body);

    // log the user in
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// login to the website
router.post('/login', async (req, res) => {
  try {
    // checks if there is a user with an email matching the input
    const userData = await User.findOne({ where: { username: req.body.username } });

    // if there's no user with that username, send an error
    if (!userData) {
      res
        .status(400)
        .json({ message: 'incorrect username or password, please try again' });
      return;
    }

    // check the password input
    const validPassword = await userData.checkPassword(req.body.password);

    // if the passwoird is invalid, send an error
    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'incorrect username or password, please try again' });
      return;
    }

    // sets current session to save data to the user's id and logs the user in
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      
      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

// logs out of the session
router.post('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
