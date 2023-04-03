import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";


import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";         // '.env' wasn't to be found (for BrainTree) for some reason. Hence had to import it.


dotenv.config();                    // Calling the '.config()' in 'dotenv'

// Setting up for BrainTree Payment Gateway
var gateway = new braintree.BraintreeGateway({        // 'gateway' is used to generate 'token'
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});



// Creating a new product (Admin)      *********************////////**************
export const createProductController = async (req, res) => {
  try {
    
    const { name, description, price, category, quantity, shipping } =
      req.fields;     // 'req.fields' (instead of req.body) comes from 'formidable' which is passed and called as a middleware in 'productRoutes.js'
    
    const { photo } = req.files;     // 'req.files' (instead of req.body) comes from 'formidable' which is passed and called as a middleware in 'productRoutes.js'
    
    // Validation for whether the above fields exist or not
    switch (true) {    // 'true' is compared against each case
      case !name:
        return res.status(500).send({ message: "Name Is Required" });
      case !description:
        return res.status(500).send({ message: "Description Is Required" });
      case !price:
        return res.status(500).send({ message: "Price Is Required" });
      case !category:
        return res.status(500).send({ message: "Category Is Required" });
      case !quantity:
        return res.status(500).send({ message: "Quantity Is Required" });
      case !photo:
        return res.status(500).send({ message: "Photo Is Required" });
      case photo && photo.size > 1000000:   // 1 (for 1 MB) * 1024 * 1024, the value is in bytes?!!!!!!!********
        return res
          .status(500)
          .send({ message: "Photo size should be less then 1MB" });
    }

    const product = new productModel({ ...req.fields, slug: slugify(name) });     // retaining all the fields by using '...req.fields'. It doesn't include 'shipping' (as it's not mandatory to add it as per 'productmodels')
    
    if (photo) {
      // 'photo.path' and 'photo.type' are included in 'req.files' when we upload a photo on the frontend using "enctype='multipart/form-data'"
      product.photo.data = fs.readFileSync(photo.path);     // 'fs.readFileSync(photo.path)' reads file in a synchronous way. It basically 'reads' the content of the file (synchronously) and stores it in 'product.photo.data'. As for what that 'content' looks like you can have a look at it in the database, in the 'products' collection.
      product.photo.contentType = photo.type;
    }

    await product.save();    // Photos are also saved
    
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,        // As a reminder, this 'product' includes the 'photo' field but doesn't include the 'shipping' field
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating the product",
    });
  }
};

// Get all products (Everyone)         **********////////**************
export const getProductController = async (req, res) => {
  
  try {
    
    const products = await productModel
      .find({})
      .populate("category")      // '.populate('category')' basically also gives us details about the property that's passed (in this case 'category'). Otherwise it'd have just returned the 'id' of 'category'. 
      .select("-photo")          // as 'photo' (pictures) increases the size of the 'request (req)' and hence takes a lot of time to load (we'll be using/calling a different API - created below - from frontend, for getting photos). '-photo' ensures it gets everything but photos.
      .limit(12)                  // adds a limit for number of products to be shown at a time
      .sort({ createdAt: -1 });     // This ('-1') is done to sort it in a descending order by using its 'createdAt' field
    
      res.status(200).send({
      success: true,
      countTotal: products.length,
      message: "List of all Products ",
      products,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// Get a single product (Everyone)
export const getSingleProductController = async (req, res) => {
  
  try {
    
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")        // removing 'photo' for reasons mentioned above 
      .populate("category");  // it basically populates the 'category' (with its details) field instead of just getting its 'id'
    
      res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      message: "Error while getting the product",
      error,
    });
  }
};

// Get a photo
export const productPhotoController = async (req, res) => {
  
  try {
    
    const product = await productModel.findById(req.params.pid).select("photo");       // '.select("photo")' - this basically ONLY gets the photo
    
    // if 'product.photo.data' exists
    if (product.photo.data) {       // 'product.photo.data' is basically the actual 'data' that translates into 'photo'
      res.set("Content-type", product.photo.contentType);       // setting the 'Content-type'
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      message: "Error while getting photo",
      error,
    });
  }
};

// Delete a product
export const deleteProductController = async (req, res) => {
  
  try {
    
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");       // '.select("-photo")' only ensures the 'photo' field is not fetched but it's deleted anyway when the product is deleted     
    
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      message: "Error while deleting the product",
      error,
    });
  }
};

