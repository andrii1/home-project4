/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const HttpError = require('../lib/utils/http-error');
const fetch = require('node-fetch');

// const getExampleResources = async () => {
//   try {
//     const url = 'https://itunes.apple.com/lookup?id=297606951';
//     const response = await fetch(url);
//     const jsonResponse = await response.json();
//     console.log(jsonResponse);
//     return jsonResponse;
//   } catch (error) {
//     return error.message;
//   }
// };

const getappAppStoreById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }
  try {
    const url = `https://itunes.apple.com/lookup?id=${id}`;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getappAppStoreById,
};
