import 'dotenv/config';
import { z } from 'zod';
import OpenAI from 'openai';
import { Gender, ProductColors, ProductCondition, Material, ProductSource } from '../utils/products.enums';
import { Category } from '../utils/product/category';
import { productSizes } from '../utils/product/size';

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

export interface TemplateSettings {
  mode?: 'strict' | 'hybrid' | 'ai';
  excludedTerms?: string[];
  positionRules?: { 
    noTermsAtStart: string[]; 
    noTermsAtEnd: string[] 
  };
  structurePreset?: 'custom' | 'brand_first' | 'product_type_first' | 'keywords_first' | 'keywords_last';
  keywordFormat?: 'comma' | 'pipe' | 'sentence' | 'hashtags';
  aiRewriteLevel?: number;
  freeTextDescription?: string;
  fallbackBehavior?: string;
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
    // For listed_size, if it fails (e.g. receives "W36 L32") then fallback to null.
    listed_size: z
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
    measurements: z.union([
      // Option 1: An array of Measurement objects
      z.array(MeasurementSchema),
      
      // Option 2: A record where the key is a category and the value is an array of Measurement objects (MeasurementsByCategory)
      z.record(z.string(), z.array(MeasurementSchema)),
      
      // Option 3: Allow null/undefined with a fallback
      z.null()
    ]).nullable().catch(null),
  })
  .refine((data) => !data.subcategory || Category.validate(data.gender, data.category, data.subcategory), {
    message: 'Invalid category/subcategory combination for gender.',
    path: ['product_subcategory'],
  });

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

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

/**
 * Process a description template with a descriptive sentence
 */
export function processDescriptionTemplate(template: string, descriptiveSentence: string): string {
  if (!template) return descriptiveSentence;
  
  // Replace the @descriptive_sentence placeholder
  let processedTemplate = template.replace('@descriptive_sentence', descriptiveSentence);
  
  // Replace any other placeholders marked in the UI
  const templateAttrs = [
    'Source', 'Age', 'Sub Category', 'Category', 'Brand', 'Fit', 'Made in', 
    'Material', 'Size', 'Style', 'Gender', 'Closure Type', 'Condition', 
    'Condition Notes', 'Primary Color', 'Secondary Color', 'Measurements'
  ];
  
  // Create a map for case-insensitive replacement
  const placeholderMap: Record<string, string> = {};
  templateAttrs.forEach(attr => {
    placeholderMap[attr.toLowerCase().replace(/\s+/g, '')] = '';
  });
  
  // Replace all placeholders in the template
  const regex = /@(\w+)/g;
  let match;
  
  while ((match = regex.exec(processedTemplate)) !== null) {
    const placeholder = match[1].toLowerCase();
    if (placeholderMap.hasOwnProperty(placeholder)) {
      processedTemplate = processedTemplate.replace(
        new RegExp(`@${match[1]}`, 'g'), 
        ''
      );
    }
  }
  
  // Clean up extra whitespace
  return processedTemplate
    .replace(/\s+/g, ' ')
    .trim();
}

