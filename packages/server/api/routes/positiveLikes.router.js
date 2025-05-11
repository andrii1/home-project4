const express = require('express');

const router = express.Router({ mergeParams: true });
const positiveLikesController = require('../controllers/positiveLikes.controller');

router.get('/', (req, res, next) => {
  const { token } = req.headers;
  // TO DO : once we will add authentication I will update it
  if (req.query.appId && token) {
    positiveLikesController
      .getPositiveLikesByCodeId(token, req.query.codeId)
      .then((result) => res.json(result))
      .catch(next);
  } else if (token) {
    positiveLikesController
      .getPositiveLikesByUserId(token)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    positiveLikesController
      .getAllPositiveLikes()
      .then((result) => res.json(result))
      .catch(next);
  }
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  positiveLikesController
    .createPositiveLikes(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  const { token } = req.headers;
  positiveLikesController
    .deletePositiveLikes(token, req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
