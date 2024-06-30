import { createTransaction } from './transactions.service.js';

export default ({ salesforceConnection }) => {
  return {
    create: async (req, res) => {
      try {
        const result = await createTransaction({ salesforceConnection });
        res.status(201).json({ Id: result });
      } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };
};