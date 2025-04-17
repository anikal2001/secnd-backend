import 'dotenv/config';
import { z } from 'zod';
import OpenAI from 'openai';
import { Gender, ProductColors, ProductCondition, Material, ProductSource } from '../utils/products.enums';
import { Category } from '../utils/product/category';
import { productSizes } from '../utils/product/size';
import { ChatCompletion } from 'openai/resources/chat';
import { mens_attributes, womens_attributes } from '../utils/product/features';
import { features } from '../utils/product/features';
import { get } from 'http';
import { Product } from '../entity/product.entity';

/**
 * Interfaces for the template system
 */
export interface Template {
  id: string;
  name: string;
  content: string;
}

export interface TemplateAttribute {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  placeholder?: string;
}

export interface TemplateConfig {
  title: Template | null;
  description: Template | null;
  exampleDescription: string | null;
  attributes: Record<string, TemplateAttribute>;
}

/**
 * Zod schema for product response validation
 */
export interface Measurement {
  id: string;
  label: string;
  custom: string; // user override; if empty, display label
  value?: number;
  unit?: string;
}

export interface MeasurementsByCategory {
  [key: string]: Measurement[];
}

// Create a Zod schema for the Measurement interface
const MeasurementSchema = z.object({
  id: z.string(),
  label: z.string(),
  custom: z.string(),
  value: z.number().optional(),
  unit: z.string().optional(),
});

// Define a dynamic attributes schema that can accept any string key with array of strings value
const DynamicAttributesSchema = z.record(z.string(), z.union([z.array(z.string()), z.null()]).catch(null));

export const ProductResponseSchema = z
  .object({
    // Assuming title, description, price and condition should be provided, so we leave those without fallback.
    title: z.string(),
    description: z.string(),
    descriptionHtml: z.string().nullable().optional().catch(null),
    price: z.number(),
    color: z.object({
      primaryColor: z
        .array(z.enum(Object.values(ProductColors) as [string, ...string[]]))
        .transform((colors) => colors.filter((color) => (Object.values(ProductColors) as ProductColors[]).includes(color as ProductColors)))
        .nullable()
        .catch(null),
      secondaryColor: z
        .array(z.enum(Object.values(ProductColors) as [string, ...string[]]))
        .transform((colors) => colors.filter((color) => (Object.values(ProductColors) as ProductColors[]).includes(color as ProductColors)))
        .nullable()
        .catch(null),
    }),
    size: z
      .enum(Object.values(productSizes) as [string, ...string[]])
      .nullable()
      .catch(null),
    gender: z.enum([Gender.Menswear, Gender.Womenswear]),
    category: z.enum(Object.values(Category.getAllTopLevelCategories()) as [string, ...string[]]),
    subcategory: z.enum(Object.values(Category.getAllSubcategories()) as [string, ...string[]]).optional(),
    material: z
      .enum(Object.values(Material) as [string, ...string[]])
      .nullable()
      .catch(null),
    condition: z.string(),
    condition_notes: z.string().nullable().optional().catch(null),
    brand: z.string().nullable().catch(null),
    tags: z.array(z.string()),
    age: z.string().nullable().catch(null),
    item_style: z.string().nullable().catch(null),
    fit_type: z.string().nullable().catch(null),
    made_in: z.string().nullable().catch(null),
    source: z
      .array(z.enum(Object.values(ProductSource) as [string, ...string[]]))
      .nullable()
      .catch(null),
    design: z.string().nullable().catch(null),
    closure_type: z.string().nullable().catch(null),
    // Updated to use the Measurement interface for validation
    measurements: z
      .union([
        // Option 1: An array of Measurement objects
        z.array(MeasurementSchema),

        // Option 2: A record where the key is a category and the value is an array of Measurement objects (MeasurementsByCategory)
        z.record(z.string(), z.array(MeasurementSchema)),

        // Option 3: Allow null/undefined with a fallback
        z.null(),
      ])
      .nullable()
      .catch(null),
    // Add dynamic attributes schema
    attributes: DynamicAttributesSchema.nullable().catch(null),
  })
  // Transform to correct category based on subcategory before validation
  // This transformation guarantees that we'll never have a null category
  .transform((data) => {
    // Only proceed if we have both gender and subcategory
    if (!data.gender || !data.subcategory) return data;

    // Use our safe category method that handles special cases and provides fallbacks
    const safeCategory = Category.getSafeCategory(data.gender, data.subcategory, data.category);

    // Log the change if needed
    if (safeCategory !== data.category) {
      console.log(`Auto-correcting category for ${data.subcategory} from ${data.category || 'undefined'} to ${safeCategory}`);
    }

    // Return the data with the safe category
    return { ...data, category: safeCategory };
  })
  .refine((data) => !data.subcategory || Category.validate(data.gender, data.category, data.subcategory), {
    message: 'Invalid category/subcategory combination for gender.',
    path: ['product_subcategory'],
  });

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

/**
 * Helper to convert a attribute name to a feature key
 * Converts "Sleeve length type" to "sleeve-length-type" format
 */
