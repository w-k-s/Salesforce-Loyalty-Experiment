export default ({ loyalty }) => {

  const create = async (req, res) => {
    try {
      const result = await loyalty.createTransaction({ transaction: req.body });
      res.status(201).json({ Id: result });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  }

  return {
    create
  };
};