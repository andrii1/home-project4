const knex = require('../../config/db');
const HttpError = require('../lib/utils/http-error');

const getAllPositiveLikes = async () => {
  try {
    const ratings = await knex('positiveLikes');

    return ratings;
  } catch (error) {
    return error.message;
  }
};
// get by user-id
const getPositiveLikesByUserId = async (token) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('codes')
      .select('codes.*', 'codes.id as positiveLikesID')
      .leftJoin('positiveLikes', function () {
        this.on('codes.id', '=', 'positiveLikes.code_id');
      })
      .where('positiveLikes.user_id', '=', `${user.id}`);

    if (ratings.length === 0) {
      throw new HttpError(
        `There are no positiveLikes available with this user`,
        404,
      );
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// get by user-id and prompt-id
const getPositiveLikesByCodeId = async (token, codeId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];

  if (!token) {
    throw new HttpError('There are not users', 401);
  }

  try {
    const ratings = await knex('codes')
      .select('codes.*', 'positiveLikes.id as positiveLikesID')
      .leftJoin('positiveLikes', function () {
        this.on('codes.id', '=', 'positiveLikes.code_id');
      })
      .where('positiveLikes.user_id', '=', `${user.id}`)
      .where('positiveLikes.code_id', '=', `${codeId}`);

    if (ratings.length === 0) {
      throw new HttpError(
        `There are no positiveLikes available with this user for this code`,
        404,
      );
    }

    return ratings;
  } catch (error) {
    return error.message;
  }
};

// post
const createPositiveLikes = async (token, body) => {
  try {
    const userUid = token.split(' ')[1];
    const user = (await knex('users').where({ uid: userUid }))[0];
    if (!user) {
      throw new HttpError('User not found', 401);
    }
    await knex('positiveLikes').insert({
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

const deletePositiveLikes = async (token, positiveLikesId) => {
  const userUid = token.split(' ')[1];
  const user = (await knex('users').where({ uid: userUid }))[0];
  if (!user) {
    throw new HttpError('User not found', 401);
  }
  try {
    const deletedFav = await knex('positiveLikes')
      .where({ code_id: positiveLikesId, user_id: user.id })
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
  getPositiveLikesByUserId,
  getPositiveLikesByCodeId,
  createPositiveLikes,
  deletePositiveLikes,
  getAllPositiveLikes,
};
