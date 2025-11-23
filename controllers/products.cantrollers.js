import Product from "../models/product.model.js";

const getAppProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default page 1
        const limit = parseInt(req.query.limit) || 20; // default 50 products per page
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


const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.query
        console.log(id)
        const findProduct = await Product.findById(id)
        if (!findProduct) return res.status(400).json({ success: false, message: "this product not found" })



        res.status(200).json({ success: true, message: "featch product dietaild successfull", findProduct })

    } catch (error) {
        console.log("error in getSingleProduct")
        res.status(500).json({ success: false, message: error.message })
    }
}

export { getAppProduct, getSingleProduct };