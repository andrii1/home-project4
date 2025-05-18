/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const threadsController = require('../controllers/threads.controller');

router.get('/', (req, res, next) => {
  threadsController
    .getThreads()
    .then((result) => res.json(result))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  threadsController
    .getThreadById(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  threadsController
    .createThreads(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
