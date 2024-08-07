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

    prompts.forEach((prompt) => {
      idMap.push({ id: prompt.id });
    });

    topics.forEach((topic) => {
      idMapTopics.push({ topicIdParam: topic.id });
    });

    categories.forEach((category) => {
      idMapCategories.push({ categoryIdParam: category.id });
    });

    const paramsConfig = {
      '/deals/:id': idMap,
      '/deals/topic/:topicIdParam': idMapTopics,
      '/deals/category/:categoryIdParam': idMapCategories,
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
