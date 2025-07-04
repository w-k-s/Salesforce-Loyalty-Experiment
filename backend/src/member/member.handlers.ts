import loyalty from "../loyalty/index.js";

export default ({ memberService }) => {
  const { registerMember } = memberService

  const create = async (req, res, next) => {
    try {
      const result = await registerMember({ request: req.body });
      res.status(201).json({ id: result, ...req.body });
    } catch (e) {
      next(e)
    }
  }

  const getById = async (req, res, next) => {
    try {
      const contactId = req.user.id
      const result = await loyalty.findMemberById(contactId)
      res.status(200).json(result)
    } catch (e) {
      next(e)
    }
  }

  return {
    create,
    getById
  };
};