import React, { useRef, useState } from 'react';
import './ProductCartControl.css';

interface ProductCartControlProps {
  quantity: number;
  inStock: boolean;
  maxQuantity?: number;
  onAdd: () => Promise<void>;
  onQuantityChange: (quantity: number) => Promise<void>;
  className?: string;
  ready?: boolean;
}

const ProductCartControl: React.FC<ProductCartControlProps> = ({
  quantity,
  inStock,
  maxQuantity = 99,
  onAdd,
  onQuantityChange,
  className = '',
  ready = true,
}) => {
  const [updating, setUpdating] = useState(false);
  const updatingRef = useRef(false);

  const run = async (action: () => Promise<void>) => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setUpdating(true);
    try {
      await action();
    } finally {
      updatingRef.current = false;
      setUpdating(false);
    }
  };

  if (!ready) {
    return (
      <span className={`product-cart-loading ${className}`.trim()} aria-live="polite">
        Loading cart...
      </span>
    );
  }

  if (quantity > 0) {
    return (
      <div
        className={`product-cart-quantity ${className}`.trim()}
        role="group"
        aria-label={`Quantity in cart: ${quantity}`}
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Decrease cart quantity"
          disabled={updating}
          onClick={() => void run(() => onQuantityChange(quantity - 1))}
        >
          −
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          type="button"
          aria-label="Increase cart quantity"
          disabled={updating || !inStock || quantity >= maxQuantity}
          onClick={() => void run(() => onQuantityChange(quantity + 1))}
        >
          +
        </button>
      </div>
    );
  }

  if (!inStock) {
    return <span className={`product-cart-out-of-stock ${className}`.trim()}>Out of Stock</span>;
  }

  return (
    <button
      type="button"
      className={`product-cart-add ${className}`.trim()}
      disabled={updating}
      onClick={event => {
        event.stopPropagation();
        void run(onAdd);
      }}
    >
      {updating ? 'Adding...' : 'Add to Cart'}
    </button>
  );
};

export default ProductCartControl;
