"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const transaction_entity_1 = require("../../core/entity/transaction.entity"); // Make sure your model uses TypeScript as well
exports.transactionController = {
    getAllTransactions: async (req, res) => {
        try {
            const transactions = await transaction_entity_1.Transaction.find();
            res.json(transactions);
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    getTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const transaction = await transaction_entity_1.Transaction.findOne({ where: { id: Number(id) } });
            if (transaction) {
                res.json(transaction);
            }
            else {
                res.status(404).json({ message: 'Transaction not found.' });
            }
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    createTransaction: async (req, res) => {
        const { user, amount, type, status, transactionDate } = req.body;
        const newTransaction = new transaction_entity_1.Transaction();
        newTransaction = { user, amount, type, status, transactionDate };
        try {
            const savedTransaction = await newTransaction.save();
            res.status(201).json(savedTransaction);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    },
    updateTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const transaction = await transaction_entity_1.Transaction.findByIdAndUpdate(id, req.body, { new: true });
            if (transaction) {
                res.json(transaction);
            }
            else {
                res.status(404).json({ message: 'Transaction not found.' });
            }
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
    deleteTransaction: async (req, res) => {
        try {
            const { id } = req.params;
            const transaction = await transaction_entity_1.Transaction.findByIdAndDelete(id);
            if (transaction) {
                res.json({ message: 'Transaction deleted successfully.' });
            }
            else {
                res.status(404).json({ message: 'Transaction not found.' });
            }
        }
        catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};
