import transactionService from './transactions.service.js';

export default ({ salesforceConnection, db }) => {
  const { createTransaction } = transactionService({ salesforceConnection, db })

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