export function createImageAnalysisMessages(
  imageUrls: string[],
  templateConfig: TemplateConfig,
  templateSettings: TemplateSettings,
  tags?: string[]
): OpenAI.Chat.ChatCompletionMessageParam[] {
  const ProductColorsList = Object.values(ProductColors).join(', ');
  const ProductMaterialsList = Object.values(Material).join(', ');
  const ProductSizesList = productSizes.join(', ');
  const ProductConditionsList = Object.values(ProductCondition).join(', ');
  const ProductSourceList = Object.values(ProductSource).join(', ');
  const CategoryHierarchy = Category.formatCategoryHierarchy();

  const forInferenceTags = tags || [];

  // Get template mode and settings
  const {
    mode = 'hybrid', 
    excludedTerms = [],
    positionRules = { noTermsAtStart: [], noTermsAtEnd: [] },
    structurePreset = 'custom',
    keywordFormat = 'comma',
    aiRewriteLevel = 50,
    freeTextDescription = '',
    fallbackBehavior = 'template_only'
  } = templateSettings || {};

  // Create title instructions based on template mode
  const titleTemplate = templateConfig.title?.content || '';
  let titleInstruction = '';
  
  switch (mode) {
    case 'strict':
      titleInstruction = titleTemplate
        ? `STRICT MODE: Use exactly this title template: "${titleTemplate}". Replace placeholders with values but preserve the exact structure and order. Never modify the template structure itself.`
        : `Compose a descriptive title based on the item's attributes.`;
      break;
      
    case 'ai':
      titleInstruction = `AI-DRIVEN MODE (Level: ${aiRewriteLevel}%): ${titleTemplate 
        ? `Use this template as inspiration: "${titleTemplate}", but optimize freely for SEO and readability.` 
        : `Create an optimized title that highlights the most marketable features of this item.`}
        ${freeTextDescription ? `Follow this guidance: "${freeTextDescription}"` : ''}`;
      break;
      
    case 'hybrid':
    default:
      titleInstruction = titleTemplate
        ? `HYBRID MODE: Use this template: "${titleTemplate}". Text inside [[double brackets]] must remain exactly as written. Other placeholders can be optimized while maintaining their semantic meaning. AI influence level: ${aiRewriteLevel}%.`
        : `Compose a title that balances structure with natural language flow.`;
  }

  // Add structure preset instructions
  if (structurePreset !== 'custom' && mode !== 'strict') {
    switch (structurePreset) {
      case 'brand_first':
        titleInstruction += ` Structure the title with the brand name first, followed by other attributes.`;
        break;
      case 'product_type_first':
        titleInstruction += ` Start the title with the product type/subcategory, followed by other attributes.`;
        break;
      case 'keywords_first':
        titleInstruction += ` Place important keywords at the beginning of the title for better visibility.`;
        break;
      case 'keywords_last':
        titleInstruction += ` Place important keywords at the end of the title.`;
        break;
    }
  }

  // Add excluded terms instructions
  if (excludedTerms.length > 0) {
    titleInstruction += ` NEVER include these terms in the title: ${excludedTerms.join(', ')}.`;
    
    // Add position rules
    if (positionRules.noTermsAtStart.length > 0) {
      titleInstruction += ` Don't start the title with: ${positionRules.noTermsAtStart.join(', ')}.`;
    }
    if (positionRules.noTermsAtEnd.length > 0) {
      titleInstruction += ` Don't end the title with: ${positionRules.noTermsAtEnd.join(', ')}.`;
    }
  }

  // Create description instructions based on template mode
  const descriptionTemplate = templateConfig.description?.content || '';
  const exampleDescription = templateConfig.exampleDescription || '';
  
  let descriptionInstruction = '';
  
  switch (mode) {
    case 'strict':
      if (descriptionTemplate) {
        descriptionInstruction = `STRICT MODE: Use exactly this description template: "${descriptionTemplate}". Replace @descriptive_sentence with a single informative sentence that captures the item's key features. Do not modify the template structure.`;
      } else {
        descriptionInstruction = `Create a structured description with a concise summary and bullet points for details.`;
      }
      break;
      
    case 'ai':
      descriptionInstruction = `AI-DRIVEN MODE (Level: ${aiRewriteLevel}%): ${descriptionTemplate 
        ? `Use this template as a starting point: "${descriptionTemplate}", but optimize freely for conversion and SEO.` 
        : `Create a compelling, SEO-optimized description that highlights the most appealing aspects of this item.`}
        ${freeTextDescription ? `Follow this guidance: "${freeTextDescription}"` : ''}`;
      break;
      
    case 'hybrid':
    default:
      if (descriptionTemplate) {
        descriptionInstruction = `HYBRID MODE: Use this template: "${descriptionTemplate}". Text inside [[double brackets]] must remain exactly as written. Replace @descriptive_sentence with a compelling sentence that captures the item's essence. AI influence level: ${aiRewriteLevel}%.`;
      } else {
        descriptionInstruction = `Create a description that balances structure with natural language flow. Start with a compelling overview sentence, then include key details in bullet points.`;
      }
  }

  // Add keyword formatting instructions
  if (mode !== 'strict' && descriptionTemplate) {
    switch (keywordFormat) {
      case 'comma':
        descriptionInstruction += ` Format any keyword lists as comma-separated values (e.g., "vintage, retro, classic").`;
        break;
      case 'pipe':
        descriptionInstruction += ` Format any keyword lists with pipe separators (e.g., "vintage | retro | classic").`;
        break;
      case 'sentence':
        descriptionInstruction += ` Format any keyword lists in sentence style without separators (e.g., "vintage retro classic").`;
        break;
      case 'hashtags':
        descriptionInstruction += ` Format any keyword lists as hashtags (e.g., "#vintage #retro #classic").`;
        break;
    }
  }

  if (exampleDescription) {
    descriptionInstruction += `\n\nReference this example for tone and style: "${exampleDescription}"`;
  }

  // Define title formatting details
  const titleFormat = titleTemplate
    ? `
${titleTemplate}
- Age: If inferable (e.g., 1970s, 1980s, 1990s, 2000s, 2010s)
- Source: Limited options: Vintage, Preloved, Reworked, Deadstock, Designer
- Style: Specific style (e.g., Heavy Metal, FC Barcelona, Streetwear)
- Design: Details like Single Stitch, Double Stitch, Overlock, Bartack, Screen Print, Embroidery
- Made In: Include only if 95% certain and if from North America/Europe
- Material: Primary material (from: ${ProductMaterialsList})
- Color: Primary color(s) (from: ${ProductColorsList})
- Size: Limited Options (do not provide anything but the following): ${ProductSizesList} 

IMPORTANT: If ANY inferred placeholder is null and it is a PLACEHOLDER, it shouldn't show up in the title template that you return, and you should leave it out.
 - For example: if the format is "@age @brand" and your inferred age is null, the returned title should just be "@brand" and "@age" should be left out.
 - For text inside [[double brackets]], always preserve it exactly as written, never remove it.
`
    : `
- Vintage [age/decade] [brand/text] / [subcategory] / [fit type/design] / [style descriptor 1] [/ [style descriptor 2]]
  - Example 1: "Vintage 1990s Martinique carribean / Vacation Crewneck Sweatshirt"
  - Example 2: "Vintage 2000s Plaid Button Up / Colourful / Flannel / Shirt"
  - Example 3: "Vintage 1990s Levi Strauss 501 Red Tab Button Fly Denim Jeans / Made in USA / American Vintage / Workwear / Streetwear"
- Style: Aesthetic style (e.g. Football, Metal, Streetwear, etc.)
- Age: Inferred era if possible, if not 99% sure, do not give an age.
- Color: Dominant color(s) (from: ${ProductColorsList})
- Material: Primary material (from: ${ProductMaterialsList})
- Subcategory: Item type based on provided hierarchy
- Design: Notable patterns or details
- Fit Type: Clothing fit (e.g., slim, regular, loose)
- Size: Use only provided options (${ProductSizesList}); if applicable, provide waist size only.
`;

  return [
    {
      role: 'system',
      content:
        'You are an advanced clothing analysis assistant specializing in template-based product listings. You analyze images and produce detailed JSON output that follows template settings precisely.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
Analyze the clothing item from the following images and provide JSON with detailed attributes following the specified template mode: ${mode.toUpperCase()}.

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
    - **Title**: ${titleInstruction}
      ${titleFormat}
   - **Description**: ${descriptionInstruction}
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
   - **Tags:** generate 13 SEO-friendly, relevant tags (e.g., "casual", "vintage"). Use only these tags if this array is not empty: ${forInferenceTags}.
   - **Age:** Inferred age (e.g., "1990s"); use only if you are 95% certain, otherwise set as null.
   - **Style:** Overall style (e.g., "vintage")
   - **Design:** Notable design elements (e.g., "flannel", "minimalist")
   - **Fit Type:** Clothing fit (e.g., "slim", "regular", "loose")
   - **Closure Type:** Type of closure (e.g., "buttons", "zippers", "hooks")
   - **Made In:** Country of manufacture (e.g., "USA", "China")
   - **Source:** List of two sources max. (e.g., "Vintage", "New"): Choose from: ${ProductSourceList}
   - **Condition Notes:** Specific details regarding the condition that would be essential for the buyer to know.
   - **Measurements:** Any visible or relevant measurements (e.g., chest, length, sleeve, etc.)

### Template Mode Specific Instructions:
${mode === 'strict' 
  ? '- STRICT MODE: Follow templates exactly, preserving all structure and placeholders.\n- Replace placeholders with values but never change the structure.\n- If a template includes [[fixed text]], preserve it exactly.\n- If a value is null, remove its placeholder entirely.'
  : mode === 'ai'
  ? '- AI-DRIVEN MODE: Use templates as guidance but optimize freely for SEO and conversion.\n- Balance the provided template with creativity based on the AI rewrite level.\n- Focus on creating compelling, high-converting content.\n- Use the free text description as guidance for tone and style.'
  : '- HYBRID MODE: Balance structure with optimization.\n- Preserve [[fixed text]] exactly as written.\n- Optimize other parts of the template while maintaining semantic meaning.\n- Apply the specified AI rewrite level, keyword format, and structure preferences.'
}

### Fallback Behavior:
If you encounter difficulty generating content that matches the template requirements, follow this fallback behavior: ${fallbackBehavior.replace(/_/g, ' ')}.

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
- If a custom description template is provided, return only the sentence that should be inserted for @descriptive_sentence in the final JSON.
- Otherwise, produce the full description as per the default instructions.

### IMPORTANT:
- **Placeholder Removal in Title:**  
  When forming the title string from the provided template, if any inferred attribute value is null, completely remove its corresponding placeholder token (e.g., @brand, @age) from the final title. Do not leave any extra spaces or tokens.  
  - **Example:**  
    If the title template is "@age @brand @design @style @category Size @size" and @age is null and @brand is null, the final title should be "@design @style @category Size @size" without extra spaces.
- **Fixed Text Preservation:**
  Any text enclosed in [[double brackets]] should be preserved exactly as written, regardless of template mode.
- **Do Not Substitute Placeholders:**  
  If a template is provided, do not replace any placeholder tokens with their actual values in the output JSON. The output title should preserve the tokens for non-null values and exclude tokens corresponding to null attributes.
- **Keyword Formatting:**
  Format any keyword lists according to the specified format: ${keywordFormat.replace(/_/g, ' ')}.
- **Structure Preference:**
  Follow the structure preset preference: ${structurePreset.replace(/_/g, ' ')}.
- **Excluded Terms:**
  Never include these terms in the title or at the specified positions: ${excludedTerms.join(', ')}.
- Avoid common mistakes such as:
  - Confusing similar materials (e.g., cotton blend vs 100% cotton)
  - Misidentifying decades (note: Y2K items span 1999-2004)
  - Inaccurate pricing (vintage band t-shirts command higher prices)
- Spell out the sizes if they are letter sizes
- Make sure most of the values are filled out unless very uncertain about the fields. The more information, the better. This is also for templates
- If the title template is empty, do not return template options with @ symbols
- If the option "@descriptive_sentence" is provided in the description template, replace it with the actual descriptive sentence. THIS IS MANDATORY
- Make sure the tags are chosen only from this list ${forInferenceTags} if the array is not empty

---
Common mistakes to avoid:
- Confusing similar materials (e.g., cotton blend vs 100% cotton)
- Misidentifying decades (note: Y2K items are 1999-2004)
- Inaccurate pricing (vintage band t-shirts command higher prices)
- IF THE TITLE TEMPLATE IS EMPTY DO NOT RETURN TEMPLATE OPTIONS WITH @ symbols

### Example JSON Output - ONLY if template isn't provided:
\`\`\`json
{
  "title": "Vintage 1990s Levi's 501 High-Waisted Denim Jeans / Grunge / Distressed / Streetwear Essential",
  "description": "Iconic 1990s Levi's 501 high-waisted denim jeans, a must-have for vintage and streetwear lovers, featuring classic distressed details for an effortlessly grunge aesthetic. - Era & Style: Authentic 1990s vintage with a grunge and streetwear edge. - Brand & Material: Made by Levi's, crafted from 100% durable cotton denim. - Fit & Features: High-waisted, straight-leg fit with a relaxed, lived-in feel; features natural fading, distressed accents, and the signature button fly. - Ideal Use Cases: Perfect for pairing with oversized band tees, chunky boots, or layering with a flannel for a true 90s grunge vibe.",
  "descriptionHtml": "<h2>Iconic 1990s Levi&#39;s 501 High-Waisted Denim Jeans</h2><p>A must-have for vintage and streetwear lovers, featuring classic distressed details for an effortlessly grunge aesthetic.</p><ul><li><strong>Era &amp; Style:</strong> Authentic 1990s vintage with a grunge and streetwear edge.</li><li><strong>Brand &amp; Material:</strong> Made by Levi&#39;s, crafted from 100% durable cotton denim.</li><li><strong>Fit &amp; Features:</strong> High-waisted, straight-leg fit with a relaxed, lived-in feel; features natural fading, distressed accents, and the signature button fly.</li><li><strong>Ideal Use Cases:</strong> Perfect for pairing with oversized band tees, chunky boots, or layering with a flannel for a true 90s grunge vibe.</li></ul>",
  "price": 45.99,
  "color": {
    "primaryColor": ["navy"],
    "secondaryColor": null
  },
  "material": "cotton",
  "listed_size": "M",
  "category": "Tops",
  "subcategory": "Polo",
  "condition": "new_with_tags",
  "condition_notes": null,
  "brand": "Polo Ralph Lauren",
  "gender": "Menswear",
  "tags": ["90s", "denim", "streetwear", "levi's denim", "levi's pants", "levi's distressed", "levi's", "vintage levi's", "blue jeans"  /* up to 13 tags */],
  "age": "1990s",
  "item_style": "Smart",
  "design": "minimalist",
  "made_in": "USA",
  "source": ["Vintage"],
  "fit_type": "slim",
  "design": "Single Stitch",
  "closure_type": "buttons",
  "measurements": [
    {
      id: "chest",
      label: "Chest/Bust",
      custom: "",
      value: 54,
      unit: "cm"
    },
    {
      id: "length",
      label: "Length",
      custom: "Back Length",
      value: 68,
      unit: "cm"
    },
    {
      id: "sleeve",
      label: "Sleeve Length",
      custom: "",
      value: 63,
      unit: "cm"
    },
    {
      id: "shoulder",
      label: "Shoulder Width",
      custom: "",
      value: 46,
      unit: "cm"
    }
  ]
}
\`\`\`

### Example JSON Output - IF TEMPLATE IS PROVIDED:
\`\`\`json
{
  "title": "@age @brand @design @style @category Size @size",
  "description": "A sleek modern polo shirt in navy blue cotton featuring a subtle embroidered logo on the chest. Classic fit with ribbed collar and cuffs.",
  "descriptionHtml": "<p>A sleek modern polo shirt in navy blue cotton featuring a subtle embroidered logo on the chest. Classic fit with ribbed collar and cuffs.</p>",
  "price": 45.99,
  "color": {
    "primaryColor": ["navy"],
    "secondaryColor": null
  },
  "material": "cotton",
  "listed_size": "M",
  "category": "Tops",
  "subcategory": "Polo",
  "condition": "new_with_tags",
  "condition_notes": null,
  "brand": "Polo Ralph Lauren",
  "gender": "Menswear",
  "tags": ["90s", "denim", "streetwear", "levi's denim", "levi's pants", "levi's distressed", "levi's", "vintage levi's", "blue jeans"  /* up to 13 tags */],
  "age": "1990s",
  "item_style": "Modern",
  "design": "minimalist",
  "made_in": "USA",
  "source": ["Vintage"],
  "fit_type": "slim",
  "design": "Single Stitch",
  "closure_type": "buttons",
  "measurements": [
    {
      id: "chest",
      label: "Chest/Bust",
      custom: "",
      value: 54,
      unit: "cm"
    },
    {
      id: "length",
      label: "Length",
      custom: "Back Length",
      value: 68,
      unit: "cm"
    }
  ]
}
\`\`\`
Ensure that all placeholders remain intact during analysis. IF A TEMPLATE IS PROVIDED, DO NOT REPLACE THE PLACEHOLDERS WITH ACTUAL VALUES; however, when outputting the final title, any placeholder corresponding to a null value must be completely removed from the title string.
`,
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
 * Create function for three-image messages with template settings
 */
export function createThreeImageMessages(
  imageUrls: string[],
  titleTemplate?: string,
  descriptionTemplate?: string,
  exampleDescription?: string,
  templateSettings?: TemplateSettings,
  tags?: string[]
): OpenAI.Chat.ChatCompletionMessageParam[] {
  // Create template config from parameters
  const templateConfig: TemplateConfig = {
    title: titleTemplate ? { id: 'title', name: 'Title Template', content: titleTemplate } : null,
    description: descriptionTemplate ? { id: 'description', name: 'Description Template', content: descriptionTemplate } : null,
    exampleDescription: exampleDescription || null,
    attributes: {},
  };
  
  return createImageAnalysisMessages(imageUrls, templateConfig, templateSettings || {
    mode: 'hybrid',
    excludedTerms: [],
    positionRules: { noTermsAtStart: [], noTermsAtEnd: [] },
    structurePreset: 'custom',
    keywordFormat: 'comma',
    aiRewriteLevel: 50,
    freeTextDescription: '',
    fallbackBehavior: 'template_only'
  }, tags);
}

/**
 * Enhanced ProductClassifier class with template settings support
 */
export class ProductClassifier {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private async getRagContext(imageUrls: string): Promise<string> {
    try {
      // Make API call to your vector database backend
      const response = await fetch(`http://68.183.204.156:8882/api/rag/process_multimodal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrls,
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
    templateSettings?: TemplateSettings,
    tags?: string[]
  ): Promise<ProductResponse> {
    // Get messages using new template system with settings
    const messages = createThreeImageMessages(
      imageUrls, 
      titleTemplate, 
      descriptionTemplate, 
      exampleDescription, 
      templateSettings,
      tags
    );

    // Get relevant context from vector database
    const relevantContext = await this.getRagContext(imageUrls[0]);
    // Add context to the messages if available
    if (relevantContext) {
      messages.push({
        role: 'system',
        content: `Here is some relevant context about similar products:\n${relevantContext}\nUse this context to help classify the product more accurately.`,
      });
    }

    // Make classification with context
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 1000,
      temperature: 0,
    });

    const rawJson = response.choices[0].message?.content?.replace(/```json\n?|```/g, '').trim();

    if (!rawJson) {
      throw new Error('No valid JSON received from the model.');
    }

    console.log('== Raw JSON ==\n', rawJson);
    const parsedContent = JSON.parse(rawJson);
    
    // Process description template if necessary
    if (descriptionTemplate && parsedContent.description) {
      // The response handling depends on template mode
      if (templateSettings?.mode === 'strict') {
        // In strict mode, we need to insert the descriptive sentence into the template
        parsedContent.description = processDescriptionTemplate(descriptionTemplate, parsedContent.description);
      }
      // For AI and hybrid modes, the model should have already processed the template appropriately
    }
    
    return ProductResponseSchema.parse(parsedContent);
  }
  
  catch(error: { errors: any }) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      throw new Error('Invalid response format from the AI model.');
    }
    throw error;
  }
}

/**
 * Main entry point function with template settings support
 */
export async function main(
  imageUrls: string[], 
  titleTemplate?: string, 
  descriptionTemplate?: string, 
  exampleDescription?: string,
  templateSettings?: TemplateSettings,
  tags?: string[]
): Promise<ProductResponse> {
  console.log('== Clothing Analysis using OpenAI with Template Settings ==');
  const classifier = new ProductClassifier();

  const result = await classifier.classifyThreeImages(
    imageUrls, 
    titleTemplate, 
    descriptionTemplate,
    exampleDescription,
    templateSettings,
    tags
  );
  
  console.log('AI model returned:', result);
  return result;
}
export default main;