
import { useEffect, useState } from "react";
import "./Cart.css";

const API_URL = "http://localhost:5000/api/cart";

function Cart({ onCheckout }) {
    const [cart, setCart] = useState(null);
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // TOKEN
    // =====================================================

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =====================================================
    // FETCH CART
    // =====================================================

    const fetchCart = async () => {
        const token = getToken();

        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load cart."
                );
            }

            setCart(data.cart || null);

            setItems(
                Array.isArray(data.items)
                    ? data.items
                    : []
            );

            setTotal(Number(data.total || 0));
        } catch (err) {
            console.error("Fetch Cart Error:", err);

            setError(
                err.message || "Unable to load cart."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchCart();
    }, []);

    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatAmount = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(amount || 0));
    };

    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    const updateQuantity = async (
        item,
        newQuantity
    ) => {
        if (newQuantity < 1) {
            return;
        }

        if (
            newQuantity >
            Number(item.stock)
        ) {
            alert(
                `Only ${item.stock} item(s) available in stock.`
            );
            return;
        }

        const token = getToken();

        if (!token) {
            alert(
                "Authentication token not found."
            );
            return;
        }

        try {
            setActionLoading(true);

            const response = await fetch(
                `${API_URL}/items/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        quantity: newQuantity,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to update quantity."
                );
                return;
            }

            await fetchCart();
        } catch (err) {
            console.error(
                "Update Cart Item Error:",
                err
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // REMOVE ITEM
    // =====================================================

    const removeItem = async (itemId) => {
        const token = getToken();

        if (!token) {
            alert(
                "Authentication token not found."
            );
            return;
        }

        try {
            setActionLoading(true);

            const response = await fetch(
                `${API_URL}/items/${itemId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to remove item."
                );
                return;
            }

            await fetchCart();
        } catch (err) {
            console.error(
                "Remove Cart Item Error:",
                err
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // CLEAR CART
    // =====================================================

    const clearCart = async () => {
        if (items.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmed) {
            return;
        }

        const token = getToken();

        if (!token) {
            alert(
                "Authentication token not found."
            );
            return;
        }

        try {
            setActionLoading(true);

            const response = await fetch(
                API_URL,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.message ||
                    "Failed to clear cart."
                );
                return;
            }

            await fetchCart();
        } catch (err) {
            console.error(
                "Clear Cart Error:",
                err
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =====================================================
    // GO TO CHECKOUT
    // =====================================================

    const handleCheckout = () => {
        if (items.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // App.jsx controls the page navigation.
        // Cart -> Checkout
        if (typeof onCheckout === "function") {
            onCheckout();
        }
    };

    // =====================================================
    // TOTAL QUANTITY
    // =====================================================

    const totalQuantity = items.reduce(
        (sum, item) =>
            sum + Number(item.quantity || 0),
        0
    );

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="cart-page">

                <div className="cart-loading">

                    <div className="cart-spinner" />

                    <p>
                        Loading cart...
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="cart-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="cart-header">

                <div>

                    <span className="cart-eyebrow">
                        NICECOMM COMMERCE OS
                    </span>

                    <h1>
                        Shopping Cart
                    </h1>

                    <p>
                        Review products in your cart
                        before checkout.
                    </p>

                </div>

                <button
                    className="cart-refresh-button"
                    onClick={fetchCart}
                    disabled={actionLoading}
                >
                    ↻ Refresh
                </button>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="cart-error">

                    <div>

                        <strong>
                            Unable to load cart
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        onClick={fetchCart}
                        disabled={actionLoading}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* =================================================
                CART CONTENT
            ================================================= */}

            {!error && (
                <>
                    {items.length === 0 ? (

                        /* =================================================
                           EMPTY CART
                        ================================================= */

                        <section className="cart-empty">

                            <div className="cart-empty-icon">
                                🛒
                            </div>

                            <h2>
                                Your cart is empty
                            </h2>

                            <p>
                                There are no products
                                in your cart yet.
                            </p>

                        </section>

                    ) : (

                        /* =================================================
                           CART WITH ITEMS
                        ================================================= */

                        <section className="cart-layout">

                            {/* =================================================
                                ITEMS
                            ================================================= */}

                            <div className="cart-items-card">

                                <div className="cart-card-header">

                                    <div>

                                        <span>
                                            CART ITEMS
                                        </span>

                                        <h2>
                                            {items.length}{" "}
                                            {items.length === 1
                                                ? "Product"
                                                : "Products"}
                                        </h2>

                                    </div>

                                    <button
                                        className="cart-clear-button"
                                        onClick={clearCart}
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        Clear Cart
                                    </button>

                                </div>

                                <div className="cart-items">

                                    {items.map(
                                        (item) => (

                                            <div
                                                className="cart-item"
                                                key={item.id}
                                            >

                                                {/* PRODUCT */}

                                                <div className="cart-product">

                                                    <div className="cart-product-icon">
                                                        🛍️
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.category ||
                                                                "Product"
                                                            }
                                                        </span>

                                                        <small>
                                                            Stock:{" "}
                                                            {
                                                                item.stock
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                                {/* PRICE */}

                                                <div className="cart-price">

                                                    <span>
                                                        Price
                                                    </span>

                                                    <strong>
                                                        {formatAmount(
                                                            item.price
                                                        )}
                                                    </strong>

                                                </div>

                                                {/* QUANTITY */}

                                                <div className="cart-quantity">

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                Number(
                                                                    item.quantity
                                                                ) - 1
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ||
                                                            Number(
                                                                item.quantity
                                                            ) <= 1
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>

                                                    <strong>
                                                        {
                                                            item.quantity
                                                        }
                                                    </strong>

                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item,
                                                                Number(
                                                                    item.quantity
                                                                ) + 1
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ||
                                                            Number(
                                                                item.quantity
                                                            ) >=
                                                            Number(
                                                                item.stock
                                                            )
                                                        }
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>

                                                </div>

                                                {/* SUBTOTAL */}

                                                <div className="cart-subtotal">

                                                    <span>
                                                        Subtotal
                                                    </span>

                                                    <strong>
                                                        {formatAmount(
                                                            item.subtotal
                                                        )}
                                                    </strong>

                                                </div>

                                                {/* REMOVE */}

                                                <button
                                                    className="cart-remove-button"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                            {/* =================================================
                                SUMMARY
                            ================================================= */}

                            <aside className="cart-summary">

                                <span className="cart-summary-eyebrow">
                                    ORDER SUMMARY
                                </span>

                                <h2>
                                    Cart Total
                                </h2>

                                <div className="cart-summary-row">

                                    <span>
                                        Products
                                    </span>

                                    <strong>
                                        {items.length}
                                    </strong>

                                </div>

                                <div className="cart-summary-row">

                                    <span>
                                        Total Quantity
                                    </span>

                                    <strong>
                                        {totalQuantity}
                                    </strong>

                                </div>

                                <div className="cart-summary-divider" />

                                <div className="cart-total-row">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatAmount(
                                            total
                                        )}
                                    </strong>

                                </div>

                                {/* CHECKOUT BUTTON */}

                                <button
                                    className="cart-checkout-button"
                                    onClick={
                                        handleCheckout
                                    }
                                    disabled={
                                        actionLoading ||
                                        items.length === 0
                                    }
                                >
                                    Proceed to Checkout
                                </button>

                                <p className="cart-checkout-note">
                                    Review your shipping
                                    information before
                                    placing the order.
                                </p>

                            </aside>

                        </section>
                    )}
                </>
            )}

        </div>
    );
}

export default Cart;

