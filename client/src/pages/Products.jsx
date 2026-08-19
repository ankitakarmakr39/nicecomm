import { useEffect, useMemo, useState } from "react";
import "./Products.css";

function Products() {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);

    const emptyForm = {
        name: "",
        sku: "",
        price: "",
        stock: "",
        category: "",
        status: "active",
    };

    const [formData, setFormData] = useState(emptyForm);
    const [editFormData, setEditFormData] = useState(emptyForm);

    /* =====================================================
       FETCH PRODUCTS
    ===================================================== */

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setProductsError("Authentication token not found.");
            return;
        }

        setProductsLoading(true);
        setProductsError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/products",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setProductsError(
                    data.message || "Unable to fetch products."
                );
                return;
            }

            if (Array.isArray(data)) {
                setProducts(data);
            } else if (Array.isArray(data.products)) {
                setProducts(data.products);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Fetch Products Error:", error);
            setProductsError("Unable to connect to server.");
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* =====================================================
       ADD PRODUCT
    ===================================================== */

    const handleAddProduct = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/products",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...formData,
                        price: Number(formData.price),
                        stock: Number(formData.stock),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to create product.");
                return;
            }

            alert("Product created successfully.");

            setFormData(emptyForm);
            setShowAddModal(false);

            fetchProducts();
        } catch (error) {
            console.error("Add Product Error:", error);
            alert("Unable to connect to server.");
        }
    };

    /* =====================================================
       OPEN EDIT MODAL
    ===================================================== */

    const handleEditProduct = (product) => {
        setEditingProductId(product.id);

        setEditFormData({
            name: product.name || "",
            sku: product.sku || "",
            price: product.price ?? "",
            stock: product.stock ?? "",
            category: product.category || "",
            status: product.status || "active",
        });

        setShowEditModal(true);
    };

    /* =====================================================
       EDIT INPUT
    ===================================================== */

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;

        setEditFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =====================================================
       UPDATE PRODUCT
    ===================================================== */

    const handleUpdateProduct = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        if (!editingProductId) {
            alert("Product ID not found.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/products/${editingProductId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...editFormData,
                        price: Number(editFormData.price),
                        stock: Number(editFormData.stock),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to update product.");
                return;
            }

            alert("Product updated successfully.");

            closeEditModal();
            fetchProducts();
        } catch (error) {
            console.error("Update Product Error:", error);
            alert("Unable to connect to server.");
        }
    };

    /* =====================================================
       DELETE PRODUCT
    ===================================================== */

    const handleDeleteProduct = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/products/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to delete product.");
                return;
            }

            alert("Product deleted successfully.");

            fetchProducts();
        } catch (error) {
            console.error("Delete Product Error:", error);
            alert("Unable to connect to server.");
        }
    };



    /* =====================================================
     ADD TO CART
  ===================================================== */

    const handleAddToCart = async (product) => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Authentication token not found.");
            return;
        }

        if (Number(product.stock) <= 0) {
            alert("This product is out of stock.");
            return;
        }

        if (String(product.status || "").toLowerCase() !== "active") {
            alert("This product is not active.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/cart/items",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        product_id: product.id,
                        quantity: 1,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to add product to cart.");
                return;
            }

            alert("Product added to cart successfully.");
        } catch (error) {
            console.error("Add To Cart Error:", error);
            alert("Unable to connect to server.");
        }
    };
    /* =====================================================
       ADD INPUT
    ===================================================== */

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =====================================================
       CLOSE EDIT MODAL
    ===================================================== */

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingProductId(null);
        setEditFormData(emptyForm);
    };

    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                (product.name || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (product.sku || "")
                    .toLowerCase()
                    .includes(searchText) ||
                (product.category || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                String(product.status || "").toLowerCase() ===
                statusFilter;

            const matchesCategory =
                categoryFilter === "all" ||
                product.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [
        products,
        search,
        statusFilter,
        categoryFilter,
    ]);

    /* =====================================================
       STATISTICS
    ===================================================== */

    const totalProducts = products.length;

    const activeProducts = products.filter(
        (product) =>
            String(product.status || "").toLowerCase() === "active"
    ).length;

    const outOfStockProducts = products.filter(
        (product) => Number(product.stock) <= 0
    ).length;

    const lowStockProducts = products.filter(
        (product) =>
            Number(product.stock) > 0 &&
            Number(product.stock) <= 10
    ).length;

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = [
        ...new Set(
            products
                .map((product) => product.category)
                .filter(Boolean)
        ),
    ];

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <section className="products-page">

            {/* PAGE HEADER */}

            <div className="products-page-header">
                <div>
                    <span className="products-eyebrow">
                        PRODUCT MANAGEMENT
                    </span>

                    <h1>Products</h1>

                    <p>
                        Manage your product catalogue,
                        inventory and product information.
                    </p>
                </div>

                <button
                    className="add-product-button"
                    onClick={() => setShowAddModal(true)}
                >
                    <span>+</span>
                    Add Product
                </button>
            </div>

            {/* STATISTICS */}

            <div className="product-stats">

                <div className="product-stat-card">
                    <div className="product-stat-icon blue">
                        📦
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>{totalProducts}</strong>
                    </div>
                </div>

                <div className="product-stat-card">
                    <div className="product-stat-icon purple">
                        ✓
                    </div>

                    <div>
                        <span>Active Products</span>
                        <strong>{activeProducts}</strong>
                    </div>
                </div>

                <div className="product-stat-card">
                    <div className="product-stat-icon orange">
                        ⚠
                    </div>

                    <div>
                        <span>Low Stock</span>
                        <strong>{lowStockProducts}</strong>
                    </div>
                </div>

                <div className="product-stat-card">
                    <div className="product-stat-icon green">
                        ⛔
                    </div>

                    <div>
                        <span>Out of Stock</span>
                        <strong>{outOfStockProducts}</strong>
                    </div>
                </div>

            </div>

            {/* TABLE CARD */}

            <div className="products-table-card">

                {/* TOOLBAR */}

                <div className="products-toolbar">

                    <div className="products-toolbar-left">
                        <h3>All Products</h3>

                        <span className="product-count">
                            {filteredProducts.length} products
                        </span>
                    </div>

                    <div className="products-toolbar-right">

                        {/* SEARCH */}

                        <div className="product-search">
                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />
                        </div>

                        {/* CATEGORY FILTER */}

                        <select
                            className="product-filter"
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
                            }
                        >
                            <option value="all">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>

                        {/* STATUS FILTER */}

                        <select
                            className="product-filter"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>

                            <option value="draft">
                                Draft
                            </option>
                        </select>

                        {/* REFRESH */}

                        <button
                            className="product-refresh-button"
                            onClick={fetchProducts}
                            title="Refresh products"
                        >
                            ↻
                        </button>

                    </div>
                </div>

                {/* LOADING */}

                {productsLoading && (
                    <div className="products-loading">
                        <div className="product-loading-spinner"></div>

                        <span>
                            Loading products...
                        </span>
                    </div>
                )}

                {/* ERROR */}

                {!productsLoading && productsError && (
                    <div className="products-error-box">

                        <div className="product-error-icon">
                            !
                        </div>

                        <div>
                            <strong>
                                Unable to load products
                            </strong>

                            <p>
                                {productsError}
                            </p>
                        </div>

                        <button onClick={fetchProducts}>
                            Try Again
                        </button>

                    </div>
                )}

                {/* EMPTY */}

                {!productsLoading &&
                    !productsError &&
                    filteredProducts.length === 0 && (
                        <div className="products-empty">

                            <div className="empty-product-icon">
                                📦
                            </div>

                            <h3>
                                No products found
                            </h3>

                            <p>
                                Try changing your search or
                                add a new product.
                            </p>

                        </div>
                    )}

                {/* TABLE */}

                {!productsLoading &&
                    !productsError &&
                    filteredProducts.length > 0 && (

                        <div className="products-table-wrapper">

                            <table className="professional-products-table">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredProducts.map((product) => {

                                        const initials =
                                            (product.name || "P")
                                                .split(" ")
                                                .map((word) =>
                                                    word.charAt(0)
                                                )
                                                .join("")
                                                .slice(0, 2)
                                                .toUpperCase();

                                        const stock =
                                            Number(product.stock) || 0;

                                        let stockClass = "";

                                        if (stock <= 0) {
                                            stockClass = "out";
                                        } else if (stock <= 10) {
                                            stockClass = "low";
                                        }

                                        const productStatus =
                                            String(
                                                product.status || "active"
                                            ).toLowerCase();

                                        return (
                                            <tr key={product.id}>

                                                {/* ID */}

                                                <td>
                                                    <span className="product-id">
                                                        #{product.id}
                                                    </span>
                                                </td>

                                                {/* PRODUCT */}

                                                <td>
                                                    <div className="table-product">

                                                        <div className="product-avatar">
                                                            {initials}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {product.name ||
                                                                    "Unnamed Product"}
                                                            </strong>

                                                            <span>
                                                                NiceComm Product
                                                            </span>
                                                        </div>

                                                    </div>
                                                </td>

                                                {/* SKU */}

                                                <td>
                                                    <span className="product-sku">
                                                        {product.sku || "—"}
                                                    </span>
                                                </td>

                                                {/* CATEGORY */}

                                                <td>
                                                    <span className="category-badge">
                                                        {product.category ||
                                                            "General"}
                                                    </span>
                                                </td>

                                                {/* PRICE */}

                                                <td>
                                                    <span className="product-price">
                                                        ₹
                                                        {Number(
                                                            product.price || 0
                                                        ).toLocaleString("en-IN")}
                                                    </span>
                                                </td>

                                                {/* STOCK */}

                                                <td>
                                                    <span
                                                        className={`stock-badge ${stockClass}`}
                                                    >
                                                        {stock}
                                                    </span>
                                                </td>

                                                {/* STATUS */}

                                                <td>
                                                    <span
                                                        className={`product-status ${productStatus}`}
                                                    >
                                                        <span className="status-dot"></span>

                                                        {productStatus}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}

                                                <td>
                                                    <div className="product-actions">

                                                        <button
                                                            type="button"
                                                            className="product-action-button cart"
                                                            title="Add to cart"
                                                            onClick={() =>
                                                                handleAddToCart(product)
                                                            }
                                                            disabled={
                                                                Number(product.stock) <= 0 ||
                                                                String(product.status || "").toLowerCase() !== "active"
                                                            }
                                                        >
                                                            🛒
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="product-action-button edit"
                                                            title="Edit product"
                                                            onClick={() =>
                                                                handleEditProduct(product)
                                                            }
                                                        >
                                                            ✎
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="product-action-button delete"
                                                            title="Delete product"
                                                            onClick={() =>
                                                                handleDeleteProduct(product.id)
                                                            }
                                                        >
                                                            🗑
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>

                        </div>
                    )}
            </div>

            {/* =====================================================
          ADD PRODUCT MODAL
      ===================================================== */}

            {showAddModal && (
                <div
                    className="product-modal-overlay"
                    onClick={() =>
                        setShowAddModal(false)
                    }
                >

                    <div
                        className="product-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="product-modal-header">

                            <div>
                                <span>
                                    PRODUCT MANAGEMENT
                                </span>

                                <h2>
                                    Add New Product
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="product-modal-close"
                                onClick={() =>
                                    setShowAddModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="add-product-form"
                            onSubmit={handleAddProduct}
                        >

                            {/* NAME */}

                            <div className="product-form-field">
                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* SKU */}

                            <div className="product-form-field">
                                <label>
                                    SKU
                                </label>

                                <input
                                    type="text"
                                    name="sku"
                                    placeholder="Enter product SKU"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* PRICE + STOCK */}

                            <div className="product-form-row">

                                <div className="product-form-field">
                                    <label>
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="product-form-field">
                                    <label>
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        placeholder="0"
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                            </div>

                            {/* CATEGORY */}

                            <div className="product-form-field">
                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    placeholder="Enter category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* STATUS */}

                            <div className="product-form-field">
                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                    <option value="draft">
                                        Draft
                                    </option>
                                </select>
                            </div>

                            {/* ACTIONS */}

                            <div className="product-modal-actions">

                                <button
                                    type="button"
                                    className="product-cancel-button"
                                    onClick={() =>
                                        setShowAddModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-product-button"
                                >
                                    Create Product
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================
          EDIT PRODUCT MODAL
      ===================================================== */}

            {showEditModal && (
                <div
                    className="product-modal-overlay"
                    onClick={closeEditModal}
                >

                    <div
                        className="product-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="product-modal-header">

                            <div>
                                <span>
                                    PRODUCT MANAGEMENT
                                </span>

                                <h2>
                                    Edit Product
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="product-modal-close"
                                onClick={closeEditModal}
                            >
                                ×
                            </button>

                        </div>

                        <form
                            className="add-product-form"
                            onSubmit={handleUpdateProduct}
                        >

                            {/* NAME */}

                            <div className="product-form-field">
                                <label>
                                    Product Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter product name"
                                    value={editFormData.name}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            {/* SKU */}

                            <div className="product-form-field">
                                <label>
                                    SKU
                                </label>

                                <input
                                    type="text"
                                    name="sku"
                                    placeholder="Enter product SKU"
                                    value={editFormData.sku}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            {/* PRICE + STOCK */}

                            <div className="product-form-row">

                                <div className="product-form-field">
                                    <label>
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        min="0"
                                        step="0.01"
                                        value={editFormData.price}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>

                                <div className="product-form-field">
                                    <label>
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        name="stock"
                                        min="0"
                                        value={editFormData.stock}
                                        onChange={handleEditInputChange}
                                        required
                                    />
                                </div>

                            </div>

                            {/* CATEGORY */}

                            <div className="product-form-field">
                                <label>
                                    Category
                                </label>

                                <input
                                    type="text"
                                    name="category"
                                    placeholder="Enter category"
                                    value={editFormData.category}
                                    onChange={handleEditInputChange}
                                    required
                                />
                            </div>

                            {/* STATUS */}

                            <div className="product-form-field">
                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={editFormData.status}
                                    onChange={handleEditInputChange}
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>

                                    <option value="draft">
                                        Draft
                                    </option>
                                </select>
                            </div>

                            {/* ACTIONS */}

                            <div className="product-modal-actions">

                                <button
                                    type="button"
                                    className="product-cancel-button"
                                    onClick={closeEditModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-product-button"
                                >
                                    Update Product
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

        </section>
    );
}

export default Products;

