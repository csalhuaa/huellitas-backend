exports.up = function(knex) {
  return knex.schema.createTable('sighting_reports', (table) => {
    table.uuid('sighting_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('reporter_user_id', 255).notNullable()
      .references('user_id').inTable('users').onDelete('CASCADE');
    
    table.text('description');
    table.string('status', 50).notNullable().defaultTo('En_Calle');
    table.timestamp('sighting_date').notNullable();
    table.specificType('location', 'geography(Point, 4326)');
    table.text('location_text');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('location', 'idx_sighting_reports_location', 'GIST');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sighting_reports');
};