export function attributeNameToFeatureKey(attributeName: string): string {
  return attributeName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Get attribute options for a specific attribute
 */
export function getAttributeOptions(attributeName: string): { handle: string; displayName: string; id?: string }[] {
  const key = attributeNameToFeatureKey(attributeName);
  const options = (key in features ? features[key as keyof typeof features] : []) || [];

  // Normalize the options to ensure all have the correct property names
  return options.map((option) => ({
    handle: option.handle,
    displayName: option.displayName || option['displayName'] || '',
    id: option.id,
  }));
}

/**
 * Get the attributes for a specific gender, category, and subcategory
 */
export function getAttributesForProduct(gender: Gender, category: string, subcategory?: string): string[] {
  const attributeMap = gender === Gender.Menswear ? mens_attributes : womens_attributes;

  // Create a key in the format: gender_category_subcategory or gender_category_default
  let key = '';

  if (subcategory) {
    key = `${gender.toLowerCase()}_${category.toLowerCase()}_${subcategory}`;
    // Check if there's a specific entry for this subcategory
    if (key in attributeMap) {
      return attributeMap[key as keyof typeof attributeMap];
    }
  }

  // Try with default subcategory
  key = `${gender.toLowerCase()}_${category.toLowerCase()}_default`;
  if (key in attributeMap) {
    return attributeMap[key as keyof typeof attributeMap];
  }

  // Fallback to category only
  key = `${gender.toLowerCase()}_${category.toLowerCase()}`;
  if (key in attributeMap) {
    return attributeMap[key as keyof typeof attributeMap];
  }

  // Return empty array if no attributes found
  return [];
}

/**
 * Get formatted attribute options for instructions
 */
export function getFormattedAttributeOptionsForInstructions(): string {
  const formattedOptions = Object.entries(features)
    .map(([key, options]) => {
      // Convert key from kebab-case to Title Case
      const formattedKey = key
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Format the options
      const optionsList = options
        .filter((option) => option.handle !== 'other')
        .map((option) => option.displayName)
        .join(', ');

      return `- **${formattedKey}**: ${optionsList}`;
    })
    .join('\n');

  return formattedOptions;
}

/**
 * Process a template string by replacing placeholders with values
 * or removing placeholder tokens for null values
 */
export function processTemplate(template: string, values: Record<string, any>): string {
  if (!template) return '';

  // First pass: Replace all placeholders that have non-null values
  let processedTemplate = template;
  Object.entries(values).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      const placeholder = `@${key}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), String(value));
    }
  });

  // Second pass: Remove any remaining placeholders and extra spaces
  processedTemplate = processedTemplate
    .replace(/@\w+/g, '') // Remove any remaining placeholders
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing spaces

  return processedTemplate;
}

const getPriceSuggestions = async (title: string) => {
  const query = `query search2($query: SearchQueryInput!, $nextPageId: String, $count: Int) {\n  search2(query: $query, nextPageId: $nextPageId, count: $count) {\n    results {\n      type\n      product {\n        ...ProductFragment\n      }\n    }\n    nextPageId\n    exactCount\n    partialCount\n    suggestions\n  }\n}\n\nfragment ProductFragment on Product {\n  id\n  source\n  url\n  urlAffiliate\n  available\n  removedDate\n  seller\n  title\n  price\n  priceOriginalNumber\n  priceOriginalCurrency\n  gender\n  countryName\n  images {\n    thumbnail {\n      url\n      width\n      height\n    }\n    full {\n      url\n      width\n      height\n    }\n  }\n  outboundLinkText\n  itemTypeV1\n  sizesV1 {\n    type\n    label\n    values {\n      label\n      value\n      value2\n      unit\n      isMore\n      sizeParam\n      convLabel\n      convValue\n    }\n    notes {\n      icon\n      text\n      action\n    }\n  }\n  isAuction\n  saved\n}`;
  const variables = {
    query: {
      terms: title,
    },
    nextPageId: 'eyJ0eXBlIjoiZXhhY3QiLCJzb3J0S2V5IjpbMTAuNzc0ODYsImNhcmhhcnR0LWNhcmhhcnR0LXdpcC12aW50YWdlLXZpbnRhZ2UtNjIzNjUiXX0=',
    count: 50,
  };
  const headers = {
    Cookie:
      'currency=CAD; measurements=%7B%22mtsUnits%22%3A%22orig%22%2C%22mtsConvertFlat%22%3Anull%7D; homeImage=13%2C0; sidePanel={%22isOpen%22:false}; _ga=GA1.1.1999525011.1744354020; _ga_49N51MV1DX=GS1.1.1744354019.1.1.1744354090.0.0.0',
    'Content-Type': 'application/json',
    Accept: '*/*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 OPR/117.0.0.0',
    Referer: 'https://gem.app/',
  };

  const res = await fetch('https://backend.gem.app/graphql', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  const data = await res.json();

  const results = data.data.search2.results.slice(0, 5);
  const prices = results.map((result: any) => result.product.priceOriginalNumber);

  const sum = prices.reduce((total: number, price: number) => total + price, 0);
  const average = Math.ceil(sum / prices.length) - 0.01;

  return average;
};
/**
 * Creates messages for image analysis with templates
 */
export function createImageAnalysisMessages(
  imageUrls: string[],
  templateConfig: TemplateConfig,
  tags?: string[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const ProductColorsList = Object.values(ProductColors).join(', ');
  const ProductMaterialsList = Object.values(Material).join(', ');
  const ProductSizesList = productSizes.join(', ');
  const ProductConditionsList = Object.values(ProductCondition).join(', ');
  const ProductSourceList = Object.values(ProductSource).join(', ');
  const CategoryHierarchy = Category.formatCategoryHierarchy();

  const forInferenceTags = tags || [];

  // Check if templates are provided
  const hasTitleTemplate = !!templateConfig.title?.content;
  const hasDescriptionTemplate = !!templateConfig.description?.content;

  // Handle title configuration
  let titleInstructions = '';
  if (hasTitleTemplate) {
    const titleTemplate = templateConfig.title?.content || '';
    titleInstructions = `
RECEIVED CUSTOM title template: ${titleTemplate}
Optimize the following user provided CUSTOM title template for natural flow and SEO while preserving all @placeholders: ${titleTemplate}. 
If the title does not look good enough with the placeholder, optimize the title further for preserving placeholder. Aim for more factual statements, instead of decorative or promotional language. Begin each product title with the most pertinent keywords, including the item's type, brand, and defining features. Example: Instead of "Stylish Vintage Jacket," use "Vintage Levi's Denim Jacket - Medium Wash, Size M."​ 

Format details:
${titleTemplate}
- Age: If inferable (e.g., 1970s, 1980s, 1990s, 2000s, 2010s)
- Source: Limited options: Vintage, Preloved, Reworked, Deadstock, Designer
- Style: Specific style (e.g., Heavy Metal, FC Barcelona, Streetwear)
- Design: Details like Single Stitch, Double Stitch, Overlock, Bartack, Screen Print, Embroidery
- Made In: Include only if 55% certain and if from North America/Europe
- Material: Primary material (from: ${ProductMaterialsList})
- Color: Primary color(s) (from: ${ProductColorsList})
- Size: Limited Options (do not provide anything but the following): ${ProductSizesList} 

IMPORTANT: If ANY inferred placeholder is null and it is a PLACEHOLDER, it shouldn't show up in the title template that you return, and you should leave it out.
 - For example: if the format is "@age @brand" and your inferred age is null, the returned title should just be "@brand" and "@age" should be left out.
`;
  } else {
    titleInstructions = `
Compose a title using the following format:
- Vintage [age/decade] [brand/text] / [subcategory] / [fit type/design] / [style descriptor 1] [/ [style descriptor 2]]
  - Example 1: "Vintage 1990s Martinique carribean / Vacation Crewneck Sweatshirt"
  - Example 2: "Vintage 2000s Plaid Button Up / Colourful / Flannel / Shirt"
  - Example 3: "Vintage 1990s Levi Strauss 501 Red Tab Button Fly Denim Jeans / Made in USA / American Vintage / Workwear / Streetwear"
- Style: Aesthetic style (e.g. Football, Metal, Streetwear, etc.)
- Age: Inferred era if possible, if not 50% sure, do not give an age. Look for signs on the clothing like tags, graphics, or other indicators.
- Color: Dominant color(s) (from: ${ProductColorsList})
- Material: Primary material (from: ${ProductMaterialsList})
- Subcategory: Item type based on provided hierarchy
- Design: Notable patterns or details
- Fit Type: Clothing fit (e.g., slim, regular, loose)
- Size: Use only provided options (${ProductSizesList}); if applicable, provide waist size only.
`;
  }

  // Handle description configuration
  let descriptionInstructions = '';
  const exampleDescription = templateConfig.exampleDescription || '';

  if (hasDescriptionTemplate) {
    const descriptionTemplate = templateConfig.description?.content || '';
    descriptionInstructions = `RECEIVED CUSTOM description template: ${descriptionTemplate}. Produce one direct, concise, keyword-rich sentence using key e-commerce search terms. Focus on product features, rather than promotional language. Do not include bullet points or additional details. Include synonyms and related terms to capture a broader range of search queries.`;

    if (exampleDescription) {
      descriptionInstructions += `\n\nHere's an example description to guide you: "${exampleDescription}"`;
    }
  } else {
    descriptionInstructions = `Compose a description using the default format with bullet points as follows:
    - **Summary:** A brief 1-2 sentence factual overview focusing on essential details using high-traffic keywords. Avoid promotional language or ideal use cases. 
    - **Use Product Features:** Use the product's specific features, such as material, color, size, and design, rather than subjective or promotional terms.  
    - **Eliminate Subjective Terms:** Eliminate adjectives like "standout," "unique," or "stylish" and focus on descriptive keywords that are relevant to search queries.
        - Example 1: ""
        
    `;

    if (exampleDescription) {
      descriptionInstructions += `\n\nHere's an example description to guide you: "${exampleDescription}"`;
    }
  }

  const tagInstructions = tags?.length
    ? `
    Use ONLY these predefined tags: ${forInferenceTags.join(', ')}.
    - **Predefined Tags Provided:** Use ONLY the following tags as they are highly optimized and context-specific.
    - **Avoid Generating New Tags:** Since tags are predefined, do not generate or infer new tags.
    - **Maintain Tag Consistency:** Ensure tags reflect the product’s key attributes, such as brand, team, material, and era.
    - **DO NOT USE ANY EXTERNAL TAGS:** Do not use any external tags or keywords that are not part of the provided list.
  `
    : `
    - **Brand/Team:** Prioritize official brands, team names, and associations. Example: Toronto Blue Jays, Levi's, Nike.
    - **Alternate Spellings & Variations:** Use variations and alternate spellings to capture a broader audience. Example: "Blue Jays," "Blue-Jays," "BlueJays."
    - **Product Type/Category:** Include item descriptors like "graphic tee," "vintage jacket," "denim jeans."
    - **Style and Material:** Include terms that describe the style, era, and material (e.g., "Y2K," "cotton," "streetwear"). Include synonyms for style descriptors.
    - **Relevant Trends & Aesthetics:** Capture keywords reflecting popular trends or aesthetics (e.g., "minimalist," "oversized," "retro").
    - **Condition/Source:** Include relevant terms to indicate product condition and origin (e.g., "deadstock," "preloved," "reworked").
    - **Limit to 13 Tags:** Generate **13 highly relevant tags** that cover a range of potential buyer search terms.
    `;

  // Create the base instruction set
  const baseInstructions = `
Analyze the clothing item from the following images and provide JSON with detailed attributes optimized for SEO.

### **Task Instructions**:
1. **Images to analyze:**
   - Front: ${imageUrls[0]}
   - Back: ${imageUrls[1]}
   - Detail: ${imageUrls[2]}

### Analysis Steps: 
1. **Determine Gender:** Choose "Menswear" or "Womenswear" (default to "Menswear" for unisex items).
2. **Identify Category and Subcategory:** Use the following hierarchy:
${CategoryHierarchy}
3. **Extract Attributes & Build JSON:** Include:
    - **Title**: ${titleInstructions}
    - **Description**: ${descriptionInstructions}
    - **DescriptionHtml**: Provide the html version of the description 
    - **Price:** Estimated price as a number (e.g., 25.99), considering condition, brand, and trend.
    - **Colors:**
       - **Primary:** Dominant colors (choose from: ${ProductColorsList}; map similar hues as needed)
       - **Secondary:** Accent colors
    - **Material:** Primary material (from: ${ProductMaterialsList})
    - **Size:** Must match one of the options: ${ProductSizesList} (if possible, provide waist size only)
    - **Category:** Determined category (e.g., "Tops")
    - **Subcategory:** Determined subcategory (e.g., "T-Shirts")
    - **Condition:** Use one of the options: ${ProductConditionsList}
    - **Brand:** Visible brand name, if present
    - **Gender:** As determined
    - **Tags:** Generate 13 SEO-friendly, relevant tags, with the following instructions: ${tagInstructions}
    - **Age:** Inferred age (e.g., "1990s"); use only if you are at least 50% certain, otherwise set as null.
    - **Style:** Overall style (e.g., "vintage")
    - **Design:** Notable design elements (e.g., "flannel", "minimalist")
    - **Fit Type:** Clothing fit (e.g., "slim", "regular", "loose")
    - **Closure Type:** Type of closure (e.g., "buttons", "zippers", "hooks"). If none, leave as null.
    - **Made In:** Country of manufacture (e.g., "USA", "China")
    - **Source:** List of two sources max. (e.g., "Vintage", "New"): Choose from: ${ProductSourceList}
    - **Condition Notes:** Specific details regarding the condition that would be essential for the buyer to know.
    - **Attributes:** After determining gender, category, and subcategory, include specific attributes relevant to the item. Each attribute should be an array of one or more values (even if there's only one value, it should be in an array).

### Detailed Inspection Guidelines:
Before finalizing your answer, carefully review each image for:
- Logos and text placement
- Fabric texture and patterns
- Stitching quality and construction details
- Hardware elements (buttons, zippers, etc.)
- Distinctive features indicating era or brand

### Expectations:
- Always guess the gender, category, and subcategory, even if uncertain.
- Provide as much detail as possible.
- Ensure there is sentence of the description that is **SEO-optimized** and compelling.
- Use **high-traffic keywords** in titles and descriptions.
- Use **null** for attributes that cannot be determined, except "title", "description", "price", and "condition".
${hasDescriptionTemplate ? '- Return only the sentence as per the instructions that should be inserted for @descriptive_sentence in the final JSON' : '- Produce the full description as per the default instructions.'}
${hasTitleTemplate ? '- For title with template: When forming the title string from the provided template, if any inferred attribute value is null, completely remove its corresponding placeholder token (e.g., @brand, @age) from the final title.' : ''}

### IMPORTANT:
${
  hasTitleTemplate
    ? `
