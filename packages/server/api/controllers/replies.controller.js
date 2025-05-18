/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getReplies = async () => {
  try {
    const replies = await knex('replies');

    return replies;
  } catch (error) {
    return error.message;
  }
};

// Get replies by Question
const getRepliesByQuestion = async (question) => {
  try {
    const replies = await knex('replies').where({ question_id: question });
    return replies;
  } catch (error) {
    return error.message;
  }
};

// post
const createReplies = async (token, body, question) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('replies').insert({
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
  getReplies,
  getRepliesByQuestion,
  createReplies,
};
