/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('searchesDeals', (table) => {
    table.renameColumn('search_term_id', 'search_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('searchesDeals', (table) => {
    table.renameColumn('search_id', 'search_term_id');
  });
};
