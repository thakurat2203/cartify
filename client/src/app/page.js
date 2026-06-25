"use client";

/* eslint-disable @next/next/no-img-element -- Product image URLs are admin-managed and not domain allow-listed yet. */

import { useEffect, useState } from "react";
import api from "@/lib/api";
import styles from "./page.module.css";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";

const initialFilters = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

const exampleAssistantQueries = [
  "mouse",
  "mouse under 2000",
  "Build me an office setup under 5000",
];

const assistantSourceLabels = {
  gemini: "Gemini",
  fallback: "Local fallback",
};

const isBundleAssistantQuery = (message) => {
  const normalizedMessage = message.toLowerCase();
  const asksForBundle =
    /\b(setup|bundle|kit|essentials)\b/.test(normalizedMessage) ||
    /\bbuild\s+(?:me\s+)?(?:a\s+)?cart\b/.test(normalizedMessage);
  const mentionsUseCase = /\b(office|gaming|study|travel)\b/.test(
    normalizedMessage,
  );
  const mentionsBudget =
    /\b(under|below|up to|max|maximum|budget)\b/.test(normalizedMessage);

  return asksForBundle || (mentionsUseCase && mentionsBudget);
};

const getStockBadge = (stock) => {
  const quantity = Number(stock);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { label: "Out of stock", className: styles.outStock };
  }

  if (quantity < 10) {
    return { label: "Low stock", className: styles.lowStock };
  }

  return { label: "Good stock", className: styles.goodStock };
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    totalPages: 0,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  // Draft filters update while typing; applied filters are the only values that refetch.
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [imageErrors, setImageErrors] = useState({});

  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [assistantResult, setAssistantResult] = useState(null);
  const [bundleCartMessage, setBundleCartMessage] = useState("");
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const addManyToCart = useCartStore((state) => state.addManyToCart);

  // Product data reloads only when the page or submitted filters change.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/api/products", {
          params: {
            page: currentPage,
            limit: 8,
            ...appliedFilters,
          },
        });
        const data = response.data;
        setProducts(data.products || []);
        setPagination({
          page: data.page || 1,
          limit: data.limit || 8,
          totalPages: data.totalPages || 0,
          totalProducts: data.totalProducts || 0,
          hasNextPage: Boolean(data.hasNextPage),
          hasPrevPage: Boolean(data.hasPrevPage),
        });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to load products";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, appliedFilters]);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();

    setCurrentPage(1);
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setCurrentPage(1);
  };

  const askAssistant = async (message = assistantInput) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setAssistantError("Ask for a product or describe a setup with a budget.");
      return;
    }

    setAssistantLoading(true);
    setAssistantError("");
    setBundleCartMessage("");

    try {
      const mode = isBundleAssistantQuery(trimmedMessage)
        ? "bundle"
        : "recommendations";
      const endpoint =
        mode === "bundle"
          ? "/api/ai/cart-builder"
          : "/api/ai/shopping-assistant";
      const response = await api.post(endpoint, { message: trimmedMessage });

      setAssistantResult({ ...response.data, mode });
      setAssistantInput(trimmedMessage);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "The AI shopping assistant could not answer right now.";

      setAssistantError(message);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleAssistantSubmit = (event) => {
    event.preventDefault();
    askAssistant();
  };

  const handleExampleQuery = (query) => {
    askAssistant(query);
  };

  const handleAddBundle = () => {
    if (!assistantResult?.items?.length) {
      return;
    }

    addManyToCart(assistantResult.items);
    setBundleCartMessage(
      "Cart updated with the available bundle quantities.",
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Cartify Storefront</p>
          <h1 className={styles.title}>Product Catalog</h1>
          <p className={styles.subtitle}>
            Browse premium essentials, compare live stock, and build your cart
            with a cleaner shopping flow.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <section
          className={`${styles.assistantPanel} ${
            isAssistantOpen ? styles.assistantPanelOpen : ""
          }`}
        >
          <div className={styles.assistantHeader}>
            <div>
              <h2>AI Shopping Assistant</h2>
              <p>
                Find a product, or describe a setup and budget to build a
                complete in-stock bundle.
              </p>
            </div>

            <div className={styles.assistantHeaderActions}>
              {assistantResult?.source && (
                <span className={styles.assistantSource}>
                  {assistantSourceLabels[assistantResult.source] || "AI"}
                </span>
              )}

              <button
                type="button"
                className={styles.assistantToggle}
                aria-expanded={isAssistantOpen}
                aria-controls="ai-shopping-assistant-body"
                onClick={() => setIsAssistantOpen((previous) => !previous)}
              >
                {isAssistantOpen ? "Hide AI" : "Ask AI"}
              </button>
            </div>
          </div>

          <div
            id="ai-shopping-assistant-body"
            className={styles.assistantBody}
          >
            <form
              className={styles.assistantForm}
              onSubmit={handleAssistantSubmit}
            >
              <input
                type="text"
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
                placeholder="Try: mouse, or office setup under 5000"
                maxLength={300}
              />

              <button type="submit" disabled={assistantLoading}>
                {assistantLoading ? "Thinking..." : "Ask AI"}
              </button>
            </form>

            <div className={styles.assistantExamples}>
              {exampleAssistantQueries.map((query) => (
                <button
                  key={query}
                  type="button"
                  onClick={() => handleExampleQuery(query)}
                  disabled={assistantLoading}
                >
                  {query}
                </button>
              ))}
            </div>

            {assistantError && (
              <p className={styles.assistantError}>{assistantError}</p>
            )}

            {assistantResult && !assistantError && (
              <div className={styles.assistantResponse}>
                {assistantResult.mode === "recommendations" ? (
                  <>
                    <p>{assistantResult.message}</p>

                    {assistantResult.products?.length > 0 ? (
                      <ul className={styles.assistantProducts}>
                        {assistantResult.products.map((product) => (
                          <li
                            key={product._id}
                            className={`${styles.assistantProductCard} ${styles.recommendationCard}`}
                          >
                            <Link href={`/products/${product._id}`}>
                              <strong>{product.name}</strong>
                              <span>Rs. {product.price}</span>
                              <small>{product.category}</small>
                            </Link>

                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                            >
                              {product.stock > 0 ? "Add" : "Out"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No matching products were found.</p>
                    )}
                  </>
                ) : (
                  <>
                    <dl className={styles.bundleSummary}>
                      <div>
                        <dt>Budget</dt>
                        <dd>Rs. {assistantResult.budget}</dd>
                      </div>

                      <div>
                        <dt>Bundle total</dt>
                        <dd>Rs. {assistantResult.totalPrice}</dd>
                      </div>

                      <div>
                        <dt>Remaining</dt>
                        <dd>Rs. {assistantResult.remainingBudget}</dd>
                      </div>
                    </dl>

                    {assistantResult.items?.length > 0 ? (
                      <ul className={styles.assistantProducts}>
                        {assistantResult.items.map(
                          ({ product, quantity, reason }) => (
                            <li
                              key={product._id}
                              className={styles.assistantProductCard}
                            >
                              <Link href={`/products/${product._id}`}>
                                <strong>{product.name}</strong>
                                <span>
                                  Rs. {product.price} &middot; Qty {quantity}
                                </span>
                                <small>{reason}</small>
                              </Link>
                            </li>
                          ),
                        )}
                      </ul>
                    ) : (
                      <p>No products could fit this bundle.</p>
                    )}

                    {assistantResult.skippedCategories?.length > 0 && (
                      <div className={styles.skippedCategories}>
                        <strong>Could not include</strong>
                        <ul>
                          {assistantResult.skippedCategories.map(
                            (skipped, index) => (
                              <li key={`${skipped.category}-${index}`}>
                                {skipped.category}: {skipped.reason}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {assistantResult.items?.length > 0 && (
                      <div className={styles.bundleActions}>
                        <button
                          type="button"
                          className={styles.bundleAddButton}
                          onClick={handleAddBundle}
                        >
                          Add all to cart
                        </button>

                        {bundleCartMessage && (
                          <span role="status">{bundleCartMessage}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>
        <form
          className={`${styles.filters} ${
            areFiltersOpen ? styles.filtersOpen : ""
          }`}
          onSubmit={handleApplyFilters}
        >
          <label className={`${styles.field} ${styles.searchField}`}>
            <span>Search</span>
            <input
              type="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Product name"
            />
          </label>

          <div className={styles.filterMobileHeader}>
            <button
              type="button"
              className={styles.filterToggle}
              aria-expanded={areFiltersOpen}
              aria-controls="catalog-filter-fields"
              onClick={() => setAreFiltersOpen((prev) => !prev)}
            >
              {areFiltersOpen ? "Hide filters" : "Filters"}
            </button>
          </div>

          <div id="catalog-filter-fields" className={styles.filterPanel}>
            <label className={styles.field}>
              <span>Category</span>
              <input
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="accessories"
              />
            </label>

            <label className={styles.field}>
              <span>Min price</span>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                min="0"
                placeholder="0"
              />
            </label>

            <label className={styles.field}>
              <span>Max price</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
                placeholder="5000"
              />
            </label>

            <label className={`${styles.field} ${styles.sortField}`}>
              <span>Sort</span>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </label>

            <div className={styles.filterActions}>
              <button type="submit" className={styles.filterButton}>
                Apply
              </button>

              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {loading && <p className={styles.info}>Loading products...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className={styles.info}>
            No products found. Try clearing filters or searching a different
            category.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ul className={styles.grid}>
              {products.map((product) => (
                <li key={product._id}>
                  <div className={styles.card}>
                    {/* Product details remain clickable while cart action stays inside the card. */}
                    <Link
                      href={`/products/${product._id}`}
                      className={styles.cardLink}
                    >
                      <div className={styles.cardImage}>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className={styles.cardImageImg}
                            onError={() =>
                              setImageErrors((prev) => ({
                                ...prev,
                                [product._id]: true,
                              }))
                            }
                            hidden={Boolean(imageErrors[product._id])}
                          />
                        ) : null}

                        {!product.image || imageErrors[product._id] ? (
                          <div className={styles.cardImageFallback}>
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        ) : null}
                      </div>
                      <div className={styles.cardHeader}>
                        <h2>{product.name}</h2>
                        <span className={styles.price}>
                          Rs. {product.price}
                        </span>
                      </div>
                      <p className={styles.description}>
                        {product.description || "No description yet."}
                      </p>
                      <div className={styles.meta}>
                        <span>Stock: {product.stock}</span>
                        <span
                          className={`${styles.stockBadge} ${
                            getStockBadge(product.stock).className
                          }`}
                        >
                          {getStockBadge(product.stock).label}
                        </span>
                        <span className={styles.category}>
                          {product.category}
                        </span>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? "Add to cart" : "Out of stock"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {!loading &&
          !error &&
          products.length > 0 &&
          pagination.totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Product pages">
              <button
                type="button"
                className={styles.pageButton}
                disabled={!pagination.hasPrevPage}
                onClick={() => goToPage(pagination.page - 1)}
              >
                Previous
              </button>

              <span className={styles.pageStatus}>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                className={styles.pageButton}
                disabled={!pagination.hasNextPage}
                onClick={() => goToPage(pagination.page + 1)}
              >
                Next
              </button>
            </nav>
          )}
      </main>
    </div>
  );
}