// Upate a product (Admin)
export const updateProductController = async (req, res) => {
  
  try {
    
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    
    const { photo } = req.files;
    
    // Validations (same as those that we used for 'creating a product')
    switch (true) {
      case !name:
        return res.status(500).send({ message: "Name is Required" });
      case !description:
        return res.status(500).send({ message: "Description is Required" });
      case !price:
        return res.status(500).send({ message: "Price is Required" });
      case !category:
        return res.status(500).send({ message: "Category is Required" });
      case !quantity:
        return res.status(500).send({ message: "Quantity is Required" });
      // case !photo:
      //   return res.status(500).send({ message: "Photo Is Required" });            // Had to remove this case because otherwise everytime the product is updated without changing the photo, it threw an error.
      case photo && photo.size > 1000000:
        return res
          .status(500)
          .send({ message: "Photo size should be less then 1MB" });
    }

    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }       // needed for updating in mongoose
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      error,
      message: "There was an error while updating the product",
    });
  }
};

// Filtering products
export const productFiltersController = async (req, res) => {
  
  try {
    
    const { checked, radio } = req.body;
    
    
    let args = {};    // since we have multiple queries (to be passed to the DB) we're creating an 'args' object
    
    // It can happen that the user wants to filter the products list based on category AND price, ONLY category, OR ONLY price. Hence we're using conditions below
    if (checked.length > 0) args.category = checked;     // 'checked' is an array with selected/checked categories (for filtering)
    
    // Only 'radio.length' is used because we're gonna get only one array with 2 elements in it. As only one price range can be chosen.
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };       // 'radio' is an array with 2 elements/values (that represent the price range) 
    
    const products = await productModel.find(args);
    
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      success: false,
      message: "There was an error while filtering products",
      error,
    });
  }
};

// Controller for keeping product count
export const productCountController = async (req, res) => {
  
  try {
    
    const total = await productModel.find({}).estimatedDocumentCount();   // for counting total products in DB
    
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

// Product list based on page
export const productListController = async (req, res) => {
  
  try {
    
    const perPage = 6;      // Max number of products to be shown on a page
    
    const page = req.params.page ? req.params.page : 1;      // 'req.params.page' doesn't exist then make it page 1 (1st page)
    
    const products = await productModel
      .find({})
      .select("-photo")               // not rendering or deselecting 'photo'
      .skip((page - 1) * perPage)    // it skips these many products to arrive at the list of products on a given page
      .limit(perPage)                // will display only 6 products per page
      .sort({ createdAt: -1 });   // for sorting in descending order using 'createdAt'
    
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      success: false,
      message: "Error in loading page with the product-list",
      error,
    });
  }
};

// For searching products
export const searchProductController = async (req, res) => {
  
  try {
    
    const { keyword } = req.params;
    
    const results = await productModel
      .find({
        $or: [                // special query in mongoose
          { name: { $regex: keyword, $options: "i" } },          // searches for the keyword in the 'name' field. '$options: "i"' makes it case insensitive.
          { description: { $regex: keyword, $options: "i" } },   // searches for the keyword in the 'description' field
        ],
      })
      .select("-photo");     // Deselecting 'photo'
    
      res.json(results);    // sending response as array?  ++++++++++++++++++++++++++++++
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

// Controller for getting similar products
export const relatedProductController = async (req, res) => {
  
  try {
    
    const { pid, cid } = req.params;
    
    const products = await productModel
      .find({
        category: cid,         // Finds all products within the given category/'category id'
        _id: { $ne: pid },     // To NOT show the product itself in the 'similar products' list
      })
      .select("-photo")       // deselect 'photo'
      .limit(3)               // So that only 3 products would be shown
      .populate("category");    // it basically populates the 'category' (with its details) field instead of just getting its 'id'
    
      res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      success: false,
      message: "Error while fetching similar products",
      error,
    });
  }
};

// To get products by category
export const productCategoryController = async (req, res) => {
  try {
    
    const category = await categoryModel.findOne({ slug: req.params.slug });    // find category based on the slug in params  
    
    const products = await productModel.find({ category }).populate("category");   // find all the products based on the category and also populate the category field
    
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(400).send({
      success: false,
      error,
      message: "Error while getting products based on category",
    });
  }
};

// BrainTree (token) payment gateway API
export const braintreeTokenController = async (req, res) => {
  // You can refer documentation for 'Braintree' to generate token
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);    // 'response' includes the token as 'clientToken'
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// Payment Handling using Braintree
export const brainTreePaymentController = async (req, res) => {
  // Naming convention is a bit different (depending on the API docs for braintree)
  try {
    // 'nonce' comes from 'braintree-web-drop-in-react'
    const { nonce, cart } = req.body;      // getting 'cart' (whatever products are there in the cart) from front end
    
    let total = 0;      
    
    cart.map((i) => {
      total += i.price;          // Calculating the total price of all the products in the cart
    });
    
    let newTransaction = gateway.transaction.sale(          // To complete the transaction 
      {
        amount: total,                        // An object expected in the '.sale()' method
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {                 // Callback function expected in the '.sale()' method
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,        // 'req.user._id' comes from the middleware 'requireSignIn'. That's where we get it from.
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};