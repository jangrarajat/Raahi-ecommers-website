import Product from "../models/product.model.js";

const getAppProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default page 1
        const limit = parseInt(req.query.limit) || 10; // default 50 products per page
        const skip = (page - 1) * limit;

        const category = req.query.category || "all";

        let filter = {};
        if (category !== "all") {
            filter.category = category;
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // latest first

        const totalPages = Math.ceil(totalProducts / limit);
        const hasNextPage = page < totalPages;

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            page,
            totalPages,
            totalProducts,
            hasNextPage,
            products,
            category
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export { getAppProduct };