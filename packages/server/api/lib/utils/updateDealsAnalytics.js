require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data').v1beta;
const knex = require('../../../config/db');

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

const updateDealsAnalytics = async () => {
  try {
    console.log('Starting deals analytics update...');

    // ---- 1. Get Google Analytics data ----
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: dayFormat,
          endDate: 'today',
        },
      ],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 250000,
    });

    const dealsAnalytics = new Map();
    const codesAnalytics = new Map();

    (response.rows || []).forEach((item) => {
      const path = item.dimensionValues[0].value;
      const activeUsers = Number(item.metricValues[0].value);

      const dealMatch = path.match(/^\/deals\/(\d+)\/?$/);
      const codeMatch = path.match(/^\/codes\/(\d+)\/?$/);

      if (dealMatch) {
        dealsAnalytics.set(dealMatch[1], activeUsers);
      }

      if (codeMatch) {
        codesAnalytics.set(codeMatch[1], activeUsers);
      }
    });

    console.log(
      `GA4: ${dealsAnalytics.size} deals, ${codesAnalytics.size} codes`,
    );

    // ---- 2. Get all deals ----
    const allDeals = await knex('deals').select('id');

    // ---- 3. Get all codes and their related deals ----
    const allCodes = await knex('codes').select('id', 'deal_id');

    const codeToDeal = new Map(
      allCodes.map((code) => [code.id.toString(), code.deal_id.toString()]),
    );

    // ---- 4. Calculate code traffic per deal ----
    const codeTrafficByDeal = new Map();

    codesAnalytics.forEach((activeUsers, codeId) => {
      const dealId = codeToDeal.get(codeId);

      if (dealId) {
        codeTrafficByDeal.set(
          dealId,
          (codeTrafficByDeal.get(dealId) || 0) + activeUsers,
        );
      }
    });

    // ---- 5. Calculate analytics for ALL deals ----
    const updates = allDeals.map((deal) => {
      const dealId = deal.id.toString();

      const dealActive = dealsAnalytics.get(dealId) || 0;
      const codeActive = codeTrafficByDeal.get(dealId) || 0;

      return {
        id: deal.id,
        active_users_with_codes: dealActive + codeActive,
      };
    });

    const top10Deals = [...updates]
      .sort((a, b) => b.active_users_with_codes - a.active_users_with_codes)
      .slice(0, 10);

    console.log('Top 10 trending deals:');
    console.table(top10Deals);

    console.log(`Calculated analytics for ${updates.length} deals`);

    // ---- 6. Bulk update using temporary table ----
    await knex.transaction(async (trx) => {
      // Create temporary table with matching column types
      await trx.raw(`
        CREATE TEMPORARY TABLE temp_deal_analytics AS
        SELECT id, active_users_with_codes
        FROM deals
        WHERE 1 = 0
      `);

      await trx.raw(`
        ALTER TABLE temp_deal_analytics
        ADD PRIMARY KEY (id)
      `);

      // Insert in batches of 500
      const batchSize = 500;

      for (let i = 0; i < updates.length; i += batchSize) {
        await trx('temp_deal_analytics').insert(
          updates.slice(i, i + batchSize),
        );
      }

      // Update all deals with matching analytics
      await trx.raw(`
        UPDATE deals d
        JOIN temp_deal_analytics t ON d.id = t.id
        SET
          d.active_users_with_codes = t.active_users_with_codes,
          d.active_users_with_codes_updated_at = NOW()
      `);
    });

    console.log('Deals analytics update completed successfully!');

    return {
      success: true,
      updated: updates.length,
    };
  } catch (error) {
    console.error('Deals analytics update failed:', error);
    throw error;
  }
};

// module.exports = updateDealsAnalytics;
updateDealsAnalytics();
