/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getOppositeOrderDirection = (direction) => {
  let lastItemDirection;
  if (direction === 'asc') {
    lastItemDirection = 'desc';
  } else if (direction === 'desc') {
    lastItemDirection = 'asc';
  }
  return lastItemDirection;
};

const getAppsAll = async () => {
  try {
    const apps = knex('codes')
      .select(
        'codes.*',
        'deals.title as dealTitle',
        'apps.title as appTitle',
        'apps.id as appId',
        'apps.topic_id as topic_id',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('deals', 'codes.deal_id', '=', 'deals.id')
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id');
    return apps;
  } catch (error) {
    return error.message;
  }
};

const getCodesByDeal = async (deal) => {
  try {
    const apps = knex('codes')
      .select(
        'codes.*',
        'deals.id as dealId',
        'deals.title as dealTitle',
        'users.full_name as userFullName',
        'apps.title as appTitle',
        'apps.id as appId',
        'apps.topic_id as topic_id',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('deals', 'codes.deal_id', '=', 'deals.id')
      .join('users', 'codes.user_id', '=', 'users.id')
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .where({
        'deals.id': deal,
      })
      .orderBy('id', 'desc');
    return apps;
  } catch (error) {
    return error.message;
  }
};

const getApps = async (page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('codes')
        .select(
          'codes.*',
          'deals.title as dealTitle',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'apps.topic_id as topic_id',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('deals', 'codes.deal_id', '=', 'deals.id')
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id');
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsPagination = async (column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .orderBy(column, direction);
    const totalCount = await getModel()
      .count('deals.id', { as: 'rows' })
      .groupBy('deals.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsSearch = async (search, column, direction, page, size) => {
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .orderBy(column, direction)
        .where('deals.title', 'like', `%${search}%`);
    const totalCount = await getModel()
      .count('deals.id', { as: 'rows' })
      .groupBy('deals.id');
    const data = await getModel()
      .offset(page * size)
      .limit(size)
      .select();
    const dataExport = await getModel().select();

    return {
      totalCount: totalCount.length,
      data,
      dataExport,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsByCategories = async (categories) => {
  try {
    const apps = await knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .whereIn('category_id', categories);

    return apps;
  } catch (error) {
    return error.message;
  }
};

const getAppsByTopics = async (topics) => {
  try {
    const apps = await knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .whereIn('topic_id', topics)
      .orderBy('id', 'asc');
    return apps;
  } catch (error) {
    return error.message;
  }
};

const getAppsByCategory = async (category, page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .where({
          'topics.category_id': category,
        });

    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsByTopic = async (topic, page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('apps')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .where({ topic_id: topic });
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsBySearchTerm = async (page, column, direction, searchTerm) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
          'searches.id as searchId',
          'searchTerms.title as searchTermTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .join('searches', 'searches.deal_id', '=', 'deals.id')
        .join('searchTerms', 'searchTerms.id', '=', 'searches.search_term_id')
        .where('searches.search_term_id', '=', `${searchTerm}`);
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getAppsBy = async ({
  page,
  column,
  direction,
  filteredTopics,
  filteredCategories,
  filteredApps,
  filteredPricing,
  filteredDetails,
}) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('codes')
        .select(
          'codes.*',
          'deals.title as dealTitle',
          'apps.title as appTitle',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'apps.topic_id as topic_id',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('deals', 'codes.deal_id', '=', 'deals.id')
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .modify((queryBuilder) => {
          if (filteredTopics !== undefined) {
            queryBuilder.where('topic_id', filteredTopics);
          }
          if (filteredCategories !== undefined) {
            queryBuilder.where('topics.category_id', filteredCategories);
          }
          if (filteredApps !== undefined) {
            queryBuilder.where('app_id', filteredApps);
          }
          if (filteredPricing !== undefined) {
            queryBuilder.whereIn('apps.pricing_type', filteredPricing);
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Browser extension')
          ) {
            queryBuilder.whereNotNull('apps.url_chrome_extension');
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('iOS app available')
          ) {
            queryBuilder.whereNotNull('apps.url_app_store');
          }
          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Android app available')
          ) {
            queryBuilder.whereNotNull('apps.url_google_play_store');
          }

          if (
            filteredDetails !== undefined &&
            filteredDetails.includes('Social media contacts')
          ) {
            queryBuilder
              .whereNotNull('apps.url_x')
              .orWhereNotNull('apps.url_discord');
          }
        });
    const lastItem = await getModel()
      .orderBy(column, lastItemDirection)
      .limit(1);
    const data = await getModel()
      .orderBy(column, direction)
      .offset(page * 10)
      .limit(10)
      .select();
    return {
      lastItem: lastItem[0],
      data,
    };
  } catch (error) {
    return error.message;
  }
};

// Get apps by id
const getAppById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const app = await knex('codes')
      .select(
        'codes.*',
        'deals.title as dealTitle',
        'deals.title_code as dealTitleCode',
        'deals.description as dealDescription',
        'deals.description_how_to_redeem as dealDescriptionHowToRedeem',
        'apps.title as appTitle',
        'apps.id as appId',
        'apps.description as appDescription',
        'apps.topic_id as topic_id',
        'apps.apple_id as appAppleId',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
        'apps.url_app_store as appUrlAppStore',
        'apps.url_google_play_store as appUrlGooglePlayStore',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('deals', 'codes.deal_id', '=', 'deals.id')
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .where({ 'codes.id': id });
    if (app.length === 0) {
      throw new HttpError(`incorrect entry with the id of ${id}`, 404);
    }
    return app;
  } catch (error) {
    return error.message;
  }
};

// post
const createCodes = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];

    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('Error - user not found', 401);
    }

    const codesByUser = (
      await knex('codes').where({ user_id: user.id }).count('codes.id AS count')
    )[0];

    if (codesByUser.count >= 5) {
      throw new HttpError('Error - too many codes added by user', 404);
    }

    await knex('codes').insert({
      title: body.title,
      description: body.description,
      url: body.url,
      deal_id: body.deal_id,
      user_id: user.id,
    });

    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

const createCodeNode = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    if (!body.deal_id) {
      throw new HttpError('No deal_id', 401);
    }

    // Optional: check for existing code
    const existing = await knex('codes')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        codeId: existing.id,
        codeTitle: body.title,
      };
    }

    // const existingDeal = await knex('deals')
    //   .whereRaw('LOWER(title) = ?', [body.dealTitle.toLowerCase()])
    //   .first();

    // const dealId = existingDeal.id;

    // if (existingDeal) {
    //   dealId = existingDeal.id;
    // } else {
    //   const [newDeal] = await knex('deals').insert({
    //     title: body.dealTitle,
    //   });
    //   dealId = newDeal;
    // }

    const [codeId] = await knex('codes').insert({
      title: body.title,
      url: body.url,
      deal_id: body.deal_id,
      user_id: user.id,
    });

    return {
      successful: true,
      codeId,
      codeTitle: body.title,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getApps,
  getAppsPagination,
  getAppsSearch,
  getAppsByCategories,
  getAppsByTopics,
  getAppsByTopic,
  getAppsBy,
  getAppsByCategory,
  getAppById,
  getAppsAll,
  createCodes,
  getAppsBySearchTerm,
  getCodesByDeal,
  createCodeNode,
};
