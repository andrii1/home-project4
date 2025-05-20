/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const repliesController = require('../controllers/replies.controller');

router.get('/', (req, res, next) => {
  if (req.query.threadId) {
    repliesController
      .getRepliesByThread(req.query.threadId)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    try {
      repliesController
        .getReplies()
        .then((result) => res.json(result))
        .catch(next);
    } catch (error) {
      res.status(404).json({ error: 'Bad Get Request' });
    }
  }
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  repliesController
    .createReplies(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
