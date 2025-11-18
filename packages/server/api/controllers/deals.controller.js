/* eslint-disable import/no-extraneous-dependencies */
/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

require('dotenv').config();
const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');
const { normalizeUrl } = require('../lib/utils/normalizeUrl');
const OpenAI = require('openai');

const { BetaAnalyticsDataClient } = require('@google-analytics/data').v1beta;

const credentials = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    'base64',
  ).toString('utf-8'),
);
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
});

const propertyId = '451225270';
// Get the day 31 days ago
const today = new Date().getTime() - 60 * 60 * 24 * 31 * 1000;
// Get the day, month and year
const day = new Date(today).getDate();
const month = new Date(today).getMonth() + 1;
const year = new Date(today).getFullYear();
// Put it in Google's date format
const dayFormat = `${year}-${month}-${day}`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

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
    const apps = knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
        'apps.topic_id as topic_id',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.apple_id as appAppleId',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id');
    return apps;
  } catch (error) {
    return error.message;
  }
};

const getDealsTrending = async (page) => {
  try {
    // ---- 1️⃣ Get DEAL analytics ----
    const [response] = await analyticsDataClient.runReport({
      // eslint-disable-next-line prefer-template
      property: 'properties/' + propertyId,
      dateRanges: [
        {
          // Run from today to 31 days ago
          startDate: dayFormat,
          endDate: 'today',
        },
      ],
      dimensions: [
        {
          // Get the page path
          name: 'pagePathPlusQueryString',
        },
      ],
      metrics: [
        {
          // And tell me how many active users there were for each of those
          name: 'activeUsers',
        },
      ],
    });
    const regex = /\/deals\/\d+$/;
    const dealsAnalytics = response.rows
      .filter((item) => regex.test(item.dimensionValues[0].value))
      .map((item) => {
        return {
          dealId: item.dimensionValues[0].value.split('deals/')[1],
          url: item.dimensionValues[0].value,
          activeUsers: Number(item.metricValues[0].value),
        };
      });

    // ---- 2️⃣ Get CODE analytics ----
    const [codeResponse] = await analyticsDataClient.runReport({
      property: 'properties/' + propertyId,
      dateRanges: [{ startDate: dayFormat, endDate: 'today' }],
      dimensions: [{ name: 'pagePathPlusQueryString' }],
      metrics: [{ name: 'activeUsers' }],
    });

    const codeRegex = /\/codes\/\d+$/;
    const codesAnalytics =
      codeResponse.rows
        ?.filter((item) => codeRegex.test(item.dimensionValues[0].value))
        .map((item) => ({
          codeId: item.dimensionValues[0].value.split('codes/')[1],
          url: item.dimensionValues[0].value,
          activeUsers: Number(item.metricValues[0].value),
        })) || [];

    // ---- 3️⃣ Get all DEALS with their related info ----
    const allDeals = await knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
        'apps.topic_id as topic_id',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.apple_id as appAppleId',
        'apps.url_image as appUrlImage',
        'topics.title as topicTitle',
        'topics.category_id as category_id',
        'categories.title as categoryTitle',
      )
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id');

    // ---- 4️⃣ For each deal, fetch related CODES from DB ----
    const allCodes = await knex('codes')
      .select('codes.id', 'codes.deal_id')
      .join('deals', 'codes.deal_id', '=', 'deals.id');

    // const dealsWithAnalytics = allDeals
    //   .map((deal) => ({
    //     ...deal,
    //     activeUsers: dealsAnalytics?.some(
    //       (e) => e.dealId.toString() === deal.id.toString(),
    //     )
    //       ? dealsAnalytics
    //           .filter((item) => item.dealId.toString() === deal.id.toString())
    //           .map((item) => item.activeUsers)
    //           .toString()
    //       : null,
    //   }))
    //   .filter((item) => item.activeUsers)
    //   .sort((a, b) => {
    //     return b.activeUsers - a.activeUsers;
    //   });

    // ---- 5️⃣ Combine DEAL + CODE analytics ----
    const dealsWithAnalytics = allDeals
      .map((deal) => {
        const dealMatch = dealsAnalytics.find(
          (d) => d.dealId.toString() === deal.id.toString(),
        );
        const dealActive = dealMatch ? dealMatch.activeUsers : 0;

        // Find related codes for this deal
        const relatedCodes = allCodes.filter(
          (c) => c.deal_id.toString() === deal.id.toString(),
        );

        // Sum activeUsers for those codes
        const codeActiveSum = relatedCodes.reduce((sum, c) => {
          const codeAnalytic = codesAnalytics.find(
            (ca) => ca.codeId.toString() === c.id.toString(),
          );
          return sum + (codeAnalytic ? codeAnalytic.activeUsers : 0);
        }, 0);

        return {
          ...deal,
          activeUsers: dealActive,
          activeUsersWithCodes: dealActive + codeActiveSum,
        };
      })
      // Keep only deals with some engagement
      .filter((item) => item.activeUsersWithCodes > 0)
      // Sort by total active users (including codes)
      .sort((a, b) => b.activeUsersWithCodes - a.activeUsersWithCodes);

    // Get only top 100 deals
    const topDeals = dealsWithAnalytics.slice(0, 100);

    // ---- 6️⃣ Pagination (10 per page) ----

    // Lowest activeUsers among all deals

    const lastItem = topDeals[topDeals.length - 1] || null;

    const limit = 10;
    const start = page * limit;
    const data = topDeals.slice(start, start + limit);

    // Last item (lowest activeUsers on the current page)
    // const lastItem = data[data.length - 1] || null;

    return {
      lastItem,
      data,
    };
  } catch (error) {
    return error.message;
  }
};

