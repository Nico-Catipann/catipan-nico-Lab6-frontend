import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import NotificationModal from "../components/NotificationModal";

function Products({ onLogout }) {
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:3000";

  // =========================================
  // STATES
  // =========================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [productImage, setProductImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [notification, setNotification] =
    useState(null);

  // =========================================
  // NOTIFICATION
  // =========================================

  const showNotification = (
    type,
    title,
    message,
    afterClose = null
  ) => {
    setNotification({
      type,
      title,
      message,
      afterClose,
    });
  };

  const closeNotification = () => {
    const afterClose =
      notification?.afterClose;

    setNotification(null);

    if (afterClose) {
      afterClose();
    }
  };

  // =========================================
  // IMAGE URL
  // =========================================

  const getImageUrl = (path) => {
    if (!path) {
      return null;
    }

    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }

    return `${API_URL}/${path}`;
  };

  // =========================================
  // LOAD PRODUCTS
  // =========================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/api/products");

      setProducts(
        response.data.products || []
      );
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setError(
        error.response?.data?.error ||
          error.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================================
  // SEARCH
  // =========================================

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return products;
      }

      return products.filter(
        (product) =>
          product.product_name
            ?.toLowerCase()
            .includes(keyword) ||
          product.description
            ?.toLowerCase()
            .includes(keyword)
      );
    }, [products, search]);

  // =========================================
  // STATS
  // =========================================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.quantity || 0),
      0
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(product.quantity) <= 5
    ).length;

  // =========================================
  // FORM
  // =========================================

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // IMAGE
  // =========================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      showNotification(
        "error",
        "Invalid Image",
        "Please select a JPG, PNG, or WebP image."
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showNotification(
        "error",
        "Image Too Large",
        "The image must not exceed 5 MB."
      );

      e.target.value = "";

      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setProductImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  // =========================================
  // OPEN ADD
  // =========================================

  const openAddModal = () => {
    setSelectedProduct(null);

    setForm({
      product_name: "",
      description: "",
      price: "",
      quantity: "",
    });

    setProductImage(null);
    setImagePreview(null);

    setModal("add");
  };

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEditModal = (
    product
  ) => {
    setSelectedProduct(
      product
    );

    setForm({
      product_name:
        product.product_name || "",

      description:
        product.description || "",

      price:
        product.price ?? "",

      quantity:
        product.quantity ?? "",
    });

    setProductImage(null);

    setImagePreview(
      product.product_image
        ? getImageUrl(
            product.product_image
          )
        : null
    );

    setModal("edit");
  };

  // =========================================
  // OPEN DELETE
  // =========================================

  const openDeleteModal = (
    product
  ) => {
    setSelectedProduct(
      product
    );

    setModal("delete");
  };

  // =========================================
  // OPEN LOGOUT
  // =========================================

  const openLogoutModal = () => {
    setModal("logout");
  };

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {
    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setModal(null);

    setSelectedProduct(null);

    setProductImage(null);
    setImagePreview(null);

    setForm({
      product_name: "",
      description: "",
      price: "",
      quantity: "",
    });
  };

  // =========================================
  // ADD
  // =========================================

  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const formData =
        new FormData();

      formData.append(
        "product_name",
        form.product_name
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "quantity",
        form.quantity
      );

      if (productImage) {
        formData.append(
          "product_image",
          productImage
        );
      }

      await api.post(
        "/api/products",
        formData
      );

      closeModal();

      await loadProducts();

      showNotification(
        "success",
        "Product Added",
        "The product was added successfully."
      );
    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      showNotification(
        "error",
        "Unable to Add Product",
        error.response?.data?.error ||
          "Something went wrong while adding the product."
      );
    }
  };

  // =========================================
  // EDIT
  // =========================================

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    try {
      await api.put(
        `/api/products/${selectedProduct.id}`,
        {
          product_name:
            form.product_name,

          description:
            form.description,

          price:
            Number(form.price),

          quantity:
            Number(
              form.quantity
            ),
        }
      );

      if (productImage) {
        const imageData =
          new FormData();

        imageData.append(
          "product_image",
          productImage
        );

        await api.post(
          `/api/products/${selectedProduct.id}/image`,
          imageData
        );
      }

      closeModal();

      await loadProducts();

      showNotification(
        "success",
        "Changes Saved",
        "The product was updated successfully."
      );
    } catch (error) {
      console.error(
        "Edit product error:",
        error
      );

      showNotification(
        "error",
        "Update Failed",
        error.response?.data?.error ||
          "Unable to update the product."
      );
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      await api.delete(
        `/api/products/${selectedProduct.id}`
      );

      closeModal();

      await loadProducts();

      showNotification(
        "success",
        "Product Deleted",
        "The product was deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      showNotification(
        "error",
        "Delete Failed",
        error.response?.data?.error ||
          "Unable to delete the product."
      );
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    const refreshToken =
      localStorage.getItem(
        "refresh_token"
      );

    closeModal();

    try {
      if (refreshToken) {
        await api.post(
          "/api/logout",
          {
            refresh_token:
              refreshToken,
          }
        );
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "username"
      );

      localStorage.removeItem(
        "role"
      );

      showNotification(
        "success",
        "Logged Out",
        "You have been logged out successfully.",
        () => {
          onLogout();
        }
      );
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="inventory-shell">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className="inventory-sidebar">

        <div className="sidebar-brand">

          <div className="brand-logo">
            PM
          </div>

          <div>
            <h2>
              Inventory
            </h2>

            <span>
              Product Manager
            </span>
          </div>

        </div>


        <div className="sidebar-section">

          <span className="sidebar-label">
            MENU
          </span>


          <button
            className="sidebar-item active"
            type="button"
          >
            <span className="sidebar-icon">
              ▦
            </span>

            Products
          </button>

        </div>


        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-avatar">

              {(
                localStorage.getItem(
                  "username"
                ) || "A"
              )
                .charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <strong>
                {localStorage.getItem(
                  "username"
                )}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>


          <button
            className="sidebar-logout"
            type="button"
            onClick={
              openLogoutModal
            }
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </div>

      </aside>


      {/* =====================================
          MAIN AREA
      ===================================== */}

      <div className="inventory-main">

        {/* TOP BAR */}

        <header className="inventory-topbar">

          <div className="topbar-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <div className="topbar-account">

            <div className="topbar-avatar">

              {(
                localStorage.getItem(
                  "username"
                ) || "A"
              )
                .charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <strong>
                {localStorage.getItem(
                  "username"
                )}
              </strong>

              <span>
                Admin
              </span>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <main className="inventory-content">

          {/* HEADER */}

          <div className="inventory-page-header">

            <div>

              <span className="page-eyebrow">
                INVENTORY
              </span>

              <h1>
                Products
              </h1>

              <p>
                Manage your products and
                monitor current inventory.
              </p>

            </div>


            <button
              className="inventory-add-btn"
              type="button"
              onClick={
                openAddModal
              }
            >
              + Add Product
            </button>

          </div>


          {/* STATS */}

          <div className="inventory-stats">

            <div className="stat-card">

              <span>
                Total Products
              </span>

              <strong>
                {totalProducts}
              </strong>

            </div>


            <div className="stat-card">

              <span>
                Total Stock
              </span>

              <strong>
                {totalStock}
              </strong>

            </div>


            <div className="stat-card">

              <span>
                Low Stock
              </span>

              <strong>
                {lowStock}
              </strong>

            </div>

          </div>


          {/* MOBILE SEARCH */}

          <div className="mobile-product-search">

            <span>
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}


          {/* PRODUCTS */}

          {loading ? (

            <div className="products-empty">
              Loading products...
            </div>

          ) : filteredProducts.length ===
            0 ? (

            <div className="products-empty">

              <div className="empty-box-icon">
                □
              </div>

              <h3>
                No products found
              </h3>

              <p>
                {search
                  ? "Try another search keyword."
                  : "Add your first product to get started."}
              </p>

            </div>

          ) : (

            <div className="product-grid">

              {filteredProducts.map(
                (product) => (

                <article
                  className="product-card"
                  key={product.id}
                >

                  {/* IMAGE */}

                  <div className="product-card-image">

                    {product.product_image ? (

                      <img
                        src={getImageUrl(
                          product.product_image
                        )}
                        alt={
                          product.product_name
                        }
                      />

                    ) : (

                      <div className="product-card-placeholder">

                        <span>
                          □
                        </span>

                        <small>
                          No Image
                        </small>

                      </div>

                    )}


                    <span className="product-id">
                      #{product.id}
                    </span>

                  </div>


                  {/* BODY */}

                  <div className="product-card-body">

                    <div className="product-card-title-row">

                      <h3>
                        {
                          product.product_name
                        }
                      </h3>

                    </div>


                    <p className="product-description">

                      {product.description ||
                        "No description available."}

                    </p>


                    <div className="product-card-price">

                      ₱
                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-PH",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}

                    </div>


                    <div className="product-card-meta">

                      <div>

                        <span>
                          Stock
                        </span>

                        <strong
                          className={
                            Number(
                              product.quantity
                            ) <= 5
                              ? "low-stock"
                              : ""
                          }
                        >
                          {product.quantity}{" "}
                          units
                        </strong>

                      </div>


                      <div>

                        <span>
                          Status
                        </span>

                        <strong>

                          {Number(
                            product.quantity
                          ) > 0
                            ? "Available"
                            : "Out of stock"}

                        </strong>

                      </div>

                    </div>


                    <div className="product-card-actions">

                      <button
                        className="card-edit-btn"
                        type="button"
                        onClick={() =>
                          openEditModal(
                            product
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="card-delete-btn"
                        type="button"
                        onClick={() =>
                          openDeleteModal(
                            product
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </main>

      </div>


      {/* =====================================
          ADD / EDIT MODAL
      ===================================== */}

      {(modal === "add" ||
        modal === "edit") && (

        <div className="modal-overlay">

          <div className="modal product-form-modal">

            <div className="modal-header">

              <div>

                <h2>

                  {modal === "add"
                    ? "Add Product"
                    : "Edit Product"}

                </h2>

                <p>

                  {modal === "add"
                    ? "Add a new product to your inventory."
                    : "Update the product information."}

                </p>

              </div>


              <button
                type="button"
                className="close-btn"
                onClick={
                  closeModal
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                modal === "add"
                  ? handleAdd
                  : handleEdit
              }
            >

              {/* IMAGE */}

              <div className="form-group">

                <label>
                  Product Image
                </label>


                <div className="product-image-upload">

                  <div className="product-image-preview">

                    {imagePreview ? (

                      <img
                        src={
                          imagePreview
                        }
                        alt="Product preview"
                      />

                    ) : (

                      <div className="image-placeholder">

                        <span>
                          □
                        </span>

                        <small>
                          No image selected
                        </small>

                      </div>

                    )}

                  </div>


                  <div className="image-picker-row">

                    <label className="image-upload-button">

                      {imagePreview
                        ? "Change Image"
                        : "Choose Image"}

                      <input
                        type="file"
                        hidden
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={
                          handleImageChange
                        }
                      />

                    </label>


                    <span className="image-help">
                      JPG, PNG or WebP ·
                      Max 5 MB
                    </span>

                  </div>

                </div>

              </div>


              {/* NAME */}

              <div className="form-group">

                <label>
                  Product Name
                </label>

                <input
                  type="text"
                  name="product_name"
                  placeholder="Enter product name"
                  value={
                    form.product_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  rows="4"
                  placeholder="Enter product description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              {/* PRICE / QTY */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={
                      form.price
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    min="0"
                    value={
                      form.quantity
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>


              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="primary-btn"
                >

                  {modal === "add"
                    ? "Add Product"
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =====================================
          DELETE MODAL
      ===================================== */}

      {modal === "delete" &&
        selectedProduct && (

        <div className="modal-overlay">

          <div className="modal confirmation-modal">

            <div className="danger-confirm-icon">
              !
            </div>


            <h2>
              Delete Product?
            </h2>


            <p>

              Are you sure you want to
              delete{" "}

              <strong>
                {
                  selectedProduct
                    .product_name
                }
              </strong>
              ?

            </p>


            <span className="confirmation-note">
              This action cannot be undone.
            </span>


            <div className="confirmation-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="delete-confirm-btn"
                onClick={
                  handleDelete
                }
              >
                Delete Product
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          LOGOUT MODAL
      ===================================== */}

      {modal === "logout" && (

        <div className="modal-overlay">

          <div className="modal confirmation-modal">

            <div className="neutral-confirm-icon">
              ?
            </div>


            <h2>
              Log Out?
            </h2>


            <p>
              Are you sure you want to
              log out of your account?
            </p>


            <span className="confirmation-note">
              You will need to sign in
              again to manage products.
            </span>


            <div className="confirmation-actions">

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="primary-btn"
                onClick={
                  handleLogout
                }
              >
                Log Out
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          NOTIFICATION
      ===================================== */}

      {notification && (

        <NotificationModal
          type={
            notification.type
          }
          title={
            notification.title
          }
          message={
            notification.message
          }
          onClose={
            closeNotification
          }
        />

      )}

    </div>
  );
}

export default Products;