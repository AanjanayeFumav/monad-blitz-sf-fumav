"use client";

import { useState } from "react";

const GAME_ITEMS = [
  {
    id: 1,
    name: "Battle Pass",
    price: 10.00,
    image: "🎖️",
    description: "Season 12 Premium Pass",
    popular: true,
  },
  {
    id: 2,
    name: "Legendary Skin",
    price: 20.00,
    image: "⚔️",
    description: "Cosmic Warrior Bundle",
  },
  {
    id: 3,
    name: "Gem Pack",
    price: 4.99,
    image: "💎",
    description: "500 Gems + Bonus",
  },
  {
    id: 4,
    name: "Starter Bundle",
    price: 14.99,
    image: "🎁",
    description: "Everything you need",
  },
];

const FUMAV_DISCOUNT_RATE = 0.03; // 3% discount for using Fumav

export default function ConsumerStore({ onPurchase }) {
  const [cart, setCart] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 1234");

  const handleAddToCart = (item) => {
    setCart(item);
  };

  const handleCheckout = async () => {
    if (!cart) return;

    setIsPurchasing(true);
    const discount = cart.price * FUMAV_DISCOUNT_RATE;
    
    // Simulate card authorization delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger the purchase flow
    await onPurchase(cart, discount);
    
    setCart(null);
    setIsPurchasing(false);
  };

  const discount = cart ? cart.price * FUMAV_DISCOUNT_RATE : 0;
  const finalPrice = cart ? cart.price - discount : 0;

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* Product Grid */}
      <div className="col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🎮</span>
          <div>
            <h2 className="text-2xl font-bold">Pixel Games Store</h2>
            <p className="text-white/40 text-sm">Exclusive in-game items</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {GAME_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`card-glass rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                cart?.id === item.id ? "ring-2 ring-fumav-purple" : ""
              }`}
              onClick={() => handleAddToCart(item)}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-fumav-purple/20 to-fumav-pink/20 flex items-center justify-center text-3xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{item.name}</h4>
                    {item.popular && (
                      <span className="px-2 py-0.5 text-xs bg-fumav-pink/20 text-fumav-pink rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-fumav-green">
                      Save ${(item.price * FUMAV_DISCOUNT_RATE).toFixed(2)} with Fumav
                    </span>
                  </div>
                </div>
              </div>
              
              {cart?.id === item.id && (
                <div className="mt-3 pt-3 border-t border-fumav-purple/30 text-center">
                  <span className="text-fumav-purple text-sm font-medium">✓ Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Panel */}
      <div className="col-span-1">
        <div className="card-glass rounded-2xl p-6 sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>💳</span> Checkout
          </h3>

          {cart ? (
            <>
              {/* Fumav Card Display */}
              <div className="bg-gradient-to-br from-fumav-purple to-fumav-pink rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-white/80 text-sm font-medium">Fumav Card</span>
                    <span className="text-xl">⚡</span>
                  </div>
                  <p className="font-mono text-lg tracking-wider mb-4">{cardNumber}</p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>PLAYER ONE</span>
                    <span>12/28</span>
                  </div>
                </div>
              </div>

              {/* Selected Item */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cart.image}</span>
                  <div>
                    <p className="font-medium">{cart.name}</p>
                    <p className="text-white/40 text-sm">{cart.description}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${cart.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-fumav-green">
                  <span className="flex items-center gap-1">
                    <span>⚡</span> Fumav Discount (3%)
                  </span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold">
                  <span>You Pay</span>
                  <span className="text-fumav-green">${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Fumav Benefits */}
              <div className="bg-fumav-purple/10 border border-fumav-purple/20 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-fumav-purple mb-2">✨ Fumav Card Benefits</p>
                <ul className="text-xs text-white/50 space-y-1">
                  <li>• 3% instant discount on every purchase</li>
                  <li>• No crypto knowledge needed</li>
                  <li>• Pay back monthly via bank transfer</li>
                </ul>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isPurchasing}
                className="w-full btn-primary py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPurchasing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    <span>💳</span> Pay ${finalPrice.toFixed(2)} with Fumav Card
                  </>
                )}
              </button>

              <p className="text-center text-white/30 text-xs mt-3">
                Secure payment • Instant merchant settlement
              </p>

              {/* Compare with traditional */}
              <div className="mt-6 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-white/30 mb-2">Without Fumav discount:</p>
                <p className="text-white/50 line-through">${cart.price.toFixed(2)}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🛒</span>
              <p className="text-white/40">Select an item to checkout</p>
              <p className="text-white/20 text-sm mt-2">Click any product card</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
