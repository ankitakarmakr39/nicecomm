import { useState } from "react";
import "./Checkout.css";

function Checkout({
  onBackToCart,
  onCheckoutComplete,
}) {
  const [formData, setFormData] = useState({
    shipping_address: "",
    shipping_city: "",
    shipping_state: "",
    shipping_country: "India",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Authentication token not found.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/checkout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Checkout failed."
        );
        return;
      }

      alert(
        `Order placed successfully! Order #${data.order.id}`
      );

      // Go to Orders page through App.jsx
      if (typeof onCheckoutComplete === "function") {
        onCheckoutComplete();
      }
    } catch (error) {
      console.error("Checkout Error:", error);

      setError(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK TO CART
  // =====================================================

  const handleBackToCart = () => {
    if (typeof onBackToCart === "function") {
      onBackToCart();
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="checkout-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="checkout-header">

        <div>

          <span className="checkout-eyebrow">
            NICECOMM COMMERCE OS
          </span>

          <h1>
            Checkout
          </h1>

          <p>
            Enter your shipping information to place
            your order.
          </p>

        </div>

        <button
          type="button"
          className="back-cart-button"
          onClick={handleBackToCart}
          disabled={loading}
        >
          ← Back to Cart
        </button>

      </div>

      {/* =================================================
          CHECKOUT LAYOUT
      ================================================= */}

      <div className="checkout-layout">

        {/* =================================================
            SHIPPING FORM
        ================================================= */}

        <div className="checkout-card">

          <div className="checkout-card-header">

            <span>
              SHIPPING INFORMATION
            </span>

            <h2>
              Delivery Address
            </h2>

          </div>

          {/* ERROR */}

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            className="checkout-form"
            onSubmit={handleCheckout}
          >

            {/* ADDRESS */}

            <div className="checkout-form-field">

              <label htmlFor="shipping_address">
                Address
              </label>

              <textarea
                id="shipping_address"
                name="shipping_address"
                placeholder="Enter your complete address"
                value={formData.shipping_address}
                onChange={handleInputChange}
                rows="4"
                required
              />

            </div>

            {/* CITY + STATE */}

            <div className="checkout-form-row">

              <div className="checkout-form-field">

                <label htmlFor="shipping_city">
                  City
                </label>

                <input
                  id="shipping_city"
                  type="text"
                  name="shipping_city"
                  placeholder="Enter city"
                  value={formData.shipping_city}
                  onChange={handleInputChange}
                  required
                />

              </div>

              <div className="checkout-form-field">

                <label htmlFor="shipping_state">
                  State
                </label>

                <input
                  id="shipping_state"
                  type="text"
                  name="shipping_state"
                  placeholder="Enter state"
                  value={formData.shipping_state}
                  onChange={handleInputChange}
                  required
                />

              </div>

            </div>

            {/* COUNTRY */}

            <div className="checkout-form-field">

              <label htmlFor="shipping_country">
                Country
              </label>

              <input
                id="shipping_country"
                type="text"
                name="shipping_country"
                value={formData.shipping_country}
                onChange={handleInputChange}
                required
              />

            </div>

            {/* ACTION BUTTONS */}

            <div className="checkout-form-actions">

              <button
                type="button"
                className="checkout-cancel-button"
                onClick={handleBackToCart}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="place-order-button"
                disabled={loading}
              >
                {loading
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

            </div>

          </form>

        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="checkout-summary-card">

          <span className="checkout-summary-eyebrow">
            ORDER SUMMARY
          </span>

          <h2>
            Secure Checkout
          </h2>

          <div className="checkout-summary-line">

            <span>
              Payment
            </span>

            <strong>
              Pending
            </strong>

          </div>

          <div className="checkout-summary-line">

            <span>
              Order Status
            </span>

            <strong>
              Pending
            </strong>

          </div>

          <div className="checkout-summary-divider"></div>

          <p>
            Your order will be created after you
            submit the shipping information.
          </p>

        </div>

      </div>

    </section>
  );
}

export default Checkout;