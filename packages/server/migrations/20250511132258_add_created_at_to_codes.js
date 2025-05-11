/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('codes', (table) => {
    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('codes', (table) => {
    table.datetime('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
  });
};
