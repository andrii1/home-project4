const express = require('express');

const router = express.Router({ mergeParams: true });
const negativeLikesController = require('../controllers/negativeLikes.controller');

router.get('/', (req, res, next) => {
  const { token } = req.headers;
  // TO DO : once we will add authentication I will update it
  if (req.query.appId && token) {
    negativeLikesController
      .getNegativeLikesByCodeId(token, req.query.codeId)
      .then((result) => res.json(result))
      .catch(next);
  } else if (token) {
    negativeLikesController
      .getNegativeLikesByUserId(token)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    negativeLikesController
      .getAllNegativeLikes()
      .then((result) => res.json(result))
      .catch(next);
  }
});

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  negativeLikesController
    .createNegativeLikes(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

router.delete('/:id', (req, res, next) => {
  const { token } = req.headers;
  negativeLikesController
    .deleteNegativeLikes(token, req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
