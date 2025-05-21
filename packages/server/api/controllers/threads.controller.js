/* TODO: This is an example controller to illustrate a server side controller.
Can be deleted as soon as the first real controller is added. */

const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getThreads = async () => {
  try {
    const threads = await knex('threads')
      .select('threads.*', 'users.id as userId', 'users.full_name as full_name')
      .join('users', 'threads.user_id', '=', 'users.id')
      .orderBy('threads.created_at', 'desc');

    return threads;
  } catch (error) {
    return error.message;
  }
};

const getThreadById = async (id) => {
  if (!id) {
    throw new HttpError('Id should be a number', 400);
  }

  try {
    const threads = await knex('threads')
      .join('users', 'threads.user_id', '=', 'users.id')
      .where('threads.id', id);
    if (threads.length === 0) {
      throw new Error(`incorrect entry with the id of ${id}`, 404);
    }
    return threads;
  } catch (error) {
    return error.message;
  }
};

// post
const createThreads = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('threads').insert({
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

// edit
const editThread = async (updatedThreadId) => {
  try {
    if (!updatedThreadId) {
      throw new HttpError('updatedThreadId should be a number', 400);
    }

    await knex('threads').where({ id: updatedThreadId }).increment('views', 1);

    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getThreads,
  getThreadById,
  createThreads,
  editThread,
};
