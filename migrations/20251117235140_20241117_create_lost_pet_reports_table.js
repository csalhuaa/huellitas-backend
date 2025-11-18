exports.up = function(knex) {
  return knex.schema.createTable('lost_pet_reports', (table) => {
    table.uuid('report_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('owner_user_id', 255).notNullable()
      .references('user_id').inTable('users').onDelete('CASCADE');
    
    // Perfil de la mascota
    table.string('pet_name', 100);
    table.string('species', 50);
    table.string('breed', 100);
    table.text('description');
    
    // Lógica de negocio
    table.string('status', 50).notNullable().defaultTo('Activa');
    table.timestamp('lost_date').notNullable();
    table.specificType('location', 'geography(Point, 4326)');
    table.text('last_seen_location_text');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índice espacial
    table.index('location', 'idx_lost_reports_location', 'GIST');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('lost_pet_reports');
};
