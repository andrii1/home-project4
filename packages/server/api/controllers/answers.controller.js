/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getAnswers = async () => {
  try {
    const answers = await knex('answers');

    return answers;
  } catch (error) {
    return error.message;
  }
};

// Get answers by Question
const getAnswersByQuestion = async (question) => {
  try {
    const answers = await knex('answers').where({ question_id: question });
    return answers;
  } catch (error) {
    return error.message;
  }
};

// post
const createAnswers = async (token, body, question) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('answers').insert({
      title: body.title,
      content: body.content,
      user_id: user.id,
      question_id: question,
    });
    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getAnswers,
  getAnswersByQuestion,
  createAnswers,
};
