import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { databaseService } from '../../lib/appwrite';
import { useCart } from '../../contexts/CartContext';

const SHOP_COLLECTION = 'products';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await databaseService.listDocuments(SHOP_COLLECTION);
      if (result.success && result.data.documents.length > 0) {
        // Get featured products (limit to 4 for homepage)
        const featuredProducts = result.data.documents
          .filter(doc => doc.featured === true)
          .slice(0, 4)
          .map(doc => ({
            id: doc.$id,
            name: doc.name,
            price: doc.price,
            discountedPrice: doc.discountedPrice,
            onSale: doc.onSale === true,
            imageUrl: doc.imageUrl,
            fullImageUrl: doc.fullImageUrl || doc.imageUrl,
            featured: doc.featured,
            category: doc.category || '',
            tags: doc.tags || [],
            description: doc.description || '',
            additionalInfo: doc.additionalInfo || '',
            galleryUrls: doc.galleryUrls || [],
          }));
        
        // If no featured products, just take first 4
        if (featuredProducts.length === 0) {
          const allProducts = result.data.documents.slice(0, 4).map(doc => ({
            id: doc.$id,
            name: doc.name,
            price: doc.price,
            discountedPrice: doc.discountedPrice,
            onSale: doc.onSale === true,
            imageUrl: doc.imageUrl,
            fullImageUrl: doc.fullImageUrl || doc.imageUrl,
            featured: doc.featured,
            category: doc.category || '',
            tags: doc.tags || [],
            description: doc.description || '',
            additionalInfo: doc.additionalInfo || '',
            galleryUrls: doc.galleryUrls || [],
          }));
          setProducts(allProducts);
        } else {
          setProducts(featuredProducts);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="shop" className="py-10 relative overflow-hidden scroll-mt-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500">Loading products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section id="shop" className="py-10 relative overflow-hidden scroll-mt-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#1E8479',
            width: '500px',
            height: '500px',
            top: '30%',
            left: '60%',
            transform: 'translateX(-50%)',
            animation: 'float 30s ease-in-out infinite',
            opacity: 0.12,
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            background: '#105652',
            width: '350px',
            height: '350px',
            top: '10%',
            left: '20%',
            animation: 'float 25s ease-in-out infinite reverse',
            opacity: 0.08,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Title */}
        <h2 className="text-3xl font-bold mb-2 text-center" style={{ color: '#105652' }}>
          Shop
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto">
          Explore our curated collection of products
        </p>

        {/* Products Grid */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="transform transition-all duration-500"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              <ProductCard 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                onAddToCart={() => addToCart({ ...product, quantity: 1 })}
              />
            </div>
          ))}
        </div>

        {/* View All Products Button */}
        <div className="flex justify-center mt-6">
          <Link
            to="/shop"
            className="group flex items-center gap-2 px-6 py-2 border-2 border-[#105652] text-[#105652] font-medium rounded-none hover:bg-[#105652] hover:text-white transition-all duration-300"
          >
            <span className="tracking-wider text-sm uppercase">View All Products</span>
            <svg 
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          relatedProducts={products.filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category).slice(0, 4)}
          onAddToCart={(product) => addToCart(product)}
          onProductClick={setSelectedProduct}
        />
      )}
    </section>
  );
}
