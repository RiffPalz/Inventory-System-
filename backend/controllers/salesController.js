import salesService from "../services/salesService.js";

const createSale = async (req, res) => {
    try {
        const sale = await salesService.createSale(req.body);
        res.status(201).json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllSales = async (req, res) => {
    try {
        const sales = await salesService.getAllSales();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSaleById = async (req, res) => {
    try {
        const sale = await salesService.getSaleById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }
        res.json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    createSale,
    getAllSales,
    getSaleById,
};