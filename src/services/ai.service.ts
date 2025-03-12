import 'dotenv/config';
import { z } from 'zod';
import OpenAI from 'openai';
import { Gender, ProductColors, ProductCondition, Material, ProductSource } from '../utils/products.enums';
import { Category, categoryHierarchy } from '../utils/product/category';
import { productSizes } from '../utils/product/size';

const ProductResponseSchema = z
.object({
  // Assuming title, description, price and condition should be provided, so we leave those without fallback.
  title: z.string(),
  description: z.string(),
  price: z.number(),
  color:   z.object({
      primaryColor: z
        .array(z.enum(Object.values(ProductColors) as [string, ...string[]]))
        .transform((colors) =>
          colors.filter((color) => (Object.values(ProductColors) as ProductColors[]).includes(color as ProductColors))
        )
        .nullable()
        .catch(null),
      secondaryColor: z
        .array(z.enum(Object.values(ProductColors) as [string, ...string[]]))
        .transform((colors) =>
          colors.filter((color) => (Object.values(ProductColors) as ProductColors[]).includes(color as ProductColors))
        )
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
  subcategory: z.enum(Object.values(Category.getAllSubcategories()) as [string, ...string[]])
    .optional(),
  material: z.enum(Object.values(Material) as [string, ...string[]]).nullable().catch(null),
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
})
.refine(
  (data) =>
    !data.subcategory ||
    Category.validate(data.gender, data.category, data.subcategory),
  {
    message: 'Invalid category/subcategory combination for gender.',
    path: ['product_subcategory'],
  }
);


type ProductResponse = z.infer<typeof ProductResponseSchema>;

function createThreeImageMessages(imageUrls: string[], titleTemplate: string): OpenAI.Chat.ChatCompletionMessageParam[] {
  const ProductColorsList = Object.values(ProductColors).join(', ');
  const ProductMaterialsList = Object.values(Material).join(', ');
  const ProductSizesList = productSizes.join(', ');
  const ProductConditionsList = Object.values(ProductCondition).join(', ');
  const ProductSourceList = Object.values(ProductSource).join(', ');
  const CategoryHierarchy = Category.formatCategoryHierarchy();

  // Create instructions for template handling
  const titleInstruction = titleTemplate
    ? `RECEIVED CUSTOM title template: ${titleTemplate}. Optimize the following user provided CUSTOM title template for natural flow and SEO while preserving all @placeholders: ${titleTemplate}. 
    If the title does not look good enough with the placeholder, optimize the title further for preserving placeholder`
    : `Compose a title using the default format (not provided CUSTOM template) below:`;

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
        'You are an advanced clothing analysis assistant. Your role is to analyze clothing images step-by-step and produce detailed JSON output.',
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `
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
    - **Title**: ${titleInstruction}
      ${titleFormat}
   - **Description** (SEO-optimized format):  
     - **First sentence:** A 1-2 line summary using high-traffic keywords.
     - **Bullet points with details:** (in new line)  
       - **Era & Style:** Mention the decade (*1990s/Y2K*) and style category (*grunge, streetwear, retro*).  
       - **Brand & Material:** Include recognized brands & primary material.  
       - **Fit & Features:** Fit description (*baggy, cropped, slim*), notable design elements (*patchwork, embroidery, stripes*).  
       - **Ideal Use Cases:** Styling suggestions (e.g., *“Perfect for layering with oversized blazers or casual streetwear looks”*).  
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
   - **Tags:** Generate 13 SEO-friendly, relevant tags (e.g., "casual", "vintage")
   - **Age:** Inferred age (e.g., "1990s"); use only if you are 95% certain, otherwise set as null.
   - **Style:** Overall style (e.g., "vintage")
   - **Design:** Notable design elements (e.g., "flannel", "minimalist")
   - **Fit Type:** Clothing fit (e.g., "slim", "regular", "loose")
   - **Closure Type:** Type of closure (e.g., "buttons", "zippers", "hooks")
   - **Made In:** Country of manufacture (e.g., "USA", "China")
   - **Source:** List of two sources max. (e.g., "Vintage", "New"): Choose from: ${ProductSourceList}
   - **Condition Notes:** Specific details regarding the condition that would be essential for the buyer to know.

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
- Do not predict on size if it is uncertain about it  
- Use **null** for attributes that cannot be determined, except "title", "description", "price", and "condition".

### IMPORTANT:
- **Placeholder Removal in Title:**  
  When forming the title string from the provided template, if any inferred attribute value is null, completely remove its corresponding placeholder token (e.g., @brand, @age) from the final title. Do not leave any extra spaces or tokens.  
  - **Example:**  
    If the title template is "@age @brand @design @style @category Size @size" and @age is null and @brand is null, the final title should be "@design @style @category Size @size" without extra spaces.
- **Do Not Substitute Placeholders:**  
  If a template is provided, do not replace any placeholder tokens with their actual values in the output JSON. The output title should preserve the tokens for non-null values and exclude tokens corresponding to null attributes.
- Avoid common mistakes such as:
  - Confusing similar materials (e.g., cotton blend vs 100% cotton)
  - Misidentifying decades (note: Y2K items span 1999-2004)
  - Inaccurate pricing (vintage band t-shirts command higher prices)
- Spell out the sizes if they are letter sizes

---
Common mistakes to avoid:
- Confusing similar materials (e.g., cotton blend vs 100% cotton)
- Misidentifying decades (note: Y2K items are 1999-2004)
- Inaccurate pricing (vintage band t-shirts command higher prices)
- IF THE TITLE TEMPLATE IS EMPTY DO NOT RETURN TEMPLATE OPTIONS WITH @ symbols

### Example JSON Output - ONLY if template isn't provided:
\`\`\`json
{
  "title": "Vintage 1990s Levi’s 501 High-Waisted Denim Jeans / Grunge / Distressed / Streetwear Essential",
  "description": "Iconic 1990s Levi’s 501 high-waisted denim jeans, a must-have for vintage and streetwear lovers, featuring classic distressed details for an effortlessly grunge aesthetic. - Era & Style: Authentic 1990s vintage with a grunge and streetwear edge. - Brand & Material: Made by Levi’s, crafted from 100% durable cotton denim. - Fit & Features: High-waisted, straight-leg fit with a relaxed, lived-in feel; features natural fading, distressed accents, and the signature button fly. - Ideal Use Cases: Perfect for pairing with oversized band tees, chunky boots, or layering with a flannel for a true 90s grunge vibe.",
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
  "tags": ["casual", "modern", "preppy", /* up to 13 tags */],
  "age": "1990s",
  "item_style": "Smart",
  "design": "minimalist",
  "made_in": "USA",
  "source": ["Vintage"],
  "fit_type": "slim",
  "design": "Single Stitch",
  "closure_type": "buttons"
}
\`\`\`

### Example JSON Output - IF TEMPLATE IS PROVIDED:
\`\`\`json
{
  "title": "@age @brand @design @style @category Size @size",
  "description": "A sleek modern polo shirt in navy blue cotton featuring a subtle embroidered logo on the chest. Classic fit with ribbed collar and cuffs.",
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
  "tags": ["casual", "modern", "preppy", /* up to 13 tags */],
  "age": "1990s",
  "item_style": "Modern",
  "design": "minimalist",
  "made_in": "USA",
  "source": ["Vintage"],
  "fit_type": "slim",
  "design": "Single Stitch",
  "closure_type": "buttons"
}
\`\`\`
Ensure that all placeholders remain intact during analysis. IF A TEMPLATE IS PROVIDED, DO NOT REPLACE THE PLACEHOLDERS WITH ACTUAL VALUES; however, when outputting the final title, any placeholder corresponding to a null value must be completely removed from the title string.
`,
        },
        ...imageUrls.map((url) => ({
          type: 'image_url',
          image_url: { url },
        })),
      ],
    },
  ] as OpenAI.Chat.ChatCompletionMessageParam[];
}

class ProductClassifier {
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

  async classifyThreeImages(imageUrls: string[], titleTemplate: string): Promise<ProductResponse> {
    const messages = createThreeImageMessages(imageUrls, titleTemplate);

    // Get relevant context from vector database
    const relevantContext = await this.getRagContext(imageUrls[0]);
    // // Add context to the messages if available
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
 * Main function
 */
export async function main(imageUrls: string[], titleTemplate: string): Promise<ProductResponse> {
  console.log('== Clothing Analysis using OpenAI ==');
  const classifier = new ProductClassifier();

  const result = await classifier.classifyThreeImages(imageUrls, titleTemplate);
  console.log('AI model returned:', result);
  return result;
}

export default main;
