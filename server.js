require("dotenv").config();
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname)));


// ===============================
// SUPABASE
// ===============================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);


// ===============================
// GET PRODUCTS
// ===============================

app.get("/products", async function (req, res) {

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not load products"
        });
    }

    res.json(data);
});


// ===============================
// ADD PRODUCT
// ===============================

app.post("/products", async function (req, res) {

    const newProduct = req.body;

    const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select();

    if (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not add product"
        });
    }

    res.json({
        message: "Product added successfully",
        product: data[0]
    });
});


// ===============================
// EDIT PRODUCT
// ===============================

app.put("/products/:id", async function (req, res) {

    const id = Number(req.params.id);

    const updatedProduct = req.body;

    const { data, error } = await supabase
        .from("products")
        .update(updatedProduct)
        .eq("id", id)
        .select();

    if (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not update product"
        });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json({
        message: "Product updated successfully",
        product: data[0]
    });
});


// ===============================
// DELETE PRODUCT
// ===============================

app.delete("/products/:id", async function (req, res) {

    const id = Number(req.params.id);

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);

        return res.status(500).json({
            message: "Could not delete product"
        });
    }

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