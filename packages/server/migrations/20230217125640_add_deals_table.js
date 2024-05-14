/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('deals', (table) => {
    table.increments();
    table.text('title').notNullable();
    table.text('description').nullable();
    table.text('description_long').nullable();
    table.integer('app_id').unsigned();
    table.foreign('app_id').references('id').inTable('apps');
    table.text('url').nullable();
    table.text('url_image').nullable();
    table.text('contact').nullable();
    table.text('title_meta').nullable();
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
  return knex.schema.dropTable('deals');
};
