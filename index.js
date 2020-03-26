var url = "mongodb+srv://chirag003:chirag003@cluster0-xaamp.mongodb.net/taskDB?retryWrites=true&w=majority";

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

const express = require('express');
const app = express();
const bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
var port = '3000'

mongoose.connect(url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected!");
}).catch(err => {
    console.log('Could not connect to the database.', err);
    process.exit();
});

// Defining a Category Structure
const Category = require('./categoryModel.js')

// Add Category
app.post('/addCategory', (req, res) => {
    if (!req.body.categoryName) {
        return res.status(400).send({
            message: "Category name can not be empty"
        });
    }
    // Create a Category
    const category = new Category({
        name: req.body.categoryName,
        parentCategory: req.body.parentName || 0
    });
    // Save Category
    category.save()
        .then(data => {
            res.send(data);
            console.log('Category Added!')
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Category."
            });
        }
        );
})

// Find All Categories
app.get('/category', (req, res) => {
    Category.aggregate([
        { "$addFields": { "parentCategory": { "$toString": "$_id" } } },
        {
            "$lookup": {
                "from": "categories",
                "localField": "parentCategory",
                "foreignField": "parentCategory",
                "as": "child_categories"
            }
        }
    ]).then(categories => {
        res.send(categories);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving categories."
        });
    });
});

// Defining a Product Structure
const Product = require('./productModel.js');

// Add Product
app.post('/addProduct', (req, res) => {
    if (!req.body.productName || !req.body.price) {
        return res.status(400).send({
            message: "Product info can not be empty"
        });
    }

    // Create a Product
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        categories: req.body.categories,
        description: req.body.description
    });

    // Save Product
    product.save()
        .then(data => {
            res.send(data);
            console.log('Product Added!')
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Product."
            });
        });
})

// Find Products
app.get('/product/:categoryId', (req, res) => {
    Product.find({ "categories": req.params.categoryId })
        .then(products => {
            if (!products.length) {
                return res.status(404).send({
                    message: "Products not found mapped with categoryId " + req.params.categoryId
                });
            }
            res.send(products);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Product not found with categoryId " + req.params.categoryId
                });
            }
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving products."
            });
        });
});

// Update Product
app.put('/product/:productId', (req, res) => {
    if (!req.body.productName || !req.body.price) {
        return res.status(400).send({
            message: "Product name & price can not be empty"
        });
    }

    // Find product and update it with the request body
    Product.findByIdAndUpdate(req.params.productId, {
        name: req.body.productName,
        price: req.body.price,
        categories: req.body.categories,
        description: req.body.description
    }, { new: true })
        .then(product => {
            if (!product) {
                return res.status(404).send({
                    message: "Product not found with id " + req.params.productId
                });
            }
            res.send(product);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Product not found with id " + req.params.productId
                });
            }
            return res.status(500).send({
                message: "Error updating Product with id " + req.params.productId
            });
        });
});













app.listen(port, () => {
    console.log('\n\nServer started on port ' + port);
});