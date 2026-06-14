const config = require("../config");
const createError = require("../utils/createError");
const productService = require("./productService");

const categoryAliases = {
  mouse: { search: "mouse", category: "accessories" },
  headphones: { search: "headphones", category: "audio" },
  headphone: { search: "headphones", category: "audio" },
  cable: { search: "cable", category: "cables" },
  cables: { search: "cable", category: "cables" },
  laptop: { search: "laptop", category: "laptop" },
  keyboard: { search: "keyboard", category: "accessories" },
  phone: { search: "phone", category: "phone" },
  charger: { search: "charger", category: "electronics" },
  webcam: { search: "webcam", category: "electronics" },
  lamp: { search: "lamp", category: "lighting" },
  watch: { search: "watch", category: "wearables" },
  ssd: { search: "ssd", category: "storage" },
};

const knownProductCategories = [
  "accessories",
  "audio",
  "cables",
  "electronics",
  "furniture",
  "general",
  "laptop",
  "lighting",
  "phone",
  "storage",
  "wearables",
];

const shoppingFiltersGeminiSchema = {
  type: "object",
  properties: {
    isShoppingQuery: { type: "boolean" },
    search: { type: "string" },
    category: { type: "string" },
    minPrice: { type: ["number", "null"] },
    maxPrice: { type: ["number", "null"] },
    sort: {
      type: "string",
      enum: [
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "name_asc",
        "name_desc",
      ],
    },
    stockStatus: {
      type: "string",
      enum: ["in_stock", "out_of_stock", "any"],
    },
  },
  required: [
    "isShoppingQuery",
    "search",
    "category",
    "minPrice",
    "maxPrice",
    "sort",
    "stockStatus",
  ],
};

class AIShoppingAssistantService {
  async getRecommendations(body = {}) {
    const message = this.validateMessage(body.message);
    const { filters, source } = await this.extractFilters(message);

    if (!filters.isShoppingQuery) {
      return {
        message:
          "I can help with shopping requests, like finding products by name, category, or budget.",
        source,
        filters,
        products: [],
      };
    }

    const products = await this.searchRecommendedProducts(filters);

    return {
      message:
        products.length > 0
          ? "I found products that match your request."
          : "I understood your request, but I could not find matching products.",
      source,
      filters,
      products,
    };
  }

  async extractFilters(message) {
    if (config.geminiApiKey) {
      try {
        const filters = await this.extractFiltersWithGemini(message);

        return {
          filters,
          source: "gemini",
        };
      } catch (err) {
        console.error("Gemini shopping assistant failed:", err.message);
      }
    }

    return {
      filters: this.parseFallbackFilters(message),
      source: "fallback",
    };
  }

  async extractFiltersWithGemini(message) {
    const modelPath = config.geminiModel.startsWith("models/")
      ? config.geminiModel
      : `models/${config.geminiModel}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.geminiApiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You convert shopping requests into product filters for an ecommerce catalog. Return only structured filters. Do not answer general questions.",
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: shoppingFiltersGeminiSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API ${response.status}: ${errorText.slice(0, 300)}`,
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    const rawFilters = JSON.parse(responseText);
    return this.normalizeFilters(rawFilters);
  }

