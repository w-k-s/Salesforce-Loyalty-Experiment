/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('raffle_tickets', (table) => {
        table.uuid('id').primary();
        table.string('raffle_name').notNullable();
        table.string('transaction_id').notNullable();
        table.decimal('transaction_amount', 10, 2).notNullable();
        table.integer('tickets').notNullable();
        table.string('customer_id').notNullable();
        table.timestamp('created_date', { useTz: true }).notNullable;
        table.timestamp('modified_date', { useTz: true }).notNullable;
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('raffle_tickets');
};
