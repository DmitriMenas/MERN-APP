const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { type } = require('os');

app.use(express.json());
app.use(cors());

// database connection with mogodb
mongoose.connect('mongodb+srv://dmitrimenas:123@cluster0.ui5lwgl.mongodb.net/e-commerce')

//API Creation

app.get('/', (req, res) => {
    res.send('Express App is running');
});

// Image Storage Engine

const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    }
});

//Creating image upload enpoint
app.use('/images', express.static('uploads/images'));
app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
});

// Schema for creating products

const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    new_price:{
        type: Number,
        required: true
    },
    old_price:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    available:{
        type: Boolean,
        required: true,
    },
});

app.post('/addproduct', async (req, res) => {
    const products = await Product.find({}).sort({id: -1}).limit(1);
    const id = products.length > 0 ? products[0].id + 1 : 1;

    if (req.body.available === undefined) {
        return res.status(400).json({
            success: false,
            message: "Missing required field: available"
        });
    }

    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        available: req.body.available
    });

    try {
        await product.save();
        console.log("Product saved");
        res.json({
            success: true,
            message: "Product added successfully!",
            product: product
        });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add product",
            error: error.message
        });
    }
});

// Creating API for deleting products

app.post('/removeproduct', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.body.id });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
            product: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
});

// Creating API for getting all products

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);
});

// Schema creating for user model

const User = mongoose.model("User", {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cart: {
        type: Object,
        default: () => ({})
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Endpoint for user registration
app.post('/signup', async (req, res) => {
    try {
        let check = await User.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "Email already exists"
            });
        }

        let cart = {};
        for (let i = 0; i <= 300; i++) {
            cart[i] = 0; // Use object with integer keys stored as strings
        }

        const user = new User({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cart: cart
        });

        console.log("User to be saved:", user);  // Debugging line

        await user.save();

        const data = {
            user: {
                id: user.id,
            }
        };

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
});

// Creating endpoint for user login

app.post('/login', async (req, res) => {
    let user = await User.findOne({email: req.body.email}); 
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id,
                }
            };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success: true, token});
        } else {
            res.json({success: false, error: "Invalid password"});
        }
    } else {
        res.json({success: false, error: "User not found"});
    }
});

//Creating endpoint for new collection data

app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New collection fetched");
    res.send(newcollection);
});

//Creating endpoint for popular in womens section

app.get('/popularwomens', async (req, res) => {
    let products = await Product.find({category: "women"});
    let popularwomens = products.slice(0, 4);
    console.log("Popular womens fetched");
    res.send(popularwomens);
});

// Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).json({success: false, message: "Invalid token"});
        return; // Ensure to return here to stop further execution in case of no token
    }
    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = await User.findById(data.user.id); // Fetch full user document
        if (!req.user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        next();
    } catch (error) {
        res.status(401).json({success: false, message: "Invalid token"});
    }
};

// Creating endpoint for adding cart data
app.post('/addcart', fetchUser, async (req, res) => {
    const itemId = req.body.itemId;
    const quantityToAdd = 1; // Assume a default of 1 if not specified

    // Safeguard for undefined itemId or no itemId provided in the request
    if (!itemId) {
        return res.status(400).json({ success: false, message: "No item ID provided" });
    }

    // Initialize item count if not present
    if (!req.user.cart[itemId]) {
        req.user.cart[itemId] = 0;
    }

    // Update the cart
    req.user.cart[itemId] += quantityToAdd;

    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: req.user.cart } });
        console.log("Cart updated:", req.user.cart);
        res.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Failed to update cart", error: error.message });
    }
});

// Creating endpoint for removing cart data
app.post('/removecart', fetchUser, async (req, res) => {
    const itemId = req.body.itemId;
    const quantityToRemove = 1; // Assume a default of 1 if not specified

    // Safeguard for undefined itemId or no itemId provided in the request
    if (!itemId) {
        return res.status(400).json({ success: false, message: "No item ID provided" });
    }

    // Initialize item count if not present
    if (!req.user.cart[itemId]) {
        req.user.cart[itemId] = 0;
    }

    // Update the cart
    req.user.cart[itemId] = Math.max(0, req.user.cart[itemId] - quantityToRemove);

    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { cart: req.user.cart } });
        console.log("Cart updated:", req.user.cart);
        res.json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Failed to update cart", error: error.message });
    }
});

//Creating endpoint for getting cart data

app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await User.findOne(req.user._id);
    res.json(userData.cart);
});

//Server running on port 4000 or if theres an issue

app.listen(port, (error) => {
    if (!error) {
        console.log("Server is running on port", +port);
    } else {
        console.log('Error:', +error);
    }
})