import 'dotenv/config';
import { z } from 'zod';
import OpenAI from 'openai';
import { Gender, ProductColors, ProductCondition, Material, ProductSource } from '../utils/products.enums';
import { Category } from '../utils/product/category';
import { productSizes } from '../utils/product/size';
import { ChatCompletion } from 'openai/resources/chat';

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
  console.log(forInferenceTags);

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
If the title does not look good enough with the placeholder, optimize the title further for preserving placeholder.

Format details:
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
`;
  } else {
    titleInstructions = `
Compose a title using the following format:
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
  }

  // Handle description configuration
  let descriptionInstructions = '';
  const exampleDescription = templateConfig.exampleDescription || '';

  if (hasDescriptionTemplate) {
    const descriptionTemplate = templateConfig.description?.content || '';
    descriptionInstructions = `RECEIVED CUSTOM description template: ${descriptionTemplate}. Produce only one concise, SEO-friendly sentence. Do not include bullet points or additional details.`;

    if (exampleDescription) {
      descriptionInstructions += `\n\nHere's an example description to guide you: "${exampleDescription}"`;
    }
  } else {
    descriptionInstructions = `Compose a description using the default format with bullet points as follows:
- **Summary:** A concise 1-2 line overview using high-traffic keywords.
- **Details:** A list of bullet points covering: (put each bullet point on a new line)
  - Era & Style (e.g., "1990s grunge" or "Y2K streetwear"),
  - Brand & Material
  - Fit & Features,
  - Ideal Use Cases.`;

    if (exampleDescription) {
      descriptionInstructions += `\n\nHere's an example description to guide you: "${exampleDescription}"`;
    }
  }

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
    - **Tags:** generate 13 SEO-friendly, relevant tags (e.g., "casual", "vintage"). Use only these tags if this array is not empty: ${forInferenceTags}.
    - **Age:** Inferred age (e.g., "1990s"); use only if you are 70% certain, otherwise set as null.
    - **Style:** Overall style (e.g., "vintage")
    - **Design:** Notable design elements (e.g., "flannel", "minimalist")
    - **Fit Type:** Clothing fit (e.g., "slim", "regular", "loose")
    - **Closure Type:** Type of closure (e.g., "buttons", "zippers", "hooks")
    - **Made In:** Country of manufacture (e.g., "USA", "China")
    - **Source:** List of two sources max. (e.g., "Vintage", "New"): Choose from: ${ProductSourceList}
    - **Condition Notes:** Specific details regarding the condition that would be essential for the buyer to know.
    - **Measurements:** Any visible or relevant measurements (e.g., chest, length, sleeve, etc.)

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
${hasDescriptionTemplate ? '- Since a custom description template is provided, return only the sentence that should be inserted for @descriptive_sentence in the final JSON.' : '- Produce the full description as per the default instructions.'}
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

---
Common mistakes to avoid:
- Confusing similar materials (e.g., cotton blend vs 100% cotton)
- Misidentifying decades (note: Y2K items are 1999-2004)
- Inaccurate pricing (vintage band t-shirts command higher prices)
${hasTitleTemplate ? '' : '- DO NOT USE @ SYMBOLS IN THE TITLE'}

### Example JSON Output:
\`\`\`json
{
  "title": ${
    hasTitleTemplate
      ? '"@age @brand @design @style @category Size @size"'
      : '"Vintage 1990s Levi\'s 501 High-Waisted Denim Jeans / Grunge / Distressed / Streetwear Essential"'
  },
  "description": "Iconic 1990s Levi's 501 high-waisted denim jeans, a must-have for vintage and streetwear lovers, featuring classic distressed details for an effortlessly grunge aesthetic.\\n - Era & Style: Authentic 1990s vintage with a grunge and streetwear edge.\\n - Brand & Material: Made by Levi's, crafted from 100% durable cotton denim.\\n - Fit & Features: High-waisted, straight-leg fit with a relaxed, lived-in feel; features natural fading, distressed accents, and the signature button fly.\\n - Ideal Use Cases: Perfect for pairing with oversized band tees, chunky boots, or layering with a flannel for a true 90s grunge vibe.",
  "descriptionHtml": "<h2>Iconic 1990s Levi&#39;s 501 High-Waisted Denim Jeans</h2><p>A must-have for vintage and streetwear lovers, featuring classic distressed details for an effortlessly grunge aesthetic.</p><ul><li><strong>Era &amp; Style:</strong> Authentic 1990s vintage with a grunge and streetwear edge.</li><li><strong>Brand &amp; Material:</strong> Made by Levi&#39;s, crafted from 100% durable cotton denim.</li><li><strong>Fit &amp; Features:</strong> High-waisted, straight-leg fit with a relaxed, lived-in feel; features natural fading, distressed accents, and the signature button fly.</li><li><strong>Ideal Use Cases:</strong> Perfect for pairing with oversized band tees, chunky boots, or layering with a flannel for a true 90s grunge vibe.</li></ul>",
  "price": 45.99,
  "color": {
    "primaryColor": ["navy"],
    "secondaryColor": null
  },
  "material": "cotton",
  "size": "M",
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
    tags?: string[],
  ): Promise<ProductResponse> {
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
 * Functions for template management
 */

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
