import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WELLNESS_STORE_CATEGORIES } from '../data/mockData';
import { ShoppingBag, Star, Plus, Minus, Trash2, CheckCircle2, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { Modal } from '../components/Modal';

export const WellnessStoreView = () => {
  const { products, cart, orders, addToCart, removeFromCart, updateCartQty, checkoutOrder } = useApp();

  const [activeTab, setActiveTab] = useState('shop'); // shop, cart, orders
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const filteredProducts = activeCategory === 'All Products'
    ? products
    : products.filter(p => p.category === activeCategory);

  const cartTotalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shippingFee = cart.length > 0 ? 4.99 : 0;
  const grandTotal = cartSubtotal + shippingFee;

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-xl mx-auto px-4 pt-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>FemCare Wellness Store</span>
            <span className="text-xl">🛍️</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curated organic period care, natural supplements & soothing comfort items
          </p>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700">
        {[
          { id: 'shop', label: 'Store Catalog' },
          { id: 'cart', label: `Cart (${cartTotalItems})` },
          { id: 'orders', label: `Order History (${orders.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SHOP CATALOG */}
      {activeTab === 'shop' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {WELLNESS_STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                  activeCategory === cat
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-pink-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950 text-2xl flex items-center justify-center">
                      {product.image}
                    </div>
                    <span className="text-[10px] font-extrabold text-pink-800 dark:text-pink-200 bg-pink-50 dark:bg-pink-950/80 border border-pink-200 dark:border-pink-800 px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-bold text-xs text-slate-900 dark:text-slate-100 cursor-pointer hover:text-pink-600 line-clamp-2"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">{product.rating}</span>
                      <span>({product.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                    ${product.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: SHOPPING CART */}
      {activeTab === 'cart' && (
        <div className="space-y-4 animate-fade-in">
          {cart.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-500">Your shopping cart is empty</div>
              <button
                onClick={() => setActiveTab('shop')}
                className="px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl"
              >
                Browse Wellness Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.product.image}</span>
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">{item.product.name}</div>
                        <div className="text-slate-700 dark:text-slate-300 font-medium">${item.product.price.toFixed(2)} each</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1">
                        <button onClick={() => updateCartQty(item.product.id, -1)} aria-label="Decrease quantity"><Minus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /></button>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} aria-label="Increase quantity"><Plus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" /></button>
                      </div>

                      <button onClick={() => removeFromCart(item.product.id)} className="text-rose-600 dark:text-rose-400 p-1 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg cursor-pointer" aria-label="Remove item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">${cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
                  <span>Estimated Shipping</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-black text-slate-900 dark:text-slate-100">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => setCheckoutModalOpen(true)}
                  className="w-full py-3.5 mt-2 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDER HISTORY */}
      {activeTab === 'orders' && (
        <div className="space-y-3 animate-fade-in">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2"
            >
              <div className="flex justify-between font-bold">
                <span className="text-slate-900 dark:text-slate-100 font-extrabold">Order #{ord.id}</span>
                <span className="text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                  {ord.status}
                </span>
              </div>
              <div className="text-slate-700 dark:text-slate-300 font-medium">Date: {ord.date} • Total: <strong className="text-slate-900 dark:text-slate-100 font-extrabold">${ord.total.toFixed(2)}</strong></div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? selectedProduct.name : "Product Details"}
      >
        {selectedProduct && (
          <div className="space-y-4 text-xs">
            <div className="text-center py-4 bg-pink-50 dark:bg-pink-950/40 rounded-2xl text-4xl">
              {selectedProduct.image}
            </div>

            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">${selectedProduct.price.toFixed(2)}</div>
              <p className="text-slate-700 dark:text-slate-200 mt-1 leading-relaxed font-medium">{selectedProduct.description}</p>
            </div>

            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 dark:text-slate-100">Key Benefits:</div>
              {selectedProduct.benefits.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }}
              className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
            >
              Add to Shopping Cart
            </button>
          </div>
        )}
      </Modal>

      {/* CHECKOUT MODAL */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="Complete Order Checkout"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="font-extrabold text-slate-900 dark:text-slate-100">Order Total: ${grandTotal.toFixed(2)}</div>
            <div className="text-slate-700 dark:text-slate-300 font-medium">Shipping to: 123 Health Ave, San Francisco, CA</div>
          </div>

          <button
            onClick={() => {
              checkoutOrder();
              setCheckoutModalOpen(false);
              setActiveTab('orders');
            }}
            className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
          >
            Place Order (${grandTotal.toFixed(2)})
          </button>
        </div>
      </Modal>

    </div>
  );
};
