/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const OpenAI = require('openai');
require('dotenv').config();
const snoowrap = require('snoowrap');
const { jsonrepair } = require('jsonrepair');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // make sure this is set in your .env
});

const reddit = new snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

function cleanOpenAIJsonReply(reply) {
  // Remove ```json or ``` at start and ``` at end, if present
  const cleaned = reply
    .replace(/^```json\s*/, '') // remove ```json at start
    .replace(/^```\s*/, '') // remove ``` at start (fallback)
    .replace(/```$/, '') // remove ``` at end
    .trim();

  return cleaned;
}

const listOfSubreddits = [
  'referralcodes',
  'ReferalLinks',
  'Referral',
  'Referrals',
];

async function fetchRedditWithApi() {
  const allPosts = [];

  for (const subredditName of listOfSubreddits) {
    try {
      const subreddit = await reddit.getSubreddit(subredditName);
      const posts = await subreddit.getTop({ time: 'week', limit: 10 });

      const postsMap = posts.map((post) => ({
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        author: post.author.name,
        selftext: post.selftext,
        upvotes: post.ups,
        created_utc: post.created_utc,
        subreddit: subredditName,
      }));

      allPosts.push(...postsMap);
    } catch (err) {
      console.error(`Failed to fetch from r/${subredditName}:`, err.message);
    }
  }

  return allPosts;
}

// async function fetchReddit() {
//   const url = 'https://www.reddit.com/r/referralcodes/top.json?t=month&limit=5';
//   const headers = {
//     'User-Agent': 'node:weeklyReferralScraper:v1.0 (by /u/yourusername)',
//   };
//   const response = await fetch(url, { headers });

//   if (!response.ok) {
//     console.error('Failed to fetch posts:', response.statusText);
//     process.exit(1);
//   }
//   const data = await response.json();

//   const posts = data.data.children.map((post) => ({
//     title: post.data.title,
//     url: `https://reddit.com${post.data.permalink}`,
//     author: post.data.author,
//     selftext: post.data.selftext,
//     upvotes: post.data.ups,
//     created_utc: post.data.created_utc,
//   }));
//   console.log(posts);
//   // await writeFile('reddit/referral_posts.json', JSON.stringify(posts, null, 2));

//   return posts;
// }

async function formatReddit() {
  // Generate a short description using OpenAI

  const posts = await fetchRedditWithApi();
  const prompt = `${JSON.stringify(
    posts,
  )} Here are top Reddit posts about referral codes. You need to change to different format. 'code' field is a referral code from the user.
Also find appUrl - which is an official website of the app. For dealDescription field generate related description based on deal and reddit text. If there is also a referral link, use it in codeUrl field, if not - then don't add it. For codeUrl, I don't need reddit link to the post. For codeUrl, I also don't need link to main website. Only include codeUrl, if it is specifically referral link. For codeUrl, I also don't need link to main website. Only include codeUrl, if it is specifically referral link. For appUrl, don't include link to reddit. Use this format: [
  {
    code: "3SKU73",
    codeUrl: 'https://example.com/invite/YthS4h',
    appUrl: 'https://example.com'
    dealDescription: '....'
  },
]; NOW THIS IS IMPORTANT: code is required field, if you can't find code in message - skip it. Also, appUrl is required. If you can't find appUrl, just skip. Just return array of objects in json. Do not include any notes, comments, markdown, or additional explanation — only return a clean JSON array of objects, not wrapped inside any other array. `;
  // console.log(prompt);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 600,
  });

  const rawReply = completion.choices[0].message.content.trim();
  const cleanedReply = cleanOpenAIJsonReply(rawReply);

  try {
    const repairedJson = jsonrepair(cleanedReply);
    const parsed = JSON.parse(repairedJson);
    // Normalize: if first element is an array and rest is noise, unwrap it
    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      return parsed[0];
    }

    // If it's an array of objects, as expected
    if (Array.isArray(parsed)) {
      return parsed;
    }

    console.warn('Unexpected format from OpenAI:', parsed);
    return [];
  } catch (error) {
    console.error('Failed to parse OpenAI reply:', error);
    console.log('Raw reply was:', rawReply);
    return [];
  }
}

module.exports = formatReddit;
