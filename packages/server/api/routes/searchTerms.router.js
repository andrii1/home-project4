/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });
// const topicAppsRouter = require('./topicApps.router');

// router.use('/:id/apps', topicAppsRouter);

// controllers
const searchTermsController = require('../controllers/searchTerms.controller');

router.get('/', (req, res, next) => {
  if (req.query.category) {
    searchTermsController
      .getTopicsByCategory(req.query.category)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    try {
      searchTermsController
        .getSearchTerms()
        .then((result) => res.json(result))
        .catch(next);
    } catch (error) {
      res.status(404).json({ error: 'Bad Get Request' });
    }
  }
});

module.exports = router;
