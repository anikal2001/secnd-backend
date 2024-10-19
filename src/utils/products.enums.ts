export enum ProductCondition {
  A = 'New',
  B = 'Used',
  C = 'Refurbished',
  D = 'Damaged',
}
export enum ProductGender {
  Male = 'Male',
  Female = 'Female',
  Unisex = 'Unisex',
}
export enum ProductCategory {
  Shirt = 'Shirt',
  Pants = 'Pants',
  Dress = 'Dress',
  Jacket = 'Jacket',
  Coat = 'Coat',
  Suit = 'Suit',
  Blazer = 'Blazer',
  Sweater = 'Sweater',
  Cardigan = 'Cardigan',
  Top = 'Top',
  Blouse = 'Blouse',
  Tshirt = 'Tshirt',
  Tanktop = 'Tanktop',
  Jumpsuit = 'Jumpsuit',
  Skirts = 'Skirts',
  Other = 'Other',
  Shorts = 'Shorts',
  Jeans = 'Jeans',
  Leggings = 'Leggings',
  Rompers = 'Rompers',
  Trousers = 'Trousers',
  Joggers = 'Joggers',
  PoloShirts = 'Polo Shirts',
  Hoodies = 'Hoodies',
  
}
const ClothingCategories = [
    'Tops',
    'Dress',
    'Sweaters',
    'Jacket',
    'Coat',
    'Suit',
    'Skirts',
    'Shorts',
    'Jeans',
    'Pants',
    'Leggings',
    'Jumpsuits',
    'Rompers',
    'Trousers',
    'Joggers',
    'Polo Shirts',
    'T-Shirts',
    'Blouses',
    'Shirts',
    'Hoodies',
]

export enum ProductSize {
  XXS = 'XXS',
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
}
export enum ProductMaterial {
  Cotton = 'Cotton',
  Polyester = 'Polyester',
  Silk = 'Silk',
  Wool = 'Wool',
  Leather = 'Leather',
  Denim = 'Denim',
  Linen = 'Linen',
  Other = 'Other',
}

export enum ProductColors {
  Black = 'Black',
  White = 'White',
  Red = 'Red',
  Blue = 'Blue',
  Green = 'Green',
  Yellow = 'Yellow',
  Pink = 'Pink',
  Purple = 'Purple',
  Orange = 'Orange',
  Brown = 'Brown',
  Grey = 'Grey',
  Beige = 'Beige',
  Other = 'Other',
}
export enum ProductTags {
  Vintage00s = "00's Vintage",
  Streetwear = 'Streetwear',
  Casual = 'Casual',
  Formal = 'Formal',
  Sportswear = 'Sportswear',
  Retro = 'Retro',
  Modern = 'Modern',
  Classic = 'Classic',
  Trendy = 'Trendy',
  Other = 'Other',
}

const measurements = {
    Shirt: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Sleeve Length', 'Fit'],
    Pants: ['Waist', 'Hip', 'Rise', 'Inseam', 'Length', 'Leg Opening'],
    Dress: ['Bust', 'Waist', 'Hip', 'Length', 'Sleeve Length', 'Fit'],
    Skirt: ['Waist', 'Hip', 'Length', 'Fit'],
    Jacket: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Coat: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Suit: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Blazer: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Sweater: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Cardigan: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Top: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Blouse: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Tshirt: ['Chest', 'Shoulder', 'Sleeve', 'Length', 'Fit'],
    Tanktop: ['Chest', 'Shoulder', 'Length', 'Fit'],
    Jumpsuit: ['Chest', 'Waist', 'Hip', 'Length', 'Fit'],
}



export enum FitTypes {
  Slim = 'Slim',
  Regular = 'Regular',
  Loose = 'Loose',
  Oversized = 'Oversized',
}