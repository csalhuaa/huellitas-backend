exports.up = function(knex) {
  return knex.schema.createTable('pet_images', (table) => {
    table.uuid('image_id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('s3_url', 512).notNullable();
    table.string('vector_id', 255).notNullable().unique();
    
    // FKs opcionales (una imagen solo puede pertenecer a uno)
    table.uuid('report_id').references('report_id').inTable('lost_pet_reports').onDelete('CASCADE');
    table.uuid('sighting_id').references('sighting_id').inTable('sighting_reports').onDelete('CASCADE');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // CHECK constraint: solo uno debe estar presente
    table.check('(report_id IS NOT NULL)::int + (sighting_id IS NOT NULL)::int = 1', [], 'chk_one_parent');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('pet_images');
};
