/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('ratings', (table) => {
    table.increments();
    table.integer('deal_id').unsigned();
    table.foreign('deal_id').references('id').inTable('deals');
    table.integer('user_id').unsigned();
    table.foreign('user_id').references('id').inTable('users');
    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('ratings');
};
