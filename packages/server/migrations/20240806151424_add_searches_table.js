/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('searches', (table) => {
    table.increments();
    table.integer('deal_id').unsigned();
    table.foreign('deal_id').references('id').inTable('deals');
    table.integer('search_term_id').unsigned();
    table.foreign('search_term_id').references('id').inTable('searchTerms');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('searches');
};
