/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('transactions', (table) => {
        table.string('id').primary();
        table.string('order_number').notNullable();
        table.string('description').notNullable();
        table.decimal('total_amount', 10, 2).notNullable();
        table.date('effective_date').notNullable();
        table.string('customer_id').notNullable();
        table.string('status').notNullable();
        table.timestamp('created_date', { useTz: true }).notNullable;
        table.timestamp('modified_date', { useTz: true }).notNullable;
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('transactions');
};
