import brandsData from './brand.json';

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

const brands = brandsData as Record<string, Brand>;

export type BrandName = typeof brands[keyof typeof brands]['name'];
export type BrandSlug = typeof brands[keyof typeof brands]['slug'];

export const getBrandByName = (name: string): Brand | undefined => {
  return Object.values(brands).find((brand: Brand) => brand.name === name);
};

export const getBrandBySlug = (slug: string): Brand | undefined => {
  return Object.values(brands).find((brand: Brand) => brand.slug === slug);
};

export const getAllBrands = (): Brand[] => {
  return Object.values(brands);
};

export default brands;
