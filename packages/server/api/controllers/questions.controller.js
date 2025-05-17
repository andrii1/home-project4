/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getQuestions = async () => {
  try {
    const questions = await knex('questions');

    return questions;
  } catch (error) {
    return error.message;
  }
};

const getQuestionById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }

  try {
    const questions = await knex('questions').where({ id });
    if (questions.length === 0) {
      throw new Error(`incorrect entry with the id of ${id}`, 404);
    }
    return questions;
  } catch (error) {
    return error.message;
  }
};

// post
const createQuestions = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('questions').insert({
      title: body.title,
      content: body.content,
      user_id: user.id,
    });
    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestions,
};
