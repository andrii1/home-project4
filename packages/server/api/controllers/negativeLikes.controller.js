const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getAllNegativeLikes = async () => {
  try {
    const ratings = await knex('negativeLikes');

    return ratings;
  } catch (error) {
    return error.message;
  }
};
// get by user-id
const getNegativeLikesByUserId = async (token) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('codes')
      .select('codes.*', 'codes.id as negativeLikesID')
      .leftJoin('negativeLikes', function () {
        this.on('codes.id', '=', 'negativeLikes.code_id');
      })
      .where('negativeLikes.user_id', '=', `${user.id}`);

    if (ratings.length === 0) {
      throw new HttpError(
        `There are no negativeLikes available with this user`,
        404,
      );
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// get by user-id and prompt-id
const getNegativeLikesByCodeId = async (token, codeId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('codes')
      .select('codes.*', 'negativeLikes.id as negativeLikesID')
      .leftJoin('negativeLikes', function () {
        this.on('codes.id', '=', 'negativeLikes.code_id');
      })
      .where('negativeLikes.user_id', '=', `${user.id}`)
      .where('negativeLikes.code_id', '=', `${codeId}`);

    if (ratings.length === 0) {
      throw new HttpError(
        `There are no negativeLikes available with this user for this code`,
        404,
      );
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// post
const createNegativeLikes = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('negativeLikes').insert({
      user_id: user.id,
      code_id: body.code_id,
    });
    return {
      successful: true,
    };
  } catch (error) {
    return error.message;
  }
};

// delete

const deleteNegativeLikes = async (token, negativeLikesId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];
  if (!user) {
    throw new HttpError('User not found', 401);
  }
  try {
    const deletedFav = await knex('negativeLikes')
      .where({ code_id: negativeLikesId, user_id: user.id })
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
  getNegativeLikesByUserId,
  getNegativeLikesByCodeId,
  createNegativeLikes,
  deleteNegativeLikes,
  getAllNegativeLikes,
};
