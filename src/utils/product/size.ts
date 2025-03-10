export const sizesByScale: Record<string, string[]> = {
    letter: ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "OS"],
    numeric: [
      "22","23","24","25","26","27","28","29","30","31","32",
      "33","34","35","36","37","38","39","40","41","42","One Size",
    ],
    us: [
      "00","0","2","4","6","8","10","12","14","16","18","20","22","One Size",
    ],
    uk: [
      "4","6","8","10","12","14","16","18","20","22","24","26","One Size",
    ],
    jp: [
      "3","5","7","9","11","13","15","17","19","21","23","One Size",
    ],
  };
  
  export const productSizes = Array.from(
    new Set([
      ...sizesByScale.letter,
      ...sizesByScale.numeric,
      ...sizesByScale.us,
      ...sizesByScale.uk,
      ...sizesByScale.jp,
    ])
  ) as readonly string[];
  
  export type ProductSize = string;