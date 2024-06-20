import { Request, Response, NextFunction } from 'express';
const validateProductFields = (req: Request, res: Response, next: NextFunction) => {
    const { name, price, description, category, quantity } = req.body;
    if (!name || !price || !description || !category || !quantity) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    next();
}

export { validateProductFields }