/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');

/* Get all topics */
const getKeywords = async () => {
  try {
    const keywords = await knex('keywords');
    // .select(
    //   'topics.id as id',
    //   'topics.title as title',
    //   'topics.category_id as categoryId',
    //   'categories.title as categoryTitle',
    // )
    // .join('searches', 'searches.search_term_id', '=', 'searchTerms.id');
    return keywords;
  } catch (error) {
    return error.message;
  }
};

// Get topics by Category
const getKeywordsByDeal = async (deal) => {
  try {
    const topics = await knex('keywords')
      .select('keywords.*')
      .join('deals', 'keywords.deal_id', '=', 'deals.id')
      .where({ deal_id: deal });
    return topics;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getKeywords,
  getKeywordsByDeal,
};
