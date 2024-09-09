/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('codes', (table) => {
    table.increments();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.text('url').nullable();
    table.string('url_image').nullable();
    table.integer('deal_id').unsigned();
    table.foreign('deal_id').references('id').inTable('deals');
    table.integer('user_id').unsigned();
    table.foreign('user_id').references('id').inTable('users');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('codes');
};
