/* TODO: This is just an example file to illustrate API routing and
documentation. Can be deleted when the first real route is added. */

const express = require('express');

const router = express.Router({ mergeParams: true });

// controllers
const dealsController = require('../controllers/deals.controller');

/**
 * @swagger
 * /exampleResource:
 *  get:
 *    tags:
 *    - exampleResource
 *    summary: Get all exampleResource
 *    description:
 *      Will return all exampleResource.
 *    produces: application/json
 *    responses:
 *      200:
 *        description: Successful request
 *      5XX:
 *        description: Unexpected error.
 */
router.get('/', (req, res, next) => {
  if (req.query.filteredTopics && req.query.search) {
    const array = req.query.filteredTopics.split(',');
    dealsController
      .getAppsByTopicsSearch(
        req.query.search,
        array,
        req.query.column,
        req.query.direction,
        req.query.page,
        req.query.size,
      )
      .then((result) => res.json(result))
      .catch(next);
  } else if (
    req.query.filteredTopics ||
    req.query.filteredCategories ||
    req.query.filteredApps ||
    req.query.filteredPricing ||
    req.query.filteredDetails
  ) {
    let arrayPricing;
    let arrayDetails;
    if (req.query.filteredPricing !== undefined) {
      const decoded = decodeURIComponent(req.query.filteredPricing);
      arrayPricing = decoded.split(',');
    }
    if (req.query.filteredDetails !== undefined) {
      const decoded = decodeURIComponent(req.query.filteredDetails);
      arrayDetails = decoded.split(',');
    }
    // const array = req.query.filteredTopics.split(',');
    dealsController
      .getAppsBy({
        page: req.query.page,
        column: req.query.column,
        direction: req.query.direction,
        filteredTopics: req.query.filteredTopics,
        filteredCategories: req.query.filteredCategories,
        filteredApps: req.query.filteredApps,
        filteredPricing: arrayPricing,
        filteredDetails: arrayDetails,
      })
      .then((result) => res.json(result))
      .catch(next);
  }
  // else if (req.query.filteredCategories) {
  //   const array = req.query.filteredCategories.split(',');
  //   appsController
  //     .getAppsByCategory(
  //       req.query.filteredCategories,
  //       req.query.page,
  //       req.query.column,
  //       req.query.direction,
  //     )
  //     .then((result) => res.json(result))
  //     .catch(next);
  // } else if (req.query.search) {
  //   appsController
  //     .getAppsSearch(
  //       req.query.search,
  //       req.query.column,
  //       req.query.direction,
  //       req.query.page,
  //       req.query.size,
  //     )
  //     .then((result) => res.json(result))
  //     .catch(next);
  // }
  else if (req.query.searchTerm) {
    dealsController
      .getAppsBySearchTerm(
        req.query.page,
        req.query.column,
        req.query.direction,
        req.query.searchTerm,
      )
      .then((result) => res.json(result))
      .catch(next);
  } else if (req.query.page) {
    dealsController
      .getApps(req.query.page, req.query.column, req.query.direction)
      .then((result) => res.json(result))
      .catch(next);
  } else {
    dealsController
      .getAppsAll()
      .then((result) => res.json(result))
      .catch(next);
  }
});

/* Create Apps */

router.post('/', (req, res, next) => {
  const { token } = req.headers;
  dealsController
    .createApps(token, req.body)
    .then((result) => res.json(result))
    .catch(next);
});

/**
 * @swagger
 * /exampleResources/{ID}:
 *  get:
 *    tags:
 *    - ExampleResources
 *    summary: Get exampleResource by ID
 *    description:
 *      Will return single exampleResource with a matching ID.
 *    produces: application/json
 *    parameters:
 *     - in: path
 *       name: ID
 *       schema:
 *         type: integer
 *         required: true
 *         description: The ID of the exampleResource to get
 *
 *    responses:
 *      200:
 *        description: Successful request
 *      5XX:
 *        description: Unexpected error.
 */

router.get('/:id', (req, res, next) => {
  dealsController
    .getAppById(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
});

module.exports = router;
