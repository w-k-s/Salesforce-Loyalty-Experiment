
import knex from 'knex'
import { default as config } from '../config/index.js'

const { db } = config

export default knex({ ...db.connection });