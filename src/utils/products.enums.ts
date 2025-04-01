export enum ProductCondition {
  NewWithTags = "new_with_tags",
  LikeNew = "like_new",
  UsedGood = "used_good",
  UsedFair = "used_fair",
}

export enum Gender {
  Menswear = 'Menswear',
  Womenswear = 'Womenswear',
}

export enum ProductSize {
  DoubleExtraSmall = 'Double Extra Small',
  ExtraSmall = 'Extra Small',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  ExtraLarge = 'Extra Large',
  DoubleExtraLarge = 'Double Extra Large',
  TripleExtraLarge = 'Triple Extra Large',
  QuadrupleExtraLarge = 'Quadruple Extra Large',
  XXS = 'XXS',
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
  OneSize = 'OS',
}

export enum Material {
  Acrylic = "Acrylic",
  Canvas = "Canvas",
  Cashmere = "Cashmere",
  Corduroy = "Corduroy",
  Cotton = "Cotton",
  CottonOrganic = "Cotton - Organic",
  CottonRecycled = "Cotton - Recycled",
  Crochet = "Crochet",
  Denim = "Denim",
  Elastane = "Elastane / Lycra / Spandex",
  Embellished = "Embellished",
  FauxFur = "Faux fur",
  FauxLeather = "Faux leather",
  Fleece = "Fleece",
  Fur = "Fur",
  Hemp = "Hemp",
  Jersey = "Jersey",
  Knitted = "Knitted",
  Lace = "Lace",
  Leather = "Leather",
  Linen = "Linen",
  Lyocell = "Lyocell",
  Modal = "Modal",
  Nylon = "Nylon",
  Polyester = "Polyester",
  PolyesterRecycled = "Polyester - Recycled",
  Rayon = "Rayon",
  Rubber = "Rubber",
  Satin = "Satin",
  Silk = "Silk",
  Spandex = "Spandex", 
  Suede = "Suede",
  Tweed = "Tweed",
  Velvet = "Velvet",
  Viscose = "Viscose",
  Wool = "Wool"
}


export enum ProductColors {
  BLACK = 'black',
  GREY = 'grey',
  WHITE = 'white',
  BROWN = 'brown',
  TAN = 'tan',
  CREAM = 'cream',
  YELLOW = 'yellow',
  RED = 'red',
  BURGUNDY = 'burgundy',
  ORANGE = 'orange',
  PINK = 'pink',
  PURPLE = 'purple',
  BLUE = 'blue',
  NAVY = 'navy',
  GREEN = 'green',
  KHAKI = 'khaki',
  MULTI = 'multi',
};


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

export enum ProductStyles {
  Vintage = 'Vintage',
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

export enum ProductStatus {
  draft = 0,
  active = 1,
  sold = 2,
  pendingAction = 3,
  deactivated = 4, // same as delisted 
}

export enum MaterialOptions {
  Cotton = 'Cotton',
  Polyester = 'Polyester',
  Wool = 'Wool',
  Silk = 'Silk',
  Linen = 'Linen',
  Nylon = 'Nylon',
  Rayon = 'Rayon',
  Spandex = 'Spandex',
  Denim = 'Denim',
  Leather = 'Leather',
  Fur = 'Fur',
  Fleece = 'Fleece',
  Velvet = 'Velvet',
  Satin = 'Satin',
  Viscose = 'Viscose',
  Acrylic = 'Acrylic',
  Other = 'Other',
  None = 'None',
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

export enum size_enum {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL',
    XXXL = 'XXXL',
}

export enum ProductSource {
  vintage = 'Vintage',
  preloved = 'Preloved',
  reworked = 'Reworked',
  custom = 'Custom',
  handmade = 'Handmade',
  deadstock = 'Deadstock',
  designer = 'Designer',
  repaired = 'Repaired',
}

export enum ProductAge {
  modern = 'Modern',
  y2k = '2000s',
  nineties = '1990s',
  eighties = '1980s',
  seventies = '1970s',
}