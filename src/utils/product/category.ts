import { Gender } from '../products.enums';

//----------------------------------------------------------------
// Category class shared between frontend and backend
//----------------------------------------------------------------

type CategoryKey = keyof typeof categoryHierarchy;

export class Category {
  label: string;
  sub: Category[];

  constructor(label: string, sub: Category[] = []) {
    this.label = label;
    this.sub = sub;
  }

  // Generate a URL-friendly slug from the label
  get value(): string {
    return this.label.replace(/-/g, '').replace(/\s+/g, '_').toLowerCase();
  }

  // Check if the category has subcategories
  get hasSubcategories(): boolean {
    return this.sub.length > 0;
  }

  // Validate if a subcategory exists under a given category key
  validateCategory(categoryKey: CategoryKey, subcategoryValue: string): boolean {
    const rootCategories = categoryHierarchy[categoryKey];
    if (!rootCategories) return false;

    return rootCategories.some((category) => this.findSubcategory(category, subcategoryValue));
  }

  // Recursively find a subcategory by its value
  private findSubcategory(category: Category, targetValue: string): boolean {
    if (category.value === targetValue) return true;
    return category.sub.some((sub) => this.findSubcategory(sub, targetValue));
  }

  // Helper function to capitalize first letter
  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Get all unique top-level categories across all genders
  static getAllTopLevelCategories(): string[] {
    const categories = new Set<string>();
    
    // Extract category names from the categoryHierarchy keys
    Object.keys(categoryHierarchy).forEach(key => {
      // Extract the category part after the gender prefix (e.g., 'men_tops' -> 'Tops')
      const category = key.split('_')[1];
      if (category) {
        categories.add(this.capitalize(category));
      }
    });

    return Array.from(categories);
  }

  // Get allowed categories based on gender
  static getCategories(gender: Gender): string[] {
    const menCategories = ['Tops', 'Bottoms', 'Outerwear', 'Suits'];
    const womenCategories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Suits', 'Onesies'];
    return gender === Gender.Menswear ? menCategories : womenCategories;
  }

  // Get all valid subcategories for a gender-category combination
  static getSubcategories(gender: Gender, category: string): string[] {
    const key = `${gender === Gender.Menswear ? 'men' : 'women'}_${category.toLowerCase()}` as CategoryKey;
    const root = categoryHierarchy[key];

    if (!root) return [];

    const flatten = (cats: Category[]): string[] =>
      cats.flatMap((c) => [c.label, ...c.sub.flatMap((sc) => [sc.label, ...sc.sub.map((ssc) => ssc.label)])]);

    return Array.from(new Set(flatten(root))); // Remove duplicates
  }

  // Get all subcategories across all genders and categories
  static getAllSubcategories(): string[] {
    const allSubcategories: string[] = [];

    // Recursively traverse the category hierarchy
    const traverse = (categories: Category[]) => {
      for (const category of categories) {
        // Add the current category label
        allSubcategories.push(category.label);
        
        // Add all subcategories at each level
        if (category.sub.length > 0) {
          // Add direct subcategories
          category.sub.forEach(subCat => {
            allSubcategories.push(subCat.label);
            // Add any deeper level subcategories
            if (subCat.sub.length > 0) {
              subCat.sub.forEach(subSubCat => {
                allSubcategories.push(subSubCat.label);
              });
            }
          });
        }
      }
    };

    // Traverse all root categories in the hierarchy
    for (const rootCategories of Object.values(categoryHierarchy)) {
      traverse(rootCategories);
    }

    // Remove duplicates and return
    return Array.from(new Set(allSubcategories));
  }

  // Validate category-subcategory relationship
  static validate(gender: Gender, category: string, subcategory: string): boolean {
    // Convert Menswear/Womenswear to men/women prefix
    const genderPrefix = gender === Gender.Menswear ? 'men' : 'women';
    const key = `${genderPrefix}_${category.toLowerCase()}` as CategoryKey;
    console.log('Validating with key:', key);
    const root = categoryHierarchy[key];

    if (!root) {
      console.log('Root not found for key:', key);
      return false;
    }

    const normalizeValue = (str: string) => str.replace(/-/g, '').replace(/\s+/g, '_').toLowerCase();
    const targetValue = normalizeValue(subcategory);
    console.log('Target value:', targetValue);

    // Recursive function to search through the category tree
    const search = (cat: Category): boolean => {
      console.log('Checking category:', cat.label);
      const currentValue = normalizeValue(cat.label);
      
      // Check if current category matches
      if (currentValue === targetValue) {
        console.log('Found match at:', cat.label);
        return true;
      }
      
      // Check subcategories if any
      if (cat.sub.length > 0) {
        return cat.sub.some(subCat => search(subCat));
      }
      
      return false;
    };

    // Search through all root categories
    const result = root.some(cat => search(cat));
    console.log('Validation result:', result);
    return result;
  }

