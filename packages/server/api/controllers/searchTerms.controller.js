/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

/* Get all topics */
const getSearchTerms = async () => {
  try {
    const searchTerms = await knex('searchTerms');
    // .select(
    //   'topics.id as id',
    //   'topics.title as title',
    //   'topics.category_id as categoryId',
    //   'categories.title as categoryTitle',
    // )
    // .join('searches', 'searches.search_term_id', '=', 'searchTerms.id');
    return searchTerms;
  } catch (error) {
    return error.message;
  }
};

// Get topics by Category
const getTopicsByCategory = async (category) => {
  try {
    const topics = await knex('topics').where({ category_id: category });
    return topics;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getSearchTerms,
  getTopicsByCategory,
};
