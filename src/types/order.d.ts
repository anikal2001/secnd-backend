
export type OrderType = {
    id: string;
    customer: User;
    orderItems: OrderItem[];
    totalAmount: number;
    products: Product[];
    total: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

export type OrderItemType = {
    id: number;
    order: Order;
    product: Product;
};