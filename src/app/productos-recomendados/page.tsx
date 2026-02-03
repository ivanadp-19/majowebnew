"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const { projectId, dataset } = client.config();
const urlFor = (source: any) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface AffiliateCategory {
  _id: string;
  title: string;
  slug: { current: string };
}

interface AffiliateProduct {
  _id: string;
  title: string;
  image?: any;
  url: string;
  description?: string;
  categories?: AffiliateCategory[];
}

export default function ProductosRecomendadosPage() {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [categories, setCategories] = useState<AffiliateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all categories
        const categoriesQuery = `*[_type == "affiliateCategory"] | order(title asc) {
          _id,
          title,
          slug
        }`;
        
        // Fetch all products with their categories
        const productsQuery = `*[_type == "affiliateProduct"] | order(title asc) {
          _id,
          title,
          image,
          url,
          description,
          "categories": categories[]-> {
            _id,
            title,
            slug
          }
        }`;

        const [categoriesData, productsData] = await Promise.all([
          client.fetch<AffiliateCategory[]>(categoriesQuery),
          client.fetch<AffiliateProduct[]>(productsQuery),
        ]);

        setCategories(categoriesData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) =>
        product.categories?.some((cat) => cat._id === selectedCategory)
      )
    : products;

  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark text-cream py-8 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div 
              className="rounded-full px-6 py-3 border-2 shadow-lg"
              style={{ backgroundColor: '#E891B1', borderColor: '#E891B1' }}
            >
              <span className="display-text text-lg lg:text-xl tracking-wider text-dark">
                Majo<span className="font-normal italic mx-1 text-base">Alonzo</span>
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="nav-link text-cream transition-colors text-sm"
            style={{ '--hover-color': '#E891B1' } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E891B1'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#f5f0e8'}
          >
            ← VOLVER AL INICIO
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 lg:px-20" style={{ backgroundColor: '#E891B1' }}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="script-text text-4xl lg:text-6xl text-dark mb-4">
            Productos Recomendados
          </h1>
          <p className="text-lg lg:text-xl text-dark/90 max-w-2xl mx-auto">
            Descubre productos seleccionados especialmente para ti. Herramientas y recursos que complementan tu camino hacia una vida más saludable.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-cream py-8 px-6 lg:px-20 border-b-2" style={{ borderColor: 'rgba(232, 145, 177, 0.2)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4">
            <span className="nav-link text-dark text-sm font-semibold">
              FILTRAR POR CATEGORÍA:
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full nav-link text-sm transition-all ${
                selectedCategory === null
                  ? "text-dark shadow-lg"
                  : "bg-white text-dark border-2"
              }`}
              style={selectedCategory === null 
                ? { backgroundColor: '#E891B1' }
                : { borderColor: '#E891B1' }
              }
              onMouseEnter={(e) => {
                if (selectedCategory !== null) {
                  e.currentTarget.style.backgroundColor = 'rgba(232, 145, 177, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== null) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              TODAS
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-6 py-2 rounded-full nav-link text-sm transition-all ${
                  selectedCategory === category._id
                    ? "text-dark shadow-lg"
                    : "bg-white text-dark border-2"
                }`}
                style={selectedCategory === category._id
                  ? { backgroundColor: '#E891B1' }
                  : { borderColor: '#E891B1' }
                }
                onMouseEnter={(e) => {
                  if (selectedCategory !== category._id) {
                    e.currentTarget.style.backgroundColor = 'rgba(232, 145, 177, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category._id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-cream py-12 lg:py-20 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-dark/60">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-dark/60">
                {selectedCategory
                  ? "No hay productos en esta categoría."
                  : "No hay productos disponibles aún."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-dark/60 text-sm nav-link">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado{filteredProducts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.map((product) => {
                  const imageUrl = product.image
                    ? urlFor(product.image)?.width(600).height(600).url()
                    : null;

                  return (
                    <a
                      key={product._id}
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
                    >
                      {imageUrl && (
                        <div 
                          className="relative w-full h-64 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(232, 145, 177, 0.1)' }}
                        >
                          <img
                            src={imageUrl}
                            alt={product.title}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        {product.categories && product.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.categories.map((category) => (
                              <span
                                key={category._id}
                                className="inline-block text-dark text-xs px-3 py-1 rounded-full nav-link"
                                style={{ backgroundColor: 'rgba(232, 145, 177, 0.2)' }}
                              >
                                {category.title}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 
                          className="display-text text-xl lg:text-2xl text-dark transition-colors mb-2 flex-grow group"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#E891B1'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a1a'}
                        >
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-dark/70 text-sm mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="mt-auto pt-4 border-t border-dark/10">
                          <span 
                            className="nav-link text-dark text-xs transition-colors group-hover"
                            onMouseEnter={(e) => e.currentTarget.style.color = '#E891B1'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a1a'}
                          >
                            VER PRODUCTO →
                          </span>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

   
    </main>
  );
}

