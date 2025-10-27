/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-return-await */
/* eslint-disable prefer-template */
// const fetch = require("node-fetch");

require('dotenv').config();

const fetchSerpApi = require('./serpApi');
const searchApps = require('./searchApps');
const insertDeals = require('./insertDeals');

const today = new Date();
const todayDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

const allowedDays = [0, 3, 5]; // Sunday, Wednesday, Friday

if (!allowedDays.includes(todayDay)) {
  console.log('Not an allowed day, skipping job.');
  process.exit(0);
}

// Credentials (from .env)
const USER_UID = process.env.USER_UID_DEALS_PROD;
const API_PATH = process.env.API_PATH_DEALS_PROD;
// WordPress Credentials (from .env)

// fetch helpers

async function insertQuery(queryObj) {
  const res = await fetch(`${API_PATH}/queriesMrhack`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryObj),
  });
  return await res.json(); // assume it returns { id, title }
}

const createPostMain = async () => {
  const queries = await fetchSerpApi('7', true);
  console.log('queries', queries);
  const dedupedQueries = [];
  for (const query of queries) {
    const newQuery = await insertQuery(query);

    if (newQuery.existing) {
      console.log('Duplicate query skipped:', query.title);
      continue;
    }

    if (query.source.includes('app')) {
      dedupedQueries.push(query.title);
    }
  }

  const apps = await searchApps(dedupedQueries);
  await insertDeals(apps);
};

createPostMain().catch(console.error);
