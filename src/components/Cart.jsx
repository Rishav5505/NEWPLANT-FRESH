import React from "react";
import { toINR, formatINR } from "../utils/priceUtils";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Cart = ({ showCart, setShowCart, cartItems = [], updateQuantity, removeItem, setCurrentPage, setPaymentOrderId }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // USD
  const tax = subtotal * 0.1; // USD
  const shipping = cartItems.length > 0 ? 5 : 0; // USD
  const total = subtotal + tax + shipping; // USD
  const subtotalINR = toINR(subtotal);
  const taxINR = toINR(tax);
  const shippingINR = toINR(shipping);
  const totalINR = toINR(total);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState('cod');

  return (
    <>
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full md:w-96 bg-[#0a1a12] border-l-2 border-green-600 rounded-t-3xl p-6 max-h-screen overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-green-400">🛒 Shopping Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-3xl text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-400 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-green-900/20 border border-green-700 p-4 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-4xl">{item.emoji}</div>
                        <div className="flex-1">
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-green-400">{formatINR(toINR(item.price))}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white font-bold"
                        >
                          −
                        </button>
                        <span className="px-3 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-white font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-500 hover:text-red-400 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-green-700 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>{formatINR(subtotalINR)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax (10%):</span>
                    <span>{formatINR(taxINR)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping:</span>
                    <span>{formatINR(shippingINR)}</span>
                  </div>
                  <div className="flex justify-between text-green-400 text-xl font-bold border-t border-green-700 pt-2">
                    <span>Total:</span>
                    <span>{formatINR(totalINR)}</span>
                  </div>
                </div>

                {/* Checkout Buttons */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={async () => {
                      // Immediate test-payment flow: create order with default 'card' method and redirect to payment test page
                      const token = localStorage.getItem('auth_token');
                      if (!token) {
                        window.dispatchEvent(new Event('open-login'));
                        alert('Please login or sign up before placing an order');
                        return;
                      }

                      const items = cartItems.map((it) => ({ productId: it.id, name: it.name, price: toINR(it.price), quantity: it.quantity, emoji: it.emoji }));
                      console.log('Creating test order and redirecting to payment', { items, API_BASE });
                      try {
                        const resp = await fetch(`${API_BASE}/api/orders`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                          body: JSON.stringify({ items, paymentMethod: 'card' }),
                        });
                        const data = await resp.json();
                        if (!data.success) {
                          alert(data.message || 'Order failed');
                          return;
                        }

                        // navigate to payment test page for non-COD
                        if (typeof setPaymentOrderId === 'function') setPaymentOrderId(data.orderId);
                        setShowCart(false);
                        setCurrentPage?.('payment');
                      } catch (err) {
                        console.error('Place order error', err);
                        alert('Order error');
                      }
                    }}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition transform hover:scale-105"
                  >
                    ✅ Place Order
                  </button>
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-full py-3 border border-green-600 hover:bg-green-600/10 text-white font-bold rounded-lg transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a1a12] border-2 border-green-700 rounded-2xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-green-300">Choose Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: 'card', label: 'Card (Debit/Credit)' },
                { key: 'upi', label: 'UPI' },
                { key: 'netbanking', label: 'Net Banking' },
                { key: 'cod', label: 'Cash on Delivery (COD)' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedPayment(opt.key)}
                  className={`text-left px-4 py-3 rounded-lg border ${selectedPayment === opt.key ? 'border-green-400 bg-green-900/30' : 'border-green-700'} text-white`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={async () => {
                  // perform order placement with paymentMethod
                  const token = localStorage.getItem('auth_token');
                  if (!token) {
                    // open the global login modal (Navbar listens for this event)
                    window.dispatchEvent(new Event('open-login'));
                    alert('Please login or sign up before placing an order');
                    setShowPaymentModal(false);
                    return;
                  }

                  const items = cartItems.map((it) => ({ productId: it.id, name: it.name, price: toINR(it.price), quantity: it.quantity, emoji: it.emoji }));
                  console.log('Placing order', { items, paymentMethod: selectedPayment, API_BASE });
                  try {
                    const resp = await fetch(`${API_BASE}/api/orders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify({ items, paymentMethod: selectedPayment }),
                    });
                    let data;
                    try {
                      data = await resp.json();
                    } catch (parseErr) {
                      console.error('Failed to parse response', parseErr);
                      alert('Order failed: invalid server response');
                      return;
                    }
                      // If payment method is COD we can finish here. For other methods, redirect to payment test page.
                      if (selectedPayment === 'cod') {
                        cartItems.forEach((it) => removeItem(it.id));
                        setShowPaymentModal(false);
                        setShowCart(false);
                        alert(`Order placed! ID: ${data.orderId} — Payment: ${selectedPayment}`);
                      } else {
                        // navigate to payment test page
                        setShowPaymentModal(false);
                        setShowCart(false);
                        // pass order id to App via provided setter
                        if (typeof setPaymentOrderId === 'function') setPaymentOrderId(data.orderId);
                        setCurrentPage?.('payment');
                      }
                  } catch (err) {
                    console.error(err);
                    alert('Order error');
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold"
              >
                Confirm & Pay
              </button>

              <button onClick={() => setShowPaymentModal(false)} className="flex-1 border border-green-700 py-3 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
