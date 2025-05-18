const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getAllRatings = async () => {
  try {
    const ratings = await knex('ratingsForThreads');
    return ratings;
  } catch (error) {
    return error.message;
  }
};
// get by user-id
const getRatingsByUserId = async (token) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('threads')
      .select('threads.*', 'ratingsForThreads.id as ratingsID')
      .leftJoin('ratingsForThreads', function () {
        this.on('threads.id', '=', 'ratingsForThreads.thread_id');
      })
      .where('ratingsForThreads.user_id', '=', `${user.id}`);

    if (ratings.length === 0) {
      throw new HttpError(`There are no ratings available with this user`, 404);
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// get by user-id and prompt-id
const getRatingsByThreadId = async (token, threadId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('threads')
      .select('threads.*', 'ratingsForThreads.id as ratingsID')
      .leftJoin('ratingsForThreads', function () {
        this.on('threads.id', '=', 'ratingsForThreads.thread_id');
      })
      .where('ratingsForThreads.user_id', '=', `${user.id}`)
      .where('ratingsForThreads.thread_id', '=', `${threadId}`);

    if (ratings.length === 0) {
      throw new HttpError(
        `There are no ratings available with this user for this deal`,
        404,
      );
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// post
const createRatings = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('ratingsForThreads').insert({
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

// delete

const deleteRatings = async (token, ratingsId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];
  if (!user) {
    throw new HttpError('User not found', 401);
  }
  try {
    const deletedFav = await knex('ratingsForThreads')
      .where({ thread_id: ratingsId, user_id: user.id })
      .del();
    if (deletedFav === 0) {
      throw new HttpError('The ratings ID you provided does not exist.', 400);
    } else {
      return {
        successful: true,
      };
    }
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  getRatingsByUserId,
  getRatingsByThreadId,
  createRatings,
  deleteRatings,
  getAllRatings,
};
