require('babel-register')({
  presets: ['es2015', 'react'],
});

const fetch = require('node-fetch');
const router = require('./sitemap-routes').default;
const Sitemap = require('react-router-sitemap').default;

async function generateSitemap() {
  try {
    /* Deals */
    const response = await fetch(`http://localhost:5001/api/deals/`);
    const promptsResult = await response.json();
    const prompts = promptsResult.sort((a, b) => a.id - b.id);
    const idMap = [];

    /* Apps */
    const responseApps = await fetch(`http://localhost:5001/api/apps/`);
    const appsResult = await responseApps.json();
    const apps = appsResult.sort((a, b) => a.id - b.id);
    const idMapApps = [];

    /* Codes */
    const responseCodes = await fetch(`http://localhost:5001/api/codes/`);
    const codesResult = await responseCodes.json();
    const codes = codesResult.sort((a, b) => a.id - b.id);
    const idMapCodes = [];

    /* Topics */
    const responseTopics = await fetch(`http://localhost:5001/api/topics`);
    const topicsResult = await responseTopics.json();
    const topics = topicsResult.sort((a, b) => a.id - b.id);
    const idMapTopics = [];

    /* Categories */
    const responseCategories = await fetch(
      `http://localhost:5001/api/categories`,
    );
    const categoriesResult = await responseCategories.json();
    const categories = categoriesResult.sort((a, b) => a.id - b.id);
    const idMapCategories = [];

    /* Searches */
    const responseSearches = await fetch(`http://localhost:5001/api/searches`);
    const searchesResult = await responseSearches.json();
    const searches = searchesResult.sort((a, b) => a.id - b.id);
    const idMapSearches = [];

    prompts.forEach((prompt) => {
      idMap.push({ id: prompt.id });
    });

    apps.forEach((app) => {
      idMapApps.push({ appIdParam: app.id });
    });

    codes.forEach((code) => {
      idMapCodes.push({ codeIdParam: code.id });
    });

    topics.forEach((topic) => {
      idMapTopics.push({ topicIdParam: topic.id });
    });

    categories.forEach((category) => {
      idMapCategories.push({ categoryIdParam: category.id });
    });

    searches.forEach((search) => {
      idMapSearches.push({ searchIdParam: search.id });
    });

    const paramsConfig = {
      '/deals/:id': idMap,
      '/apps/:appIdParam': idMapApps,
      '/codes/:codeIdParam': idMapCodes,
      '/deals/topic/:topicIdParam': idMapTopics,
      '/deals/category/:categoryIdParam': idMapCategories,
      '/deals/search/:searchIdParam': idMapSearches,
    };

    return new Sitemap(router)
      .applyParams(paramsConfig)
      .build('https://www.topappdeals.com')
      .save('./public/sitemap.xml');
  } catch (e) {
    console.log(e);
  }
}

generateSitemap();
