export default (memberService) => {
  const { registerMember, findMemberById } = memberService

  const create = async (req, res) => {
    try {
      const result = await registerMember({ request: req.body });
      res.status(201).json({ id: result, ...req.body });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  const getById = async (req, res) => {
    try {
      const contactId = req.params.id
      const result = await findMemberById(contactId)
      res.status(200).json(result)
    } catch (e) {
      console.log(e)
      res.status(404).json({ error: 'Not Found (handle this error properly)' })
    }
  }

  return {
    create,
    getById
  };
};