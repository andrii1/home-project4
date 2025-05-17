/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const questionsController = require('../controllers/questions.controller');

router.get('/', (req, res, next) => {
  questionsController
    .getQuestions()
    .then((result) => res.json(result))
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  questionsController
    .createQuestions(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
