export default (productService) => {
    const { listProducts } = productService

    const getAll = async (req, res) => {
        try {
            const result = await listProducts();
            res.status(200).json({ products: result });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }

    return {
        getAll
    };
};