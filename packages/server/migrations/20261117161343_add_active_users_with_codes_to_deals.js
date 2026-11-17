exports.up = function (knex) {
  return knex.schema.table('deals', (table) => {
    table.integer('active_users_with_codes').defaultTo(0);
    table.dateTime('active_users_with_codes_updated_at').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.table('deals', (table) => {
    table.dropColumn('active_users_with_codes');
    table.dropColumn('active_users_with_codes_updated_at');
  });
};
