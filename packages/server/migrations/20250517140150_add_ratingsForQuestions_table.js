/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('ratingsForQuestions', (table) => {
    table.increments();
    table.integer('user_id').unsigned();
    table.foreign('user_id').references('id').inTable('users');
    table.integer('question_id').unsigned();
    table.foreign('question_id').references('id').inTable('questions');
    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('ratingsForQuestions');
};
