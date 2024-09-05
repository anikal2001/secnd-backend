export class UserDto {
  user_id: number;
  firstName: string;
  lastName: string;
  email: string;
  cart: string[];
  country?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  resetToken?: string;
  expiryToken?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  orders: { id: string }[]; // Assuming the DTO only needs the order IDs
  transactions: { id: string }[]; // Assuming the DTO only needs the transaction IDs
  interactions: { id: string }[]; // Assuming the DTO only needs the interaction IDs
    isSeller: boolean;
    password: string;
}