- **Placeholder Removal in Title:**  
  When forming the title string from the provided template, if any inferred attribute value is null, completely remove its corresponding placeholder token (e.g., @brand, @age) from the final title. Do not leave any extra spaces or tokens.  
  - **Example:**  
    If the title template is "@age @brand @design @style @category Size @size" and @age is null and @brand is null, the final title should be "@design @style @category Size @size" without extra spaces.
- **Do Not Substitute Placeholders:**  
  If a template is provided, do not replace any placeholder tokens with their actual values in the output JSON. The output title should preserve the tokens for non-null values and exclude tokens corresponding to null attributes.
`
    : ''
}
- Avoid common mistakes such as:
  - Confusing similar materials (e.g., cotton blend vs 100% cotton)
  - Misidentifying decades (note: Y2K items span 1999-2004)
  - Inaccurate pricing (vintage band t-shirts command higher prices)
- Spell out the sizes if they are letter sizes
- Make sure most of the values are filled out unless very uncertain about the fields. The more information, the better. This is also for templates
${hasTitleTemplate ? '' : '- Do not use @ symbols in the title when no template is provided'}
- Make sure the tags are chosen only from this list ${forInferenceTags} if the array is not empty

### Dynamic Attributes Instructions:
After determining the gender, category, and subcategory of the item, you must include relevant attributes from the following mapping:

For Menswear items, identify applicable attributes from this list based on the category/subcategory:
- T-Shirts: Sleeve length type, Age group, Neckline, Top length type, Clothing features
- Hoodies: Age group, Neckline, Top length type, Clothing features
- Sweaters: Age group, Neckline, Top length type, Clothing features (with variations for Cardigans, Crewneck, etc.)
- Shirts: Age group, Neckline, Top length type, Clothing features (with variations for Polo, Casual, etc.)
- Jeans: Age group, Fit, Waist rise, Pants length type, Clothing features (with variations for different fits)
- Outerwear: Sleeve length type, Age group, Neckline, Care instructions, Outerwear clothing features

For Womenswear items, identify applicable attributes from this list based on the category/subcategory:
- T-Shirts: Sleeve length type, Age group, Neckline, Top length type, Clothing features
- Hoodies: Activity, Neckline, Activewear clothing features
- Sweaters: Age group, Neckline, Top length type, Clothing features (with variations)
- Dresses: Sleeve length type, Age group, Neckline, Skirt/Dress length type, Clothing features, Dress occasion, Dress style
- Bottoms: Various attributes depending on type (skirts, jeans, leggings, etc.)

Include these applicable attributes in the "attributes" field of your JSON response. Important: each attribute should contain an array of values, even if there's only one value for that attribute.

### Attribute Options
When filling in attribute values, use the following standardized options:

- **Sleeve Length Type**: Short, Long, 3/4, Cap, Sleeveless, Spaghetti Strap, Strapless
- **Age Group**: Adults, All Ages, Babies, Kids, Newborn, Teens, Toddlers, Universal
- **Neckline**: Asymmetric, Bardot, Boat, Cowl, Crew, Halter, Hooded, Mandarin, Mock, Plunging, Round, Split, Square, Sweetheart, Turtle, V-Neck, Wrap
- **Top Length Type**: Bodysuit, Crop Top, Long, Medium
- **Clothing Features**: Hypoallergenic, Insulated, Moisture Wicking, Quick Drying, Reversible, Stretchable, UV Protection, Vegan Friendly, Water Resistant, Windproof, Wrinkle Resistant
- **Fit**: Boyfriend, Mom, Skinny Leg, Slim, Straight Leg, Tapered Leg, Wide
- **Waist Rise**: High, Low, Mid
- **Pants Length Type**: Above the Knee, Capri, Cropped, Footed, Knee, Long
- **Activewear Clothing Features**: Adjustable Waistband, Anti-Chafing Design, Anti-Static Properties, Body Contouring Fit, Breathable Design, Compression, Flatlock Seams, Four-Way Stretch, Hidden Pockets, High Visibility Accents, Mesh Panels, Moisture Wicking, Odor Resistant, Quick Drying, Reflective, Removable Padding, Seamless, Sweatproof Pockets, Temperature Regulation, Thumbholes, UV Protection, Vegan Friendly, Ventilation, Waterproof Coating
- **Care Instructions**: Dry Clean Only, Dryer Safe, Hand Wash, Ironing Instructions, Machine Washable, Tumble Dry
- **Outerwear Clothing Features**: Breathable Design, Hooded, Hypoallergenic, Insulated, Lightweight, Pockets, Quick Drying, Thermal, UV Protection, Waterproof, Windproof, Wrinkle Resistant
- **Skirt/Dress Length Type**: Knee, Maxi, Midi, Mini, Short
- **Dress Occasion**: Birthday, Casual, Dance, Everyday, Formal, Holiday, Party, Portrait, Religious Ceremony, School, Wedding
- **Dress Style**: A-Line, Babydoll, Blouson, Caftan, Drop Waist, Empire Waist, Flared, Gown, Jacket, Mermaid, Pencil, Peplum, Sheath, Shift, Shirt, Skater, Slip, Sweater, Tank, Trumpet, Wrap
- **Activity**: Aerobics, Aikido, Baseball, Basketball, Boxing, Climbing, Cycling, Dancing, Football, Golf, Gymnastics, Handball, Hockey, Running, Soccer, Tennis, Volleyball, Wrestling, Yoga

Include these applicable attributes in the "attributes" field of your JSON response. IMPORTANT: Each attribute must be an array of values, even if there's only one value. For example:

\`\`\`json
"attributes": {
  "sleeve_length_type": ["Short"],
  "age_group": ["Adult"],
  "clothing_features": ["Moisture Wicking", "Quick Drying", "Stretchable"]
}
\`\`\`

### Example JSON Output:
\`\`\`json
{
  "title": ${
    hasTitleTemplate
      ? '"@age @brand @design @style @category Size @size"'
      : '"Vintage 1990s Levi\'s 501 High-Waisted Denim Jeans / Grunge / Distressed / Streetwear Essential"'
  },
  "description": ${hasDescriptionTemplate ? '"Vintage Levi\'s 501 jeans from the 1990s, featuring a high-waisted, straight-leg cut.​"' : '"Vintage Carhartt Jacket features durable canvas, flannel lining, and original "Wayne Feeds" and "W. Tonner Farms" embroidery on the chest. With a faded look, ribbed trims, and a hood."'},
  "descriptionHtml": "<h2>Iconic 1990s Levi&#39;s 501 High-Waisted Denim Jeans</h2><p>A must-have for vintage and streetwear lovers, featuring classic distressed details for a grunge aesthetic.</p><ul><li><strong>Era &amp; Style:</strong> Authentic 1990s vintage with a grunge and streetwear edge.</li><li><strong>Brand &amp; Material:</strong> Made by Levi&#39;s, crafted from 100% cotton denim.</li></ul>",
  "price": 45.99,
  "color": {
    "primaryColor": ["navy"],
    "secondaryColor": null
  },
  "material": "Cotton",
  "size": "M",
  "category": "Tops",
  "subcategory": "Polo",
  "condition": "new_with_tags",
  "condition_notes": null,
  "brand": "Polo Ralph Lauren",
  "gender": "Menswear",
  "tags": ${
    tags?.length
      ? `[${forInferenceTags.map((tag) => `"${tag}"`).join(', ')}]`
      : '["Toronto Blue Jays", "Blue-Jays", "Blue Jays", "Baseball", "Jersey", "graphic tee", "vintage sportswear", "retro", "collectible", "cotton", "crewneck", "short sleeve", "blue"]'
  }
  "age": "1990s",
  "item_style": "Smart",
  "design": "minimalist",
  "made_in": "USA",
  "source": ["Vintage"],
  "fit_type": "slim",
  "design": "Single Stitch",
  "closure_type": "buttons",
  "attributes": {
    "sleeve_length_type": "Short sleeve",
    "age_group": "Adult",
    "neckline": "Polo collar",
    "top_length_type": "Regular",
    "clothing_features": "Logo embroidery"
  }
}
\`\`\`
${hasTitleTemplate ? 'Ensure that all placeholders remain intact during analysis. DO NOT REPLACE THE PLACEHOLDERS WITH ACTUAL VALUES; however, when outputting the final title, any placeholder corresponding to a null value must be completely removed from the title string.' : ''}
`;

  // Create the message structure
  return [
    {
      role: 'system',
      content:
        'You are an advanced clothing analysis assistant. Your role is to analyze clothing images step-by-step and produce detailed JSON output.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: baseInstructions,
        },
        ...imageUrls.map((url) => ({
          type: 'image_url' as const,
          image_url: { url },
        })),
      ],
    },
  ];
}

