const productNameInput = document.getElementById("productName");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const quantityInput = document.getElementById("quantity");

const addBtn = document.getElementById("addBtn");
const productContainer = document.getElementById("productContainer");
const searchInput = document.getElementById("search");
const statusMessage = document.getElementById("statusMessage");

let products = [];
let editingIndex = null;


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

    editingIndex = null;

    addBtn.textContent = "Add Product";

}


// ===============================
// DISPLAY PRODUCTS
// ===============================

function displayProducts(list = products) {

    productContainer.innerHTML = "";

    if (!Array.isArray(list) || list.length === 0) {

        productContainer.innerHTML = "<p>No products available.</p>";

        return;
    }

    list.forEach(function (product, index) {

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
                    $${product.price * product.quantity}
                </p>

                ${
                    product.quantity < 5
                    ? '<span class="low-stock">⚠ Low Stock</span>'
                    : ""
                }

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="editProduct(${index})">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${index})">
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

        total += Number(product.price) *
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

            return response.json();

        })

        .then(function (data) {

            products = Array.isArray(data) ? data : [];

            displayProducts();

            updateDashboard();

        })

        .catch(function () {

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


    // VALIDATION

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


    // CREATE PRODUCT OBJECT

    const productData = {

        name: name,

        category: category,

        price: price,

        quantity: quantity

    };


    // ===============================
    // ADD PRODUCT
    // ===============================

    if (editingIndex === null) {

        fetch("/products", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(productData)

        })

        .then(function (response) {

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

        fetch(`/products/${editingIndex}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(productData)

        })

        .then(function (response) {

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

function editProduct(index) {

    productNameInput.value = products[index].name;

    categoryInput.value = products[index].category;

    priceInput.value = products[index].price;

    quantityInput.value = products[index].quantity;

    editingIndex = index;

    addBtn.textContent = "Update Product";

}

// ===============================
// DELETE PRODUCT
// ===============================

function deleteProduct(index) {

    if (!confirm("Delete this product?")) {
        return;
    }

    fetch(`/products/${index}`, {
        method: "DELETE"
    })

    .then(function (response) {
        return response.json();
    })

    .then(function (data) {

        console.log(data);

        loadProducts();

    })

    .catch(function (error) {

        console.error(error);

    });

}


// ===============================
// SEARCH PRODUCTS
// ===============================

searchInput.addEventListener("input", function () {

    const keyword = searchInput.value.toLowerCase().trim();

    const filteredProducts = products.filter(function (product) {

        const productName = String(product.name).toLowerCase();
        const productCategory = String(product.category).toLowerCase();

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