  normalizeFilters(rawFilters = {}) {
    const filters = this.createDefaultFilters();

    filters.isShoppingQuery = Boolean(rawFilters.isShoppingQuery);

    if (typeof rawFilters.search === "string") {
      filters.search = rawFilters.search.trim().slice(0, 80);
    }

    if (typeof rawFilters.category === "string") {
      filters.category = rawFilters.category.trim().slice(0, 50);
    }

    if (typeof rawFilters.minPrice === "number" && rawFilters.minPrice >= 0) {
      filters.minPrice = rawFilters.minPrice;
    }

    if (typeof rawFilters.maxPrice === "number" && rawFilters.maxPrice >= 0) {
      filters.maxPrice = rawFilters.maxPrice;
    }

    const allowedSorts = [
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
    ];

    if (allowedSorts.includes(rawFilters.sort)) {
      filters.sort = rawFilters.sort;
    }

    const allowedStockStatuses = ["in_stock", "out_of_stock", "any"];

    if (allowedStockStatuses.includes(rawFilters.stockStatus)) {
      filters.stockStatus = rawFilters.stockStatus;
    }

    const alias = this.findCategoryAlias(
      `${filters.search} ${filters.category}`,
    );
    const normalizedCategory = filters.category.toLowerCase();

    if (alias && !knownProductCategories.includes(normalizedCategory)) {
      filters.category = alias.category;
    }

    if (
      filters.category &&
      !knownProductCategories.includes(filters.category.toLowerCase())
    ) {
      filters.category = "";
    }

    if (
      filters.minPrice !== null &&
      filters.maxPrice !== null &&
      filters.minPrice > filters.maxPrice
    ) {
      filters.minPrice = null;
    }

    return filters;
  }

  findCategoryAlias(value) {
    const normalizedValue = value.toLowerCase();

    for (const [keyword, alias] of Object.entries(categoryAliases)) {
      if (normalizedValue.includes(keyword)) {
        return alias;
      }
    }

    return null;
  }

  createDefaultFilters() {
    return {
      isShoppingQuery: true,
      search: "",
      category: "",
      minPrice: null,
      maxPrice: null,
      sort: "newest",
      stockStatus: "in_stock",
    };
  }

  parseFallbackFilters(message) {
    const normalizedMessage = message.toLowerCase();
    const filters = this.createDefaultFilters();

    if (this.isClearlyNonShoppingQuery(normalizedMessage)) {
      filters.isShoppingQuery = false;
      return filters;
    }

    const maxPriceMatch = normalizedMessage.match(
      /\b(?:under|below|less than|up to|max|maximum)\s*(?:rs\.?|\u20b9)?\s*(\d+)/,
    );

    if (maxPriceMatch) {
      filters.maxPrice = Number(maxPriceMatch[1]);
      filters.sort = "price_asc";
    }

    const minPriceMatch = normalizedMessage.match(
      /\b(?:over|above|more than|min|minimum)\s*(?:rs\.?|\u20b9)?\s*(\d+)/,
    );

    if (minPriceMatch) {
      filters.minPrice = Number(minPriceMatch[1]);
    }

    for (const [keyword, alias] of Object.entries(categoryAliases)) {
      if (normalizedMessage.includes(keyword)) {
        filters.search = alias.search;
        filters.category = alias.category;
        break;
      }
    }

    if (!filters.search && normalizedMessage.includes("work from home")) {
      filters.search = "desk";
      filters.category = "accessories";
    }

    filters.isShoppingQuery = Boolean(
      filters.search ||
      filters.category ||
      filters.minPrice !== null ||
      filters.maxPrice !== null ||
      /\b(show|find|need|want|buy|recommend|shopping|product|setup)\b/.test(
        normalizedMessage,
      ),
    );

    return filters;
  }

  isClearlyNonShoppingQuery(normalizedMessage) {
    return /\b(weather|joke|capital|president|movie|recipe)\b/.test(
      normalizedMessage,
    );
  }

  async searchRecommendedProducts(filters) {
    const result = await productService.getAllProducts({
      search: filters.search,
      category: filters.category,
      minPrice: filters.minPrice ?? "",
      maxPrice: filters.maxPrice ?? "",
      sort: filters.sort || "newest",
      stockStatus: filters.stockStatus,
      page: 1,
      limit: 6,
    });

    return result.products;
  }

  validateMessage(message) {
    if (!message || typeof message !== "string") {
      throw createError("Message is required", 400);
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      throw createError("Message is required", 400);
    }

    if (trimmedMessage.length > 300) {
      throw createError("Message must not exceed 300 characters", 400);
    }

    return trimmedMessage;
  }
}

module.exports = new AIShoppingAssistantService();
