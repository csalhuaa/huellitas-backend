exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.string('user_id', 255).primary().comment('ID de Firebase Auth');
    table.string('email', 255).notNullable().unique();
    table.string('full_name', 255);
    table.string('phone_number', 50).unique();
    table.text('push_notification_token');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
