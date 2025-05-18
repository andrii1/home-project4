const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getAllLikes = async () => {
  try {
    const likes = await knex('likesForThreads');
    return likes;
  } catch (error) {
    return error.message;
  }
};
// get by user-id
const getLikesByUserId = async (token) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const likes = await knex('threads')
      .select('threads.*', 'likesForThreads.id as likesID')
      .leftJoin('likesForThreads', function () {
        this.on('threads.id', '=', 'likesForThreads.thread_id');
      })
      .where('likesForThreads.user_id', '=', `${user.id}`);

    if (likes.length === 0) {
      throw new HttpError(`There are no likes available with this user`, 404);
    }

    return likes;
  } catch (error) {
    return error.message;
  }
};

// get by user-id and prompt-id
const getLikesByThreadId = async (token, threadId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const likes = await knex('threads')
      .select('threads.*', 'likesForThreads.id as likesID')
      .leftJoin('likesForThreads', function () {
        this.on('threads.id', '=', 'likesForThreads.thread_id');
      })
      .where('likesForThreads.user_id', '=', `${user.id}`)
      .where('likesForThreads.thread_id', '=', `${threadId}`);

    if (likes.length === 0) {
      throw new HttpError(
        `There are no likes available with this user for this deal`,
        404,
      );
    }

    return likes;
  } catch (error) {
    return error.message;
  }
};

// post
const createLikes = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('likesForThreads').insert({
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

const deleteLikes = async (token, likesId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];
  if (!user) {
    throw new HttpError('User not found', 401);
  }
  try {
    const deletedFav = await knex('likesForThreads')
      .where({ thread_id: likesId, user_id: user.id })
      .del();
    if (deletedFav === 0) {
      throw new HttpError('The likes ID you provided does not exist.', 400);
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
  getLikesByUserId,
  getLikesByThreadId,
  createLikes,
  deleteLikes,
  getAllLikes,
};
