export type UserType = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cart: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
  phone: string;
  resetToken: string;
  expiryToken: Date;
  avatar: string;
  wishlist: Product[];
  createdAt: Date;
  updatedAt: Date;
  orders: Order[];
  transactions: Transaction[];
};


export type UserPreferences = {
  is_onboarded: boolean;
  is_seller: boolean;
}