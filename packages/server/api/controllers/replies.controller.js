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

// Get replies by Thread
const getRepliesByThread = async (threadId) => {
  try {
    const replies = await knex('replies')
      .join('users', 'replies.user_id', '=', 'users.id')
      .where({ thread_id: threadId });
    return replies;
  } catch (error) {
    return error.message;
  }
};

// post
const createReplies = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('replies').insert({
      content: body.content,
      user_id: user.id,
      thread_id: body.thread_id,
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
  getRepliesByThread,
  createReplies,
};
