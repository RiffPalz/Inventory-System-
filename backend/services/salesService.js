import Sales from "../models/sales.js";
import Product from "../models/product.js";

const createSale = async (data) => {
    const product = await Product.findByPk(data.productId);
    if (!product) {
        throw new Error(`Product with ID ${data.productId} does not exist.`);
    }

    const quantitySold = Number(data.quantity);
    if (product.inStock < quantitySold) {
        throw new Error(`Insufficient stock. Available: ${product.inStock}`);
    }

    const sale = await Sales.create({
        invoiceNumber: data.invoiceNumber,
        productId: data.productId,
        productName: product.name,
        quantity: quantitySold,
        price: data.price,
        totalAmount: quantitySold * Number(data.price),
        transactionDate: data.transactionDate || new Date(),
    });

    product.inStock -= quantitySold;
    await product.save();

    return sale;
};

const getAllSales = async () => {
    return await Sales.findAll({
        order: [["transactionDate", "DESC"]],
    });
};

const getSaleById = async (id) => {
    return await Sales.findByPk(id);
};

export default {
    createSale,
    getAllSales,
    getSaleById,
};