export default (memberService) => {
  const { registerMember } = memberService

  const create = async (req, res) => {
    try {
      const result = await registerMember({ request: req.body });
      res.status(201).json({ id: result, ...req.body });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return {
    create
  };
};