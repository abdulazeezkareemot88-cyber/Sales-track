const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the project root so index.html is reachable
app.use(express.static(path.join(__dirname)));

// Data file (matches existing file in the repo)
const DATA_FILE = path.join(__dirname, "product.json");


// ===============================
// GET PRODUCTS
// ===============================

app.get("/products", function (req, res) {

    const data = fs.readFileSync(DATA_FILE, "utf8");

    const products = JSON.parse(data);

    res.json(products);

});


// ===============================
// ADD PRODUCT
// ===============================

app.post("/products", function (req, res) {

    const newProduct = req.body;

    const data = fs.readFileSync(DATA_FILE, "utf8");

    const products = JSON.parse(data);

    products.push(newProduct);

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(products, null, 2)
    );

    res.json({
        message: "Product added successfully"
    });

});


// ===============================
// EDIT PRODUCT
// ===============================

app.put("/products/:index", function (req, res) {

    const index = Number(req.params.index);

    const updatedProduct = req.body;

    const data = fs.readFileSync(DATA_FILE, "utf8");

    const products = JSON.parse(data);


    if (index < 0 || index >= products.length) {

        return res.status(404).json({
            message: "Product not found"
        });

    }


    products[index] = updatedProduct;


    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(products, null, 2)
    );


    res.json({
        message: "Product updated successfully"
    });

});


// ===============================
// DELETE PRODUCT
// ===============================

app.delete("/products/:index", function (req, res) {

    const index = Number(req.params.index);

    const data = fs.readFileSync(DATA_FILE, "utf8");

    const products = JSON.parse(data);


    if (index < 0 || index >= products.length) {

        return res.status(404).json({
            message: "Product not found"
        });

    }


    products.splice(index, 1);


    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(products, null, 2)
    );


    res.json({
        message: "Product deleted successfully"
    });

});


// ===============================
// START SERVER
// ===============================

if (require.main === module) {
    app.listen(PORT, function () {
        console.log(
            `Server is running on http://localhost:${PORT}`
        );
    });
}

module.exports = app;