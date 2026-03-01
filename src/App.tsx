/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  CheckCircle2,
  Settings,
  Package,
  ChevronLeft,
  Star,
  Upload,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, View } from './types';
import { INITIAL_PRODUCTS } from './constants';
import { translations } from './translations';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<View>('shop');
  
  const t = translations;

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Accessoires',
    image: 'https://picsum.photos/seed/new/600/600',
    stock: 10
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    whatsapp: '',
    phone: '',
    address: '',
    city: ''
  });

  // Derived state
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const confirmOrderWhatsApp = () => {
    const total = cartTotal + (cartTotal > 100000 ? 0 : 5000) + (cartTotal * 0.08);
    const message = `*Nouvelle commande KumbiMarket*\n\n` +
      `*Client:* ${customerInfo.name || 'Non renseigné'}\n` +
      `*WhatsApp:* ${customerInfo.whatsapp || 'Non renseigné'}\n` +
      `*Ville:* ${customerInfo.city || 'Non renseigné'}\n` +
      `*Adresse:* ${customerInfo.address || 'Non renseigné'}\n\n` +
      `*Produits:*\n` +
      cart.map(item => `- ${item.name} (x${item.quantity}) : ${formatPrice(item.price * item.quantity)}`).join('\n') +
      `\n\n*Total:* ${formatPrice(total)}`;
    
    const encodedMessage = encodeURIComponent(message);
    // Using a placeholder number, the user can change it if needed
    window.open(`https://wa.me/221770000000?text=${encodedMessage}`, '_blank');
  };

  const navigateToProduct = (product: Product) => {
    setSelectedProduct(product);
    setView('product-detail');
    window.scrollTo(0, 0);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      ...newProduct as Product,
      id: Date.now().toString(),
      image: newProduct.image || 'https://picsum.photos/seed/new/600/600'
    };
    setProducts(prev => [product, ...prev]);
    setIsAddingProduct(false);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: 'Accessoires',
      image: '',
      stock: 10
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setView('shop')}
                className="flex items-center gap-2 text-2xl font-serif font-bold tracking-tight text-brand-900"
              >
                <ShoppingBag className="w-8 h-8 text-brand-900" />
                <span>KumbiMarket</span>
              </button>
              
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-600">
                <button onClick={() => setView('shop')} className={cn("hover:text-brand-900 transition-colors", view === 'shop' && "text-brand-900 underline underline-offset-4")}>{t.shop}</button>
                <button onClick={() => setView('collections')} className={cn("hover:text-brand-900 transition-colors", view === 'collections' && "text-brand-900 underline underline-offset-4")}>{t.collections}</button>
                <button onClick={() => setView('about')} className={cn("hover:text-brand-900 transition-colors", view === 'about' && "text-brand-900 underline underline-offset-4")}>{t.about}</button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center bg-brand-100 rounded-full px-4 py-1.5 border border-brand-200">
                <Search className="w-4 h-4 text-brand-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  className="bg-transparent border-none focus:ring-0 text-sm w-40 lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                onClick={() => setView('admin')}
                className="p-2 text-brand-600 hover:text-brand-900 transition-colors"
                title={t.admin}
              >
                <Settings className="w-6 h-6" />
              </button>

              <button 
                onClick={() => setView('cart')}
                className="relative p-2 text-brand-600 hover:text-brand-900 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button className="p-2 text-brand-600 hover:text-brand-900 transition-colors sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-brand-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <div className="flex items-center bg-brand-100 rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-brand-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  className="bg-transparent border-none focus:ring-0 text-sm w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} className="block w-full text-left font-medium py-2">{t.shop}</button>
              <button onClick={() => { setView('collections'); setIsMenuOpen(false); }} className="block w-full text-left font-medium py-2">{t.collections}</button>
              <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="block w-full text-left font-medium py-2">{t.about}</button>
              <button onClick={() => { setView('admin'); setIsMenuOpen(false); }} className="block w-full text-left font-medium py-2">{t.admin}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-24"
            >
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif font-bold text-brand-900 mb-4">{t.aboutTitle}</h1>
                <p className="text-xl text-brand-500">{t.aboutSub}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div>
                  <img 
                    src="https://picsum.photos/seed/about/800/1000" 
                    alt="About" 
                    className="rounded-3xl shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-6">
                  <p className="text-lg text-brand-600 leading-relaxed">
                    {t.aboutContent}
                  </p>
                  <p className="text-lg text-brand-600 leading-relaxed">
                    Our journey began in a small studio in Paris, driven by a passion for materials that tell a story. Today, we work with artisans globally to bring you products that are as durable as they are beautiful.
                  </p>
                  <div className="pt-6 grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-3xl font-bold text-brand-900">10k+</h4>
                      <p className="text-sm text-brand-500">Happy Customers</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold text-brand-900">50+</h4>
                      <p className="text-sm text-brand-500">Artisan Partners</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'collections' && (
            <motion.div 
              key="collections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-24"
            >
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif font-bold text-brand-900 mb-4">{t.collectionsTitle}</h1>
                <p className="text-xl text-brand-500">{t.collectionsSub}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {['Electronics', 'Accessories', 'Furniture', 'Apparel', 'Kitchen'].map((cat, i) => (
                  <div 
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setView('shop'); }}
                    className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer"
                  >
                    <img 
                      src={`https://picsum.photos/seed/cat-${i}/800/800`} 
                      alt={cat} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{cat}</h3>
                      <p className="text-brand-200 text-sm mb-4">Explore the collection</p>
                      <button className="w-fit bg-white text-brand-900 px-6 py-2 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        View More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {(view === 'new-arrivals' || view === 'best-sellers' || view === 'sale') && (
            <motion.div 
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-24"
            >
              <div className="text-center mb-16">
                <h1 className="text-5xl font-serif font-bold text-brand-900 mb-4">
                  {view === 'new-arrivals' ? t.newArrivalsTitle : view === 'best-sellers' ? t.bestSellersTitle : t.saleTitle}
                </h1>
                <p className="text-xl text-brand-500">
                  {view === 'new-arrivals' ? t.newArrivalsSub : view === 'best-sellers' ? t.bestSellersSub : t.saleSub}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.slice(0, 4).map(product => (
                  <motion.div 
                    layout
                    key={product.id}
                    className="group bg-white rounded-2xl border border-brand-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div 
                      className="aspect-square overflow-hidden bg-brand-100 cursor-pointer relative"
                      onClick={() => navigateToProduct(product)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-brand-900 mb-2">{product.name}</h3>
                      <p className="font-bold text-brand-900 mb-4">{formatPrice(product.price)}</p>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-brand-100 text-brand-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-900 hover:text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        {t.addToCart}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'shipping' && (
            <motion.div key="shipping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-24">
              <h1 className="text-4xl font-serif font-bold text-brand-900 mb-8">{t.shippingTitle}</h1>
              <div className="prose prose-brand max-w-none text-brand-600 space-y-6">
                <p>Chez KumbiMarket, nous nous efforçons de vous livrer vos produits le plus rapidement possible. Voici les détails de notre politique de livraison :</p>
                <h3 className="text-xl font-bold text-brand-900">Délais de livraison</h3>
                <p>Les commandes sont généralement traitées sous 24 à 48 heures ouvrées. Une fois expédiée, la livraison prend entre 3 et 5 jours ouvrés pour la France métropolitaine.</p>
                <h3 className="text-xl font-bold text-brand-900">Frais de port</h3>
                <p>La livraison est gratuite pour toute commande supérieure à 100 000 FCFA. Pour les commandes inférieures, un forfait de 5 000 FCFA s'applique.</p>
              </div>
            </motion.div>
          )}

          {view === 'returns' && (
            <motion.div key="returns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-24">
              <h1 className="text-4xl font-serif font-bold text-brand-900 mb-8">{t.returnsTitle}</h1>
              <div className="prose prose-brand max-w-none text-brand-600 space-y-6">
                <p>Votre satisfaction est notre priorité. Si vous n'êtes pas entièrement satisfait de votre achat, nous sommes là pour vous aider.</p>
                <h3 className="text-xl font-bold text-brand-900">Conditions de retour</h3>
                <p>Vous avez 30 jours pour retourner un article à partir de la date de réception. L'article doit être inutilisé et dans le même état que vous l'avez reçu, dans son emballage d'origine.</p>
                <h3 className="text-xl font-bold text-brand-900">Remboursements</h3>
                <p>Une fois que nous aurons reçu votre article, nous l'inspecterons et vous informerons que nous avons reçu votre article retourné. Nous vous informerons immédiatement de l'état de votre remboursement après avoir inspecté l'article.</p>
              </div>
            </motion.div>
          )}

          {view === 'faq' && (
            <motion.div key="faq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-24">
              <h1 className="text-4xl font-serif font-bold text-brand-900 mb-8">{t.faqTitle}</h1>
              <div className="space-y-6">
                {[
                  { q: "Comment puis-je suivre ma commande ?", a: "Une fois votre commande expédiée, vous recevrez un e-mail avec un numéro de suivi." },
                  { q: "Quels modes de paiement acceptez-vous ?", a: "Nous acceptons les cartes Visa, Mastercard, American Express et PayPal." },
                  { q: "Livrez-vous à l'international ?", a: "Actuellement, nous livrons uniquement en France métropolitaine et dans l'Union Européenne." }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-brand-200">
                    <h3 className="font-bold text-brand-900 mb-2">{item.q}</h3>
                    <p className="text-brand-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-24">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-serif font-bold text-brand-900 mb-4">{t.contactTitle}</h1>
                <p className="text-brand-500">{t.contactSub}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-brand-200 shadow-xl max-w-2xl mx-auto">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">{t.name}</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">{t.whatsapp}</label>
                    <input type="tel" placeholder="+221 ..." className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">{t.message}</label>
                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none"></textarea>
                  </div>
                  <button className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold hover:bg-brand-800 transition-all">
                    {t.send}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              {/* Hero Section */}
              <section className="mb-16 relative rounded-3xl overflow-hidden bg-brand-900 text-white p-8 md:p-16">
                <div className="relative z-10 max-w-2xl">
                  <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
                    {t.heroTitle}
                  </h1>
                  <p className="text-brand-300 text-lg mb-8 max-w-lg">
                    {t.heroSub}
                  </p>
                  <button className="bg-white text-brand-900 px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-brand-100 transition-all group">
                    {t.shopNew}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 md:opacity-100">
                  <img 
                    src="https://picsum.photos/seed/hero/800/800" 
                    alt="Hero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </section>

              {/* Categories */}
              <div className="flex flex-wrap gap-3 mb-12">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-medium transition-all border",
                      selectedCategory === cat
                        ? "bg-brand-900 text-white border-brand-900" 
                        : "bg-white text-brand-600 border-brand-200 hover:border-brand-400"
                    )}
                  >
                    {cat === 'All' ? t.all : cat}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    key={product.id}
                    className="group bg-white rounded-2xl border border-brand-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div 
                      className="aspect-square overflow-hidden bg-brand-100 cursor-pointer relative"
                      onClick={() => navigateToProduct(product)}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-900 shadow-sm">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          className="font-bold text-brand-900 group-hover:text-brand-600 transition-colors cursor-pointer"
                          onClick={() => navigateToProduct(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="font-bold text-brand-900">{formatPrice(product.price)}</p>
                      </div>
                      <p className="text-sm text-brand-500 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-brand-100 text-brand-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-900 hover:text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        {t.addToCart}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-24">
                  <Search className="w-16 h-16 text-brand-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-brand-900 mb-2">{t.noProducts}</h3>
                  <p className="text-brand-500">{t.adjustSearch}</p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'product-detail' && selectedProduct && (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              <button 
                onClick={() => setView('shop')}
                className="flex items-center gap-2 text-brand-500 hover:text-brand-900 mb-8 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.backToShop}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="rounded-3xl overflow-hidden bg-white border border-brand-200 aspect-square">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-brand-100 text-brand-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedProduct.category}
                    </span>
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-brand-400 text-xs ml-2">(48 {t.reviews})</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-serif font-bold text-brand-900 mb-4">{selectedProduct.name}</h1>
                  <p className="text-3xl font-bold text-brand-900 mb-8">{formatPrice(selectedProduct.price)}</p>
                  <div className="prose prose-brand mb-8">
                    <p className="text-brand-600 text-lg leading-relaxed">
                      {selectedProduct.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-brand-500">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Premium quality materials</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ethically sourced and produced</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2-year manufacturer warranty</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => addToCart(selectedProduct)}
                      className="flex-grow bg-brand-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {t.addToCart}
                    </button>
                    <button className="p-4 rounded-2xl border border-brand-200 hover:bg-brand-100 transition-colors">
                      <User className="w-6 h-6 text-brand-600" />
                    </button>
                  </div>
                  
                  <p className="mt-6 text-sm text-brand-400 text-center">
                    {t.freeShipping}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'cart' && (
            <motion.div 
              key="cart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <h1 className="text-3xl font-serif font-bold text-brand-900 mb-8">{t.cartTitle}</h1>
              
              {cart.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-brand-200">
                  <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-12 h-12 text-brand-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-900 mb-2">{t.emptyCart}</h2>
                  <p className="text-brand-500 mb-8">{t.emptyCartSub}</p>
                  <button 
                    onClick={() => setView('shop')}
                    className="bg-brand-900 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-800 transition-all"
                  >
                    {t.startShopping}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-brand-200 flex gap-4 items-center">
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-brand-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold text-brand-900">{item.name}</h3>
                            <p className="text-sm text-brand-500 mb-2">{item.category}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center border border-brand-200 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1.5 hover:bg-brand-100 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-1 text-sm font-bold">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1.5 hover:bg-brand-100 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-brand-900">{formatPrice(item.price * item.quantity)}</p>
                            <p className="text-xs text-brand-400">{formatPrice(item.price)} l'unité</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-brand-200 shadow-sm">
                      <h3 className="text-xl font-bold text-brand-900 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t.contactInfo}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">{t.name}</label>
                          <input 
                            type="text" 
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                            placeholder="Jean Dupont"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">{t.whatsapp}</label>
                          <input 
                            type="tel" 
                            value={customerInfo.whatsapp}
                            onChange={(e) => setCustomerInfo({...customerInfo, whatsapp: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                            placeholder="+221 ..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">{t.phone}</label>
                          <input 
                            type="tel" 
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                            placeholder="+221 ..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-brand-700 mb-2">{t.city}</label>
                          <input 
                            type="text" 
                            value={customerInfo.city}
                            onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                            placeholder="Dakar"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-brand-700 mb-2">{t.shippingAddress}</label>
                          <textarea 
                            rows={2}
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none"
                            placeholder="Rue 12, Quartier ..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl border border-brand-200 h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-brand-900 mb-6">{t.orderSummary}</h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-brand-600">
                        <span>{t.subtotal}</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-brand-600">
                        <span>{t.shipping}</span>
                        <span>{cartTotal > 100000 ? 'GRATUIT' : formatPrice(5000)}</span>
                      </div>
                      <div className="flex justify-between text-brand-600">
                        <span>{t.tax}</span>
                        <span>{formatPrice(cartTotal * 0.08)}</span>
                      </div>
                      <div className="pt-4 border-t border-brand-200 flex justify-between font-bold text-xl text-brand-900">
                        <span>{t.total}</span>
                        <span>{formatPrice(cartTotal + (cartTotal > 100000 ? 0 : 5000) + (cartTotal * 0.08))}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setView('checkout')}
                      className="w-full bg-brand-900 text-white py-4 rounded-2xl font-bold hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20"
                    >
                      {t.checkout}
                    </button>
                    <button 
                      onClick={confirmOrderWhatsApp}
                      className="w-full mt-3 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {t.confirmWhatsApp}
                    </button>
                    <button 
                      onClick={() => setView('shop')}
                      className="w-full mt-4 text-brand-500 font-medium hover:text-brand-900 transition-colors"
                    >
                      {t.continueShopping}
                    </button>

                    <div className="mt-8 pt-6 border-t border-brand-100">
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-3">{t.acceptedPayments}</p>
                      <a 
                        href="https://i-pay.money/merchant_payment_desks/671173902392" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-900 transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Voir les modes de paiement sur i-Pay</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto px-4 py-12"
            >
              <div className="bg-white rounded-3xl p-8 md:p-16 border border-brand-200 shadow-xl text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-brand-900 mb-4">{t.orderConfirmed}</h1>
                <p className="text-brand-500 text-lg mb-8">
                  {t.orderSub}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                  <div className="bg-brand-50 rounded-2xl p-6">
                    <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {t.deliveryDetails}
                    </h3>
                    <div className="space-y-2 text-sm text-brand-600">
                      <p className="font-bold text-brand-900">{customerInfo.name}</p>
                      <p>{customerInfo.address}, {customerInfo.city}</p>
                      <p>{customerInfo.phone}</p>
                      <div className="pt-4 border-t border-brand-200 mt-4">
                        <p>{t.estDelivery}</p>
                        <p>{t.carrier}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-900 text-white rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {t.paymentLink}
                      </h3>
                      <p className="text-sm text-brand-300 mb-6">
                        Cliquez sur le lien ci-dessous pour effectuer votre paiement sécurisé via notre partenaire.
                      </p>
                    </div>
                    <a 
                      href="https://i-pay.money/merchant_payment_desks/671173902392"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-brand-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-100 transition-all"
                    >
                      {t.payNow}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <button 
                  onClick={() => { clearCart(); setView('shop'); }}
                  className="text-brand-500 font-bold hover:text-brand-900 transition-all"
                >
                  {t.returnToShop}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'admin' && !isAdminLoggedIn && (
            <motion.div 
              key="admin-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto px-4 py-24"
            >
              <div className="bg-white p-8 rounded-3xl border border-brand-200 shadow-xl">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-serif font-bold text-brand-900 mb-2">{t.loginTitle}</h1>
                  <p className="text-brand-500">{t.loginSub}</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-2">{t.password}</label>
                    <input 
                      type="password" 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                      placeholder="••••••••"
                    />
                    {loginError && <p className="text-red-500 text-xs mt-2">{t.invalidLogin}</p>}
                  </div>
                  <button className="w-full bg-brand-900 text-white py-4 rounded-xl font-bold hover:bg-brand-800 transition-all">
                    {t.login}
                  </button>
                </form>
                <p className="mt-4 text-center text-xs text-brand-400">Indice: admin123</p>
              </div>
            </motion.div>
          )}

          {view === 'admin' && isAdminLoggedIn && (
            <motion.div 
              key="admin-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-brand-900">{t.adminTitle}</h1>
                  <p className="text-brand-500">{t.adminSub}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAdminLoggedIn(false)}
                    className="px-6 py-3 rounded-xl font-bold text-brand-600 hover:bg-brand-100 transition-all"
                  >
                    {t.logout}
                  </button>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-brand-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-800 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    {t.addProduct}
                  </button>
                </div>
              </div>

              {isAddingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-serif font-bold text-brand-900">{t.addProduct}</h2>
                      <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-brand-100 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productName}</label>
                        <input 
                          required
                          type="text" 
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productDesc}</label>
                        <textarea 
                          required
                          rows={3}
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productPrice}</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productCategory}</label>
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none"
                        >
                          {categories.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productStock}</label>
                        <input 
                          required
                          type="number" 
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.productImage}</label>
                        <input 
                          type="text" 
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-900 outline-none" 
                          placeholder="https://..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-brand-700 mb-2">{t.uploadImage}</label>
                        <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-brand-200 border-dashed rounded-xl cursor-pointer bg-brand-50 hover:bg-brand-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {newProduct.image && newProduct.image.startsWith('data:') ? (
                                <img src={newProduct.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg mb-2" />
                              ) : (
                                <Upload className="w-8 h-8 text-brand-400 mb-2" />
                              )}
                              <p className="text-xs text-brand-500">PNG, JPG ou GIF</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="flex-grow py-4 rounded-xl font-bold border border-brand-200 hover:bg-brand-100 transition-all"
                        >
                          {t.cancel}
                        </button>
                        <button 
                          type="submit"
                          className="flex-grow bg-brand-900 text-white py-4 rounded-xl font-bold hover:bg-brand-800 transition-all"
                        >
                          {t.save}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-brand-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-brand-50 border-b border-brand-200">
                      <th className="px-6 py-4 text-sm font-bold text-brand-900">{t.product}</th>
                      <th className="px-6 py-4 text-sm font-bold text-brand-900">{t.category}</th>
                      <th className="px-6 py-4 text-sm font-bold text-brand-900">{t.price}</th>
                      <th className="px-6 py-4 text-sm font-bold text-brand-900">{t.stock}</th>
                      <th className="px-6 py-4 text-sm font-bold text-brand-900">{t.status}</th>
                      <th className="px-6 py-4 text-sm font-bold text-brand-900 text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-100">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <span className="font-medium text-brand-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-brand-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm font-bold text-brand-900">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4 text-sm text-brand-600">{product.stock} units</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            product.stock > 10 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          )}>
                            {product.stock > 10 ? t.inStock : t.lowStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-brand-400 hover:text-brand-900 transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-brand-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-white py-16 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-2xl font-serif font-bold mb-6">
                <ShoppingBag className="w-8 h-8" />
                <span>KumbiMarket</span>
              </div>
              <p className="text-brand-400 text-sm leading-relaxed">
                {t.footerDesc}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t.footerShop}</h4>
              <ul className="space-y-4 text-sm text-brand-400">
                <li><button onClick={() => setView('new-arrivals')} className="hover:text-white transition-colors">{t.shopNew}</button></li>
                <li><button onClick={() => setView('best-sellers')} className="hover:text-white transition-colors">{t.bestSellers}</button></li>
                <li><button onClick={() => setView('collections')} className="hover:text-white transition-colors">{t.collections}</button></li>
                <li><button onClick={() => setView('sale')} className="hover:text-white transition-colors">{t.sale}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t.footerSupport}</h4>
              <ul className="space-y-4 text-sm text-brand-400">
                <li><button onClick={() => setView('shipping')} className="hover:text-white transition-colors">{t.shippingTitle}</button></li>
                <li><button onClick={() => setView('returns')} className="hover:text-white transition-colors">{t.returnsTitle}</button></li>
                <li><button onClick={() => setView('faq')} className="hover:text-white transition-colors">{t.faqTitle}</button></li>
                <li><button onClick={() => setView('contact')} className="hover:text-white transition-colors">{t.contactTitle}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">{t.acceptedPayments}</h4>
              <a 
                href="https://i-pay.money/merchant_payment_desks/671173902392" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-brand-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Paiements sécurisés via i-Pay</span>
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-brand-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-500">
            <p>© 2026 KumbiMarket. {t.rights}</p>
            <div className="flex gap-6">
              <button className="hover:text-white transition-colors">{t.privacy}</button>
              <button className="hover:text-white transition-colors">{t.terms}</button>
              <button className="hover:text-white transition-colors">{t.cookie}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
