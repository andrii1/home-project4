/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('keywords', (table) => {
    table.increments();
    table.string('title').notNullable();
    table.integer('deal_id').unsigned();
    table.foreign('deal_id').references('id').inTable('deals');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('keywords');
};
