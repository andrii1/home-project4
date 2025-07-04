/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
// const fetch = require("node-fetch");
require('dotenv').config();
const fetch = require('node-fetch');
const OpenAI = require('openai');
const formatReddit = require('./scrapeRedditSearch');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

// Credentials (from .env)
const USER_UID = process.env.USER_UID_DEALS_PROD;
const API_PATH = process.env.API_PATH_DEALS_PROD;

const today = new Date();
const isSunday = today.getDay() === 0; // 0 = Sunday

if (!isSunday) {
  console.log('Not Sunday, skipping weekly job.');
  process.exit(0);
}

// const codes = [
//   {
//     code: "ieydypd",
//     appleId: "6502968192",
//     dealDescription: "Description of the deal",
//   },
// ];

// const codes = [
//   {
//     code: "0dfgdfg",
//     appUrl: "https://instawork.com",
//   },
// ];

// const codes = [
//   {
//     code: "087sfg",
//     appleId: "098213409",
//   },
// ];

// fetch helpers

async function fetchExistingTopics() {
  const res = await fetch(`${API_PATH}/topics`);
  const data = await res.json();
  const topics = data.map((topic) => topic.title);
  return topics;
}

async function createTopicWithChatGpt(category, app, appDescription) {
  const existingTopics = await fetchExistingTopics();
  console.log('existingTopics', existingTopics);

  // Generate a short description using OpenAI
  const prompt = `Select a topic for this app ${app} from list of existing topics: "${existingTopics}". Return only topic name, without any additional text, e.g. "Video". This is preferred. But, if none of the topics is suitable, than generate a subcategory (or a topic) for this app: ${app}, which is in this Apple App Store category: ${category}, which has this app description: ${appDescription}. It should be 1 or 2 or 3 words maximum. Ideally 1 or 2 words.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  });

  const topic = completion.choices[0].message.content.trim();
  return topic;
}

async function createWebsiteDataWithChatGpt(url) {
  // Generate a short description using OpenAI
  const prompt = `Select a category for this website: ${url}. You need to select one category from this list: "Books, Business, Catalogs, Education, Entertainment, Finance, Food and Drink, Games, Health and Fitness, Lifestyle, Medical, Music, Navigation, News, Photo and Video, Productivity, Reference, Shopping, Social Networking, Sports, Travel, Utilities, Weather". Return only category name, without any additional text, e.g. "Education."`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const promptTitle = `Get app title based on its website: ${url}. Return only app title, without any additional text, e.g. "Duolingo"`;

  const completionTitle = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: promptTitle }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const promptDescription = `Create app description based on its website: ${url}.`;

  const completionDescription = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: promptDescription }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const category = completion.choices[0].message.content.trim();
  const appTitle = completionTitle.choices[0].message.content.trim();
  const appDescription =
    completionDescription.choices[0].message.content.trim();
  return { category, appTitle, appDescription };
}

async function insertCategory(title) {
  const res = await fetch(`${API_PATH}/categories`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertTopic(title, categoryId) {
  const res = await fetch(`${API_PATH}/topics`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, category_id: categoryId }),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertApp({ appTitle, appleId, appUrl, topicId }) {
  const body = {
    title: appTitle,
    topic_id: topicId,
  };

  if (appleId) {
    body.apple_id = appleId;
  }

  if (appUrl) {
    body.url = appUrl;
  }

  const res = await fetch(`${API_PATH}/apps/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
}

async function insertDeal({ deal, dealDescription, appleId, appUrl, appId }) {
  const body = {
    title: deal,
    app_id: appId,
    url: appUrl,
  };

  if (appleId) {
    body.apple_id = appleId;
  }

  if (dealDescription) {
    body.description = dealDescription;
  }
  const res = await fetch(`${API_PATH}/deals/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

async function insertCode({ code, codeUrl, dealId }) {
  const body = {
    title: code,
    deal_id: dealId,
  };

  if (codeUrl) {
    body.url = codeUrl;
  }
  const res = await fetch(`${API_PATH}/codes/node`, {
    method: 'POST',
    headers: {
      token: `token ${USER_UID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data; // assume it returns { id, full_name }
}

const insertCodes = async () => {
  const codes = await formatReddit();
  console.log('codes', codes);

  for (const codeItem of codes) {
    const { code, codeUrl, appleId, appUrl, dealTitle, dealDescription } =
      codeItem;

    if (!code || !appUrl) {
      // Skip this iteration if code is falsy
      continue;
    }

    if (appUrl.includes('example.com')) {
      continue;
    }

    // if (appleId) {
    //   app = await fetchAppByAppleId(appleId);
    //   category = app.primaryGenreName;
    //   categoryAppleId = app.primaryGenreId;
    //   appTitle = app.trackName;
    //   appDescription = app.description;
    // } else {

    // }

    const { category, appTitle, appDescription } =
      await createWebsiteDataWithChatGpt(appUrl);

    const newCategory = await insertCategory(category);
    const { categoryId } = newCategory;
    console.log('Inserted category:', newCategory);

    const createdTopic = await createTopicWithChatGpt(
      category,
      appTitle,
      appDescription,
    );

    const newTopic = await insertTopic(createdTopic, categoryId);
    const { topicId } = newTopic;
    console.log('Inserted topic:', newTopic);

    const newApp = await insertApp({ appTitle, appUrl, topicId });
    const { appId } = newApp;
    const newAppTitle = newApp.appTitle;
    console.log('Inserted app:', newApp);

    let deal;
    if (dealTitle) {
      deal = dealTitle;
    } else {
      const match = newAppTitle.match(/^(.*?)(?:-|:)/);
      const appName = match ? match[1].trim() : newAppTitle;
      deal = `${appName} referral codes`;
    }

    const newDeal = await insertDeal({
      deal,
      dealDescription,
      appUrl,
      appId,
    });
    const { dealId } = newDeal;
    console.log('Inserted deal:', newDeal);

    if (code) {
      const newCode = await insertCode({ code, codeUrl, dealId });
      const { codeId } = newCode;
      console.log('Inserted code:', newCode);
    }
  }
};

insertCodes()
  .then(() => {
    console.log('Done inserting codes');
    process.exit(0); // force exit Node.js after all async work done
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
