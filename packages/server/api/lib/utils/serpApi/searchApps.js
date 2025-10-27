/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require('dotenv').config();
const store = require('app-store-scraper');

async function searchApps(queries) {
  const allApps = [];

  for (const query of queries) {
    try {
      const res = await store.search({
        term: query,
        num: 2,
        country: 'us',
        type: 'ios',
      });
      allApps.push(...res);
    } catch (err) {
      console.error('Error searching:', query, err);
    }
  }

  console.log('✅ Total apps collected:', allApps);
  return allApps;
}

module.exports = searchApps;
