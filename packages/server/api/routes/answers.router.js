/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const answersController = require('../controllers/answers.controller');

router.get('/', (req, res, next) => {
  if (req.query.question) {
    answersController
      .getAnswersByQuestion(req.query.question)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    try {
      answersController
        .getAnswers()
        .then((result) => res.json(result))
        .catch(next);
    } catch (error) {
      res.status(404).json({ error: 'Bad Get Request' });
    }
  }
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  answersController
    .createAnswers(token, req.body, req.query.question)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