const getApps = async (page, column, direction) => {
  const lastItemDirection = getOppositeOrderDirection(direction);
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'apps.title as appTitle',
          'apps.apple_id as appAppleId',
          'apps.description as appDescription',
          'apps.url as appUrl',
          'apps.url_image as appUrlImage',
          'apps.topic_id as topic_id',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
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

const getAppsByCategoriesSearch = async (
  search,
  categories,
  column,
  direction,
  page,
  size,
) => {
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .whereIn('category_id', categories)
        .where('deals.title', 'like', `%${search}%`)
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

const getDealsByApp = async (app) => {
  try {
    const apps = await knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
        'apps.description as appDescription',
        'apps.url as appUrl',
        'apps.url_image as appUrlImage',
      )
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .where('app_id', app);

    return apps;
  } catch (error) {
    return error.message;
  }
};

const getAppsByTopicsSearch = async (
  search,
  topics,
  column,
  direction,
  page,
  size,
) => {
  try {
    const getModel = () =>
      knex('deals')
        .select(
          'deals.*',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .whereIn('topic_id', topics)
        .where('deals.title', 'like', `%${search}%`)
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
          'searches.title as searchTitle',
        )
        .join('apps', 'deals.app_id', '=', 'apps.id')
        .join('topics', 'apps.topic_id', '=', 'topics.id')
        .join('categories', 'topics.category_id', '=', 'categories.id')
        .join('searchesDeals', 'searchesDeals.deal_id', '=', 'deals.id')
        .join('searches', 'searches.id', '=', 'searchesDeals.search_id')
        .where('searches.id', '=', `${searchTerm}`);
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
  search,
}) => {
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
          'apps.topic_id as topic_id',
          'apps.apple_id as appAppleId',
          'topics.title as topicTitle',
          'topics.category_id as category_id',
          'categories.title as categoryTitle',
        )
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
          if (search !== undefined) {
            queryBuilder.where(function () {
              this.where('deals.description', 'like', `%${search}%`)
                .orWhere('deals.description_long', 'like', `%${search}%`)
                .orWhere('deals.title', 'like', `%${search}%`)
                .orWhere('apps.description', 'like', `%${search}%`);
            });
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
    const app = await knex('deals')
      .select(
        'deals.*',
        'apps.title as appTitle',
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
      .join('apps', 'deals.app_id', '=', 'apps.id')
      .join('topics', 'apps.topic_id', '=', 'topics.id')
      .join('categories', 'topics.category_id', '=', 'categories.id')
      .where({ 'deals.id': id });
    if (app.length === 0) {
      throw new HttpError(`incorrect entry with the id of ${id}`, 404);
    }
    return app;
  } catch (error) {
    return error.message;
  }
};

// post
const createApps = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('deals').insert({
      title: body.title,
      description: body.description,
      topic_id: body.topic_id,
      user_id: user.id,
    });
    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

const createDealNode = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }

    // Optional: check for existing deal
    // const existing = await knex('deals')
    //   .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
    //   .first();

    const existing = await knex('deals')
      .whereRaw('LOWER(title) = ?', [body.title.toLowerCase()])
      .orWhere('app_id', body.app_id)
      .first();

    if (existing) {
      return {
        successful: true,
        existing: true,
        dealId: existing.id,
        dealTitle: body.title,
      };
    }

    let appTitle;
    if (body.apple_id) {
      const existingApp = await knex('apps')
        .whereRaw('LOWER(apple_id) = ?', [String(body.apple_id).toLowerCase()])
        .first();
      appTitle = existingApp.title;
    } else {
      const normalizedUrl = normalizeUrl(body.url);
      const existingApp = await knex('apps')
        .where({ url: normalizedUrl })
        .first();
      appTitle = existingApp.title;
    }

    // if (existingApp) {
    //   appId = existingApp.id;
    // } else {
    //   const [newApp] = await knex('apps').insert({
    //     title: body.topicTitle,
    //   });
    //   topicId = newTopic;
    // }

    let description;
    if (body.description) {
      description = body.description;
    } else {
      // Generate a short description using OpenAI
      const prompt = `Write a short, engaging description for deal "${body.title}" for app "${appTitle}".`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
      });

      description = completion.choices[0].message.content.trim();
    }

    const [dealId] = await knex('deals').insert({
      title: body.title,
      app_id: body.app_id,
      user_id: user.id,
      description,
    });

    return {
      successful: true,
      dealId,
      dealTitle: body.title,
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
  getAppsByCategoriesSearch,
  getAppsByTopics,
  getAppsByTopic,
  getAppsBy,
  getAppsByTopicsSearch,
  getAppsByCategory,
  getAppById,
  getAppsAll,
  createApps,
  getAppsBySearchTerm,
  getDealsByApp,
  createDealNode,
  getDealsTrending,
};