  // Format the category hierarchy for prompt generation
  static formatCategoryHierarchy(): string {
    let result = '';

    // Helper function to format subcategories
    const formatSubcategories = (categories: Category[], prefix: string = ''): string[] => {
      return categories.flatMap(cat => {
        const lines = [`${prefix}# ${cat.label}`];
        if (cat.sub.length > 0) {
          cat.sub.forEach(subCat => {
            lines.push(`${prefix}  # ${subCat.label}`);
            if (subCat.sub.length > 0) {
              subCat.sub.forEach(subSubCat => {
                lines.push(`${prefix}    # ${subSubCat.label}`);
              });
            }
          });
        }
        return lines;
      });
    };

    // Process menswear categories
    result += '* Menswear\n';
    const menCategories = ['Tops', 'Bottoms', 'Outerwear', 'Suits'];
    menCategories.forEach(cat => {
      const key = `men_${cat.toLowerCase()}` as CategoryKey;
      const categories = categoryHierarchy[key];
      if (categories) {
        result += `- ${cat}\n`;
        result += formatSubcategories(categories, '  ').join('\n') + '\n';
      }
    });

    // Process womenswear categories
    result += '\n* Womenswear\n';
    const womenCategories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Suits', 'Onesies'];
    womenCategories.forEach(cat => {
      const key = `women_${cat.toLowerCase()}` as CategoryKey;
      const categories = categoryHierarchy[key];
      if (categories) {
        result += `- ${cat}\n`;
        result += formatSubcategories(categories, '  ').join('\n') + '\n';
      }
    });

    return result.trim();
  }
}

//----------------------------------------------------------------
// Utility Functions
//----------------------------------------------------------------

// Initialize categories from raw data
const createCategories = (labels: (string | [string, string[]])[]): Category[] => {
  return labels.map((label) => (typeof label === 'string' ? new Category(label) : new Category(label[0], createCategories(label[1]))));
};

//----------------------------------------------------------------
// Shared Data
//----------------------------------------------------------------

// Raw data for shared categories (not pre-instantiated)
const sharedTopsData: (string | [string, string[]])[] = [
  ['T-Shirts', ['Long Sleeve', 'Short Sleeve']],
  'Hoodies',
  ['Sweaters', ['Cardigans', 'Crewneck', 'Turtleneck', 'Sweatshirt', 'Zip-Up']],
  ['Shirts', ['Polo', 'Rugby', 'Casual', 'Button-Up']],
  'Jerseys',
  'Vests',
];

const sharedBottomsData: (string | [string, string[]])[] = [
  ['Jeans', ['Bootcut', 'Relaxed', 'Skinny', 'Slim', 'Straight', 'Oversized', 'Wide']],
  'Sweatpants',
  ['Trousers', ['Khakis', 'Cargos', 'Corduroy', 'Dress', 'Chinos', 'Linen', 'Leather']],
  ['Shorts', ['Cargo', 'Jean', 'Jogger', 'Chino', 'Bermudas']],
];

const sharedOuterwearData: (string | [string, string[]])[] = [
  ['Coats', ['Heavy', 'Puffer', 'Rain', 'Parkas']],
  ['Jackets', ['Denim', 'Leather', 'Light', 'Bomber', 'Puffer', 'Shirt', 'Varsity']],
];

// Full Apparel Hierarchy
const categoryHierarchy = {
  // men
  men_tops: createCategories(sharedTopsData),
  men_bottoms: createCategories(sharedBottomsData),
  men_outerwear: createCategories(sharedOuterwearData),
  men_suits: createCategories([['Suits', ['Jacket', 'Trousers', 'Waistcoat', 'One Piece']]]),
  men_onesies: createCategories(['Jumpsuits']),

  // women
  women_tops: createCategories([...sharedTopsData, ['Crop Tops', ['Tube Tops', 'Halter Tops']], 'Blouses', 'Corsets']),
  women_bottoms: createCategories([...sharedBottomsData, 'Leggings', ['Skirts', ['Maxi', 'Midi', 'Mini']]]),
  women_dresses: createCategories([['Dresses', ['Maxi', 'Midi', 'Mini']]]),
  women_outerwear: createCategories(sharedOuterwearData),
  women_suits: createCategories([['Suits', ['Jacket', 'Trousers', 'Waistcoat', 'One Piece']]]),
  women_onesies: createCategories(['Jumpsuits', 'Rompers']),
};

export { categoryHierarchy };
