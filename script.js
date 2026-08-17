const productNameInput = document.getElementById("productName");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");

const addBtn = document.getElementById("addBtn");
const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("search");
const statusMessage = document.getElementById("statusMessage");

let products = [];
let editingId = null;


// ===============================
// STATUS MESSAGE
// ===============================

function showStatus(message, type = "info") {

    statusMessage.textContent = message;

    statusMessage.className = `status-message ${type}`;

}


// ===============================
// CLEAR INPUTS
// ===============================

function clearInputs() {

    productNameInput.value = "";
    categoryInput.value = "Electronics";
    priceInput.value = "";
    quantityInput.value = "";

    editingId = null;

    addBtn.textContent = "Add Product";

}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts(list = products) {

    productContainer.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {

        productContainer.innerHTML =
            "<p>No products available.</p>";

        return;
    }


    list.forEach(function (product) {

        productContainer.innerHTML += `

            <div class="product-card">

                <h3>${product.name}</h3>

                <p>
                    <strong>Category:</strong>
                    ${product.category}
                </p>

                <p>
                    <strong>Price:</strong>
                    $${product.price}
                </p>

                <p>
                    <strong>Quantity:</strong>
                    ${product.quantity}
                </p>

                <p>
                    <strong>Total Value:</strong>
                    $${Number(product.price) * Number(product.quantity)}
                </p>

                ${
                    Number(product.quantity) < 5
                    ? '<span class="low-stock">⚠ Low Stock</span>'
                    : ""
                }

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})">
                        Delete
                    </button>

                </div>

            </div>

        `;

    });

}


// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

    const totalProducts =
        document.getElementById("totalProducts");

    const lowStock =
        document.getElementById("lowStock");

    const inventoryValue =
        document.getElementById("inventoryValue");


    totalProducts.textContent = products.length;


    const lowStockCount = products.filter(function (product) {

        return Number(product.quantity) < 5;

    });


    lowStock.textContent = lowStockCount.length;


    let total = 0;


    products.forEach(function (product) {

        total +=
            Number(product.price) *
            Number(product.quantity);

    });


    inventoryValue.textContent = "$" + total;

}


// ===============================
// LOAD PRODUCTS
// ===============================

function loadProducts() {

    fetch("/products")

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            return response.json();

        })

        .then(function (data) {

            products =
                Array.isArray(data) ? data : [];

            displayProducts();

            updateDashboard();

        })

        .catch(function (error) {

            console.error(error);

            showStatus(
                "Could not connect to the server.",
                "error"
            );

        });

}


// ===============================
// ADD / UPDATE PRODUCT
// ===============================

addBtn.addEventListener("click", function () {

    const name =
        productNameInput.value.trim();

    const category =
        categoryInput.value;

    const price =
        Number(priceInput.value);

    const quantity =
        Number(quantityInput.value);


    // ===============================
    // VALIDATION
    // ===============================

    if (
        name === "" ||
        price <= 0 ||
        quantity <= 0
    ) {

        showStatus(
            "Please fill in all fields with valid values.",
            "error"
        );

        return;
    }


    // ===============================
    // PRODUCT DATA
    // ===============================

    const productData = {

        name: name,

        category: category,

        price: price,

        quantity: quantity,

        date: new Date().toLocaleDateString()

    };


    // ===============================
    // ADD PRODUCT
    // ===============================

    if (editingId === null) {

        fetch("/products", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(productData)

        })

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Failed to add product");
            }

            return response.json();

        })

        .then(function (data) {

            console.log(data);

            showStatus(
                "Product added successfully.",
                "success"
            );

            clearInputs();

            loadProducts();

        })

        .catch(function (error) {

            console.error(error);

            showStatus(
                "Could not add product.",
                "error"
            );

        });


    // ===============================
    // UPDATE PRODUCT
    // ===============================

    } else {

        fetch(`/products/${editingId}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(productData)

        })

        .then(function (response) {

            if (!response.ok) {
                throw new Error("Failed to update product");
            }

            return response.json();

        })

        .then(function (data) {

            console.log(data);

            showStatus(
                "Product updated successfully.",
                "success"
            );

            clearInputs();

            loadProducts();

        })

        .catch(function (error) {

            console.error(error);

            showStatus(
                "Could not update product.",
                "error"
            );

        });

    }

});


// ===============================
// EDIT PRODUCT
// ===============================

function editProduct(id) {

    const product = products.find(function (product) {

        return Number(product.id) === Number(id);

    });


    if (!product) {

        showStatus(
            "Product not found.",
            "error"
        );

        return;
    }


    productNameInput.value =
        product.name;

    categoryInput.value =
        product.category;

    priceInput.value =
        product.price;

    quantityInput.value =
        product.quantity;


    editingId = product.id;


    addBtn.textContent =
        "Update Product";

}


// ===============================
// DELETE PRODUCT
// ===============================

function deleteProduct(id) {

    if (!confirm("Delete this product?")) {
        return;
    }


    fetch(`/products/${id}`, {

        method: "DELETE"

    })

    .then(function (response) {

        if (!response.ok) {
            throw new Error("Failed to delete product");
        }

        return response.json();

    })

    .then(function (data) {

        console.log(data);

        showStatus(
            "Product deleted successfully.",
            "success"
        );

        loadProducts();

    })

    .catch(function (error) {

        console.error(error);

        showStatus(
            "Could not delete product.",
            "error"
        );

    });

}


// ===============================
// SEARCH PRODUCTS
// ===============================

searchInput.addEventListener("input", function () {

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();


    const filteredProducts =
        products.filter(function (product) {

            const productName =
                String(product.name)
                    .toLowerCase();

            const productCategory =
                String(product.category)
                    .toLowerCase();


            return (
                productName.includes(keyword) ||
                productCategory.includes(keyword)
            );

        });


    displayProducts(filteredProducts);

});


// ===============================
// INITIAL LOAD
// ===============================

loadProducts();