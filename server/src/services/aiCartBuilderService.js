const config = require("../config");
const createError = require("../utils/createError");
const productService = require("./productService");

const USE_CASE_PRESETS = {
  office: ["mouse", "keyboard", "webcam", "lighting", "cables"],
  gaming: ["mouse", "keyboard", "audio"],
  study: ["lighting", "mouse", "cables"],
  travel: ["storage", "charging", "audio"],
  general: ["mouse", "lighting", "cables"],
};

const ROLE_TERMS = {
  mouse: ["mouse"],
  keyboard: ["keyboard"],
  webcam: ["webcam", "camera"],
  lighting: ["lamp", "lighting"],
  cables: ["cable", "hdmi"],
  audio: ["headphone", "headset", "speaker"],
  storage: ["ssd", "storage"],
  charging: ["charger", "charging"],
};

const ROLE_EXCLUSIONS = {
  mouse: ["mouse pad"],
  keyboard: ["wrist rest"],
};

const ALLOWED_USE_CASES = Object.keys(USE_CASE_PRESETS);
const ALLOWED_ROLES = Object.keys(ROLE_TERMS);

const intentSchema = {
  type: "object",
  properties: {
    budget: { type: ["number", "null"] },
    useCase: {
      type: "string",
      enum: ALLOWED_USE_CASES,
    },
    requestedCategories: {
      type: "array",
      items: {
        type: "string",
        enum: ALLOWED_ROLES,
      },
    },
    preferences: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["budget", "useCase", "requestedCategories", "preferences"],
};

class AICartBuilderService {
  async buildCart(body = {}) {
    const message = this.validateMessage(body.message);
    const { intent, source } = await this.extractIntent(message);

    if (!intent.budget) {
      throw createError(
        "Please include a budget, for example: office setup under 5000",
        400,
      );
    }

    const result = await productService.getAllProducts({
      stockStatus: "in_stock",
      sort: "price_asc",
      page: 1,
      limit: 50,
    });

    const bundle = this.selectBundle(result.products, intent);

    return {
      source,
      budget: intent.budget,
      items: bundle.items,
      totalPrice: bundle.totalPrice,
      remainingBudget: bundle.remainingBudget,
      skippedCategories: bundle.skippedCategories,
    };
  }

  async extractIntent(message) {
    if (config.geminiApiKey) {
      try {
        const intent = await this.extractWithGemini(message);

        return {
          intent,
          source: "gemini",
        };
      } catch (error) {
        console.error("Gemini cart builder failed:", error.message);
      }
    }

    return {
      intent: this.parseFallbackIntent(message),
      source: "fallback",
    };
  }

  async extractWithGemini(message) {
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
                text:
                  "Extract shopping bundle intent only. " +
                  "Do not invent products or prices.",
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
            responseJsonSchema: intentSchema,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    return this.normalizeIntent(JSON.parse(responseText));
  }

  parseFallbackIntent(message) {
    const normalizedMessage = message.toLowerCase();

    const budgetMatch = normalizedMessage.match(
      /\b(?:under|below|up to|max|budget(?: of| is)?)\s*(?:rs\.?|\u20b9)?\s*([\d,]+)/,
    );

    const requestedCategories = ALLOWED_ROLES.filter((role) =>
      ROLE_TERMS[role].some((term) => normalizedMessage.includes(term)),
    );

    const preferences = [
      "wireless",
      "ergonomic",
      "portable",
      "compact",
      "premium",
    ].filter((preference) => normalizedMessage.includes(preference));

    let useCase = "general";

    if (/\b(office|work|productivity|wfh)\b/.test(normalizedMessage)) {
      useCase = "office";
    } else if (/\b(gaming|gamer)\b/.test(normalizedMessage)) {
      useCase = "gaming";
    } else if (/\b(study|student|college)\b/.test(normalizedMessage)) {
      useCase = "study";
    } else if (/\b(travel|trip)\b/.test(normalizedMessage)) {
      useCase = "travel";
    }

    return this.normalizeIntent({
      budget: budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : null,
      useCase,
      requestedCategories,
      preferences,
    });
  }

  normalizeIntent(rawIntent = {}) {
    const budget = Number(rawIntent.budget);

    return {
      budget: Number.isFinite(budget) && budget > 0 ? budget : null,

      useCase: ALLOWED_USE_CASES.includes(rawIntent.useCase)
        ? rawIntent.useCase
        : "general",

      requestedCategories: Array.isArray(rawIntent.requestedCategories)
        ? [
            ...new Set(
              rawIntent.requestedCategories.filter((category) =>
                ALLOWED_ROLES.includes(category),
              ),
            ),
          ]
        : [],

      preferences: Array.isArray(rawIntent.preferences)
        ? rawIntent.preferences
            .filter((item) => typeof item === "string")
            .slice(0, 5)
        : [],
    };
  }

  selectBundle(products, intent) {
    const presetRoles = USE_CASE_PRESETS[intent.useCase];
    const requestedRoles =
      intent.useCase === "general" && intent.requestedCategories.length > 0
        ? intent.requestedCategories
        : [...new Set([...presetRoles, ...intent.requestedCategories])];

    const items = [];
    const skippedCategories = [];
    const usedProductIds = new Set();
    let remainingBudget = intent.budget;

    for (const role of requestedRoles) {
      const matchingProducts = products.filter((product) => {
        const productText = [
          product.name,
          product.description,
          product.category,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesRole = ROLE_TERMS[role].some((term) =>
          productText.includes(term),
        );

        const matchesExcludedTerm = (ROLE_EXCLUSIONS[role] || []).some(
          (term) => productText.includes(term),
        );

        const alreadyUsed = usedProductIds.has(String(product._id));

        return matchesRole && !matchesExcludedTerm && !alreadyUsed;
      });

      const selectedProduct = matchingProducts.find(
        (product) => Number(product.price) <= remainingBudget,
      );

      if (!selectedProduct) {
        skippedCategories.push({
          category: role,
          reason:
            matchingProducts.length === 0
              ? "No in-stock product is available"
              : "No product fits the remaining budget",
        });

        continue;
      }

      usedProductIds.add(String(selectedProduct._id));
      remainingBudget -= Number(selectedProduct.price);

      items.push({
        product: selectedProduct,
        quantity: 1,
        reason: `Suitable ${role} option for your ${intent.useCase} setup`,
      });
    }

    const totalPrice = items.reduce(
      (total, item) => total + Number(item.product.price) * item.quantity,
      0,
    );

    return {
      items,
      totalPrice,
      remainingBudget: intent.budget - totalPrice,
      skippedCategories,
    };
  }

  validateMessage(message) {
    if (!message || typeof message !== "string" || !message.trim()) {
      throw createError("Message is required", 400);
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 300) {
      throw createError("Message must not exceed 300 characters", 400);
    }

    return trimmedMessage;
  }
}

module.exports = new AICartBuilderService();
