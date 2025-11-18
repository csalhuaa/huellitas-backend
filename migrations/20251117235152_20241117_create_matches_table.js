exports.up = function(knex) {
  return knex.schema.createTable('matches', (table) => {
    table.uuid('match_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('report_id').notNullable()
      .references('report_id').inTable('lost_pet_reports').onDelete('CASCADE');
    table.uuid('sighting_id').notNullable()
      .references('sighting_id').inTable('sighting_reports').onDelete('CASCADE');
    
    table.float('ai_distance_score').notNullable();
    table.string('status', 50).notNullable().defaultTo('Pending');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Índices
    table.unique(['report_id', 'sighting_id']);
    table.index(['report_id', 'status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('matches');
};
