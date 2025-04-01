import * as fuzzball from 'fuzzball';
import * as fs from 'fs';
import * as path from 'path';
import { Brand } from './brand';

/**
 * Load brands from the brand.json file
 * @returns Array of Brand objects
 */
function loadBrands(): Brand[] {
  try {
    const filePath = path.join(__dirname, 'brand.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const brandsObject = JSON.parse(fileContent);
    
    // Convert the object to an array of Brand objects
    return Object.values(brandsObject);
  } catch (error) {
    console.error('Error loading brands:', error);
    return [];
  }
}

/**
 * Find the closest brand match using fuzzy matching
 * @param brandName - The brand name to match
 * @param options - Optional parameters for fuzzy matching
 * @returns The matched Brand object or null if no match found
 */
export function findClosestBrandMatch(
  brandName: string | null, 
  options: { 
    cutoff?: number,      // Minimum score to consider a match (0-100)
    forceAscii?: boolean, // Strip non-ascii characters
    useCollator?: boolean // Use Intl.Collator for locale-sensitive string comparison
  } = {}
): Brand | null {
  if (!brandName) return null;
  
  const brands = loadBrands();
  if (brands.length === 0) return null;
  
  // Default options
  const defaultOptions = {
    cutoff: 90,
    forceAscii: true,     // Strip non-ascii characters
    useCollator: true,    // Use Intl.Collator for locale-sensitive string comparison
    ...options
  };
  
  // Extract just the brand names for matching
  const brandNames = brands.map(brand => brand.name);
  
  // Use token_set_ratio for best matching with different word orders
  // and partial_ratio for partial matches
  const extractResult = fuzzball.extract(brandName, brandNames, {
    scorer: fuzzball.token_set_ratio,
    processor: (choice) => choice,
    limit: 1,             // Only return the best match
    cutoff: defaultOptions.cutoff,
    force_ascii: defaultOptions.forceAscii,
    useCollator: defaultOptions.useCollator
  });
  
  // If no match found
  if (extractResult.length === 0) {
    return null;
  }
  
  // Find the brand object that matches the name
  const [matchedName, score, index] = extractResult[0];
  return brands[index];
}

/**
 * Enhance product data with the closest brand match
 * @param productData - The product data containing a brand field
 * @returns The enhanced product data with matched brand
 */
export function enhanceProductWithBrandMatch<T extends { brand: string | null }>(productData: T): T {
  if (!productData.brand) return productData;
  
  const matchedBrand = findClosestBrandMatch(productData.brand);
  
  if (matchedBrand) {
    // Create a new object to avoid mutating the original
    return {
      ...productData,
      brand: matchedBrand.name
    };
  }
  
  return productData;
}