/**
 * Create function for three-image messages
 * This is a direct replacement for the original createThreeImageMessages function
 */
export function createThreeImageMessages(
  imageUrls: string[],
  titleTemplate?: string,
  descriptionTemplate?: string,
  exampleDescription?: string,
  tags?: string[],
): OpenAI.Chat.ChatCompletionMessageParam[] {
  // Create template config from parameters
  const templateConfig: TemplateConfig = {
    title: titleTemplate ? { id: 'title', name: 'Title Template', content: titleTemplate } : null,
    description: descriptionTemplate ? { id: 'description', name: 'Description Template', content: descriptionTemplate } : null,
    exampleDescription: exampleDescription || null,
    attributes: {},
  };
  return createImageAnalysisMessages(imageUrls, templateConfig, tags);
}

/**
 * Enhanced ProductClassifier class
 */
export class ProductClassifier {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async getRagContext(imageUrl: string): Promise<string> {
    try {
      // Make API call to your vector database backend
      const response = await fetch(`http://68.183.204.156:8882/api/rag/process_multimodal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          limit: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch RAG context');
      }
      const data = await response.json();
      const result = JSON.stringify(data.products) || '';
      console.log('This is the result: ', result);
      return result;
    } catch (error) {
      console.error('Error fetching RAG context:', error);
      return '';
    }
  }

  async classifyThreeImages(
    imageUrls: string[],
    titleTemplate?: string,
    descriptionTemplate?: string,
    exampleDescription?: string,
    tags?: string[],
  ): Promise<ProductResponse> {
    // Log that attribute options are loaded
    console.log('Attribute options loaded for classification');

    // Get messages using new template system
    const messages = createThreeImageMessages(imageUrls, titleTemplate, descriptionTemplate, exampleDescription, tags);

    // Get relevant context from vector database
    const relevantContext = await this.getRagContext(imageUrls[0]);
    // Add context to the messages if available
    if (relevantContext) {
      messages.push({
        role: 'system',
        content: `Here is some relevant context about similar products:\n${relevantContext}\nUse this context to help classify the product more accurately.`,
      });
    }

    let response: ChatCompletion;
    try {
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0,
      });
    } catch (error) {
      console.error('Error during AI inference:', error);
      throw new Error('Failed to classify product');
    }

    const rawJson = response.choices[0].message?.content?.replace(/```json\n?|```/g, '').trim();

    if (!rawJson) {
      throw new Error('No valid JSON received from the model.');
    }

    console.log('== Raw JSON ==\n', rawJson);
    const parsedContent = JSON.parse(rawJson);

    // Before validation, ensure that attributes are added if they don't exist
    if (!parsedContent.attributes && parsedContent.gender && parsedContent.category) {
      // Get the relevant attributes for this product type
      const attributesList = getAttributesForProduct(parsedContent.gender, parsedContent.category, parsedContent.subcategory);

      // Initialize attributes object if needed
      if (attributesList.length > 0 && !parsedContent.attributes) {
        parsedContent.attributes = {};
        // Initialize with empty arrays
        attributesList.forEach((attr) => {
          parsedContent.attributes[attr] = [];
        });
      }
    }

    // Convert string values to arrays if needed
    if (parsedContent.attributes) {
      Object.entries(parsedContent.attributes).forEach(([attributeName, value]) => {
        // If the value is a string, convert it to an array
        if (typeof value === 'string') {
          parsedContent.attributes[attributeName] = [value];
        }
        // If the value is null, convert to empty array
        else if (value === null) {
          parsedContent.attributes[attributeName] = [];
        }
      });
    }

    // Validate attribute values against the allowed options
    if (parsedContent.attributes) {
      Object.entries(parsedContent.attributes).forEach(([attributeName, values]) => {
        if (Array.isArray(values) && values.length > 0) {
          const options = getAttributeOptions(attributeName);

          // Filter out invalid values
          if (options.length > 0) {
            const validValues = values.filter((value) =>
              // Either the value matches a known option or we keep it if no options are defined
              options.some((option) => option.displayName.toLowerCase() === value.toLowerCase()),
            );

            if (validValues.length !== values.length) {
              console.warn(`Invalid attribute values found for ${attributeName}`);
              parsedContent.attributes[attributeName] = validValues.length > 0 ? validValues : [];
            }
          }
        }
      });
    }

    const priceSuggestion = await getPriceSuggestions(parsedContent.title);
    if (priceSuggestion) {
      parsedContent.price = priceSuggestion;
    }

    // Ensure tags is an array
    if (!Array.isArray(parsedContent.tags)) {
      if (typeof parsedContent.tags === 'string') {
        parsedContent.tags = parsedContent.tags.split(',').map((t: string) => t.trim());
      } else {
        parsedContent.tags = [];
      }
    }

    // Fallback default size to 'M' if unrecognized or missing
    if (typeof parsedContent.size !== 'string' || !productSizes.includes(parsedContent.size)) {
      console.warn(`Size '${parsedContent.size}' not recognized, setting to default 'M'`);
      parsedContent.size = 'M';
    }

    return ProductResponseSchema.parse(parsedContent);
  }

  async inferMissingProductDetails(imageUrls: string[], product: Partial<Product>, tags?: string[]): Promise<ProductResponse> {
    const ProductColorsList = Object.values(ProductColors).join(', ');
    const ProductMaterialsList = Object.values(Material).join(', ');
    const ProductSizesList = productSizes.join(', ');
    const ProductConditionsList = Object.values(ProductCondition).join(', ');
    const ProductSourceList = Object.values(ProductSource).join(', ');
    const CategoryHierarchy = Category.formatCategoryHierarchy();

    const forInferenceTags = tags || [];

    const tagInstructions = tags?.length
      ? `
      Use ONLY these predefined tags: ${forInferenceTags.join(', ')}.
      - **Predefined Tags Provided:** Use ONLY the following tags as they are highly optimized and context-specific.
      - **Avoid Generating New Tags:** Since tags are predefined, do not generate or infer new tags.
      - **Maintain Tag Consistency:** Ensure tags reflect the product’s key attributes, such as brand, team, material, and era.
      - **DO NOT USE ANY EXTERNAL TAGS:** Do not use any external tags or keywords that are not part of the provided list.
      `
      : `
      - Make the first few tags the most relevant and context-specific.
      - **Brand/Team:** Prioritize official brands, team names, and associations. Example: Toronto Blue Jays, Levi's, Nike.
      - **Alternate Spellings & Variations:** Use variations and alternate spellings to capture a broader audience. Example: "Blue Jays," "Blue-Jays," "BlueJays."
      - **Product Type/Category:** Include item descriptors like "graphic tee," "vintage jacket," "denim jeans."
      - **Style and Material:** Include terms that describe the style, era, and material (e.g., "Y2K," "cotton," "streetwear"). Include synonyms for style descriptors.
      - **Relevant Trends & Aesthetics:** Capture keywords reflecting popular trends or aesthetics (e.g., "minimalist," "oversized," "retro").
      - **Condition/Source:** Include relevant terms to indicate product condition and origin (e.g., "deadstock," "preloved," "reworked").
      - **Limit to 13 Tags:** Generate **13 highly relevant tags** that cover a range of potential buyer search terms.
      `;

    const instructions = `
    Your goal is to extract properties from the images and the title and description to return a JSON object

    Extract the following Attributes and their potential options:
    - **Title**
    - **Description**
    - **DescriptionHtml**
    - **Price:** Estimated price as a number (e.g., 25.99), considering condition, brand, and trend.
    - **Condition** (from: ${ProductConditionsList})
    - **Color** (from: ${ProductColorsList})
      - **Primary Color**
      - **Secondary Color**
    - **Material:** Primary material (from: ${ProductMaterialsList})
    - **Size:** Must match one of the options: ${ProductSizesList} (if possible, provide waist size only)
    - **Gender:** Choose "Menswear" or "Womenswear" (default to "Menswear" for unisex items).
    - **Category:** Determined category (e.g., "Tops")
    - **Subcategory:** Determined subcategory (e.g., "T-Shirts")
      - **Identify Category and Subcategory:** Use the following hierarchy:
        ${CategoryHierarchy}
    - **Brand:** Visible brand name, if present
    - **Tags:** Generate 13 SEO-friendly, relevant tags, with the following instructions: ${tagInstructions}
    - **Age:** Inferred age (e.g., "1990s"); use only if you are at least 50% certain, otherwise set as null.
    - **Style:** Overall style (e.g., "vintage")
    - **Design:** Notable design elements (e.g., "flannel", "minimalist")
    - **Fit Type:** Clothing fit (e.g., "slim", "regular", "loose")
    - **Closure Type:** Type of closure (e.g., "buttons", "zippers", "hooks"). If none, leave as null.
    - **Made In:** Country of manufacture (e.g., "USA", "China")
    - **Source:** List of two sources max. (e.g., "Vintage", "New"): Choose from: ${ProductSourceList}
    - **Condition Notes:** Specific details regarding the condition that would be essential for the buyer to know.
    - **Attributes:** After determining gender, category, and subcategory, include specific attributes relevant to the item. Each attribute should be an array of one or more values (even if there's only one value, it should be in an array).
      ### Attribute Options
        When filling in attribute values, use the following standardized options:
        - **Sleeve Length Type**: Short, Long, 3/4, Cap, Sleeveless, Spaghetti Strap, Strapless
        - **Age Group**: Adults, All Ages, Babies, Kids, Newborn, Teens, Toddlers, Universal
        - **Neckline**: Asymmetric, Bardot, Boat, Cowl, Crew, Halter, Hooded, Mandarin, Mock, Plunging, Round, Split, Square, Sweetheart, Turtle, V-Neck, Wrap
        - **Top Length Type**: Bodysuit, Crop Top, Long, Medium
        - **Clothing Features**: Hypoallergenic, Insulated, Moisture Wicking, Quick Drying, Reversible, Stretchable, UV Protection, Vegan Friendly, Water Resistant, Windproof, Wrinkle Resistant
        - **Fit**: Boyfriend, Mom, Skinny Leg, Slim, Straight Leg, Tapered Leg, Wide
        - **Waist Rise**: High, Low, Mid
        - **Pants Length Type**: Above the Knee, Capri, Cropped, Footed, Knee, Long
        - **Activewear Clothing Features**: Adjustable Waistband, Anti-Chafing Design, Anti-Static Properties, Body Contouring Fit, Breathable Design, Compression, Flatlock Seams, Four-Way Stretch, Hidden Pockets, High Visibility Accents, Mesh Panels, Moisture Wicking, Odor Resistant, Quick Drying, Reflective, Removable Padding, Seamless, Sweatproof Pockets, Temperature Regulation, Thumbholes, UV Protection, Vegan Friendly, Ventilation, Waterproof Coating
        - **Care Instructions**: Dry Clean Only, Dryer Safe, Hand Wash, Ironing Instructions, Machine Washable, Tumble Dry
        - **Outerwear Clothing Features**: Breathable Design, Hooded, Hypoallergenic, Insulated, Lightweight, Pockets, Quick Drying, Thermal, UV Protection, Waterproof, Windproof, Wrinkle Resistant
        - **Skirt/Dress Length Type**: Knee, Maxi, Midi, Mini, Short
        - **Dress Occasion**: Birthday, Casual, Dance, Everyday, Formal, Holiday, Party, Portrait, Religious Ceremony, School, Wedding
        - **Dress Style**: A-Line, Babydoll, Blouson, Caftan, Drop Waist, Empire Waist, Flared, Gown, Jacket, Mermaid, Pencil, Peplum, Sheath, Shift, Shirt, Skater, Slip, Sweater, Tank, Trumpet, Wrap
        - **Activity**: Aerobics, Aikido, Baseball, Basketball, Boxing, Climbing, Cycling, Dancing, Football, Golf, Gymnastics, Handball, Hockey, Running, Soccer, Tennis, Volleyball, Wrestling, Yoga
    
    # Workflow

    ## High-Level Strategy
    ### 1. Extract Properties from Title and Description
    ### 2. Extract Properties from Images 
      - For each image, perform the following:
        - Look for visible logos, brand marks, or tags that can help infer brand or authenticity.
        - Examine fabric texture, patterns, and colors to infer material and color attributes.
        - Analyze garment construction details, such as stitching, hardware (buttons, zippers), and unique design elements.
        - Identify any text, labels, or markings in the images that provide product details (e.g., size labels, “Made in” tags, care instructions).
        - Use visual cues to infer style, era (e.g., Y2K, 90s), and fit type.
        - Compare multiple images to ensure consistency and avoid missing details.
    
    ### 3. Compare Properties
      - Cross-check all extracted details from the title, description, and images.
      - If a detail is present in both the text and images, ensure they are consistent. If there is a conflict, defer to the existing product field; otherwise, use the most reliable source (prefer explicit image evidence over ambiguous text).
      - For ambiguous or missing fields, use your best judgment based on all available context, but leave fields as null if you are not at least 50% certain.

    ## Additional Guidelines
      - **Be concise and accurate:** Avoid verbose, promotional, speculative language in title and description.
      - **Respect special rules:** For example, always classify “Vests” under “Tops” (not “Outerwear”).
      - **Follow the provided attribute options strictly:** Do not invent new categories, attributes, or tags.
      - **Prioritize user-provided data:** Only supplement missing information; never override or contradict existing data.

    # Example JSON Output:
    \`\`\`json
    {
      "title": "Vintage 1990s Levi\'s 501 High-Waisted Denim Jeans / Grunge / Distressed / Streetwear Essential",
      "description": "Vintage Levi\'s 501 jeans from the 1990s, featuring a high-waisted, straight-leg cut.​",
      "descriptionHtml": "<h2>Iconic 1990s Levi&#39;s 501 High-Waisted Denim Jeans</h2><p>A must-have for vintage and streetwear lovers, featuring classic distressed details for a grunge aesthetic.</p><ul><li><strong>Era &amp; Style:</strong> Authentic 1990s vintage with a grunge and streetwear edge.</li><li><strong>Brand &amp; Material:</strong> Made by Levi&#39;s, crafted from 100% cotton denim.</li></ul>",
      "price": 45.99,
      "color": {
        "primaryColor": ["navy"],
        "secondaryColor": null
      },
      "material": "Cotton",
      "size": "M",
      "category": "Tops",
      "subcategory": "Polo",
      "condition": "new_with_tags",
      "condition_notes": null,
      "brand": "Polo Ralph Lauren",
      "gender": "Menswear",
      "tags": ${
        tags?.length
          ? `[${forInferenceTags.map((tag) => `"${tag}"`).join(', ')}]`
          : '["Toronto Blue Jays", "Blue-Jays", "Blue Jays", "Baseball", "Jersey", "graphic tee", "vintage sportswear", "retro", "collectible", "cotton", "crewneck", "short sleeve", "blue"]'
      }
      "age": "1990s",
      "item_style": "Smart",
      "design": "minimalist",
      "made_in": "USA",
      "source": ["Vintage"],
      "fit_type": "slim",
      "design": "Single Stitch",
      "closure_type": "buttons",
      "attributes": {
        "sleeve_length_type": "Short sleeve",
        "age_group": "Adult",
        "neckline": "Polo collar",
        "top_length_type": "Regular",
        "clothing_features": "Logo embroidery"
      }
    }
    \`\`\`
    
    # Context 
    ## 1. Images to analyze
      - Front: ${imageUrls[0]}
      - Back: ${imageUrls[1]}
      - Detail: ${imageUrls[2]}
      - Title: ${product.title}
      - Description: ${product.description}
    ## 2. Partial Product
      ${JSON.stringify(product)} 

    First, think carefully step by step about what you can infer from the images, then examine through the Product class particularly the title and description to infer properties. Then return a JSON object with all the required properties.
    `;

    let response: ChatCompletion;
    try {
      response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Your goal is to extract properties from the images and the title and description to return a JSON object.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: instructions,
              },
              ...imageUrls.map((url) => ({
                type: 'image_url' as const,
                image_url: { url },
              })),
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0,
      });
    } catch (error) {
      console.error('Error during AI inference:', error);
      throw new Error('Failed to classify product');
    }

