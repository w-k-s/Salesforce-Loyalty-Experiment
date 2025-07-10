/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('raffle_tickets', (table) => {
        table.string('transaction_id').notNullable();
        table.string('raffle_name').notNullable();
        table.decimal('transaction_amount', 10, 2).notNullable();
        table.integer('tickets').notNullable();
        table.string('customer_id').notNullable();
        table.timestamp('created_date', { useTz: true }).notNullable;
        table.timestamp('modified_date', { useTz: true }).notNullable;
        table.foreign('transaction_id', 'fk_raffle_tickets_transaction_id')
            .references('transactions.id')
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('raffle_tickets');
};
