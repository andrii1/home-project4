/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('threads', (table) => {
    table.integer('views').notNullable().defaultTo(0).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('threads', (table) => {
    table.integer('views').nullable().defaultTo(null).alter();
  });
};