    const rawJson = response.choices[0].message?.content?.replace(/```json\n?|```/g, '').trim();

    if (!rawJson) {
      throw new Error('No valid JSON received from the model.');
    }

    console.log('== Raw JSON ==\n', rawJson);
    const parsedContent = JSON.parse(rawJson);

    // Create a merged product with inferred fields, prioritizing existing values
    const mergedProduct = {
      ...parsedContent, // First add all inferred fields
      ...product, // Then override with any existing fields from the original product
    };

    // Ensure tags is an array
    if (!Array.isArray(mergedProduct.tags)) {
      if (typeof mergedProduct.tags === 'string') {
        mergedProduct.tags = mergedProduct.tags.split(',').map((t: string) => t.trim());
      } else {
        mergedProduct.tags = [];
      }
    }

    // Add color information
    mergedProduct.color = {
      primaryColor: parsedContent?.color?.primaryColor || [],
      secondaryColor: parsedContent?.color?.secondaryColor || [],
    };

    if (product.brand && product.brand === 'source-unknown') {
      mergedProduct.brand = parsedContent?.brand || product.brand;
    }

    return ProductResponseSchema.parse(mergedProduct);
  }
}

/**
 * Generate a unique ID for templates
 */
export function generateUniqueId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a template
 */
export function createTemplate(name: string, content: string): Template {
  return {
    id: generateUniqueId(),
    name,
    content,
  };
}

/**
 * Save template configuration to storage
 */
export function saveTemplateConfig(config: TemplateConfig): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('templateConfig', JSON.stringify(config));
  }
}

/**
 * Load template configuration from storage
 */
export function loadTemplateConfig(): TemplateConfig {
  if (typeof localStorage !== 'undefined') {
    const savedConfig = localStorage.getItem('templateConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig) as TemplateConfig;
      } catch (e) {
        console.error('Error parsing saved template config:', e);
      }
    }
  }
  return {
    title: null,
    description: null,
    exampleDescription: null,
    attributes: {},
  };
}

/**
 * Main entry point function that can be directly substituted for the original
 */
export async function main(
  imageUrls: string[],
  titleTemplate?: string,
  descriptionTemplate?: string,
  exampleDescription?: string,
  tags?: string[],
): Promise<ProductResponse> {
  console.log('== Clothing Analysis using OpenAI ==');
  const classifier = new ProductClassifier();

  const result = await classifier.classifyThreeImages(imageUrls, titleTemplate, descriptionTemplate, exampleDescription, tags);

  console.log('AI model returned:', result);
  return result;
}

export default main;
