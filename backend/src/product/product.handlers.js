export default (productService) => {
    const { listProducts } = productService

    const getAll = async (req, res, next) => {
        try {
            const result = await listProducts();
            res.status(200).json({ products: result });
        } catch (e) {
            next(e)
        }
    }

    return {
        getAll
    };
};