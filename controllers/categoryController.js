import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";


// Creating a new category (Admin)
export const createCategoryController = async (req, res) => {
  
  try {
    
    const { name } = req.body;

    // If 'name' doesn't exist
    if (!name) {
      return res.status(401).send({ message: "Category Name Is Required" });
    }

    // Check whether the category with a given name already exists or not
    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Category Already Exists",
      });
    }

    // Saving the new category
    const category = await new categoryModel({
      name,
      slug: slugify(name),         // the 'slugify' package transforms the given name. Uses '-' by default, unless specified otherwise. 
    }).save();

    res.status(201).send({
      success: true,
      message: "New Category Created",
      category,
    });
  } catch (error) {

    console.log(error);

    res.status(500).send({
      success: false,
      error,
      message: "Error in Category",
    });
  }
};

// Updating a category (Admin)
export const updateCategoryController = async (req, res) => {
  
  try {
    
    const { name } = req.body;
    const { id } = req.params;      // we get the 'id' from the url
    
    // Finding the 'category' by 'id'
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }      // needs to be done for updating items 
    );
    
    res.status(200).send({
      success: true,
      messsage: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      error,
      message: "There was an error while updating the category",
    });
  }
};

// Getting all categories (Everyone)
export const categoryController = async (req, res) => {
  try {
    
    // Getting all categories
    const category = await categoryModel.find({});
    
    res.status(200).send({
      success: true,
      message: "List Of All Categories",
      category,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      error,
      message: "There was an error while getting the categories",
    });
  }
};

// Getting a single category (Everyone)
export const singleCategoryController = async (req, res) => {
  try {
    
    const category = await categoryModel.findOne({ slug: req.params.slug });   // we get the slug from the url (req.params)
    
    res.status(200).send({
      success: true,
      message: "Fetched a single category successfully",
      category,
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      error,
      message: "There was an error while getting the category",
    });
  }
};

// Deleting a category (Admin)
export const deleteCategoryController = async (req, res) => {
  try {
    
    const { id } = req.params;
    
    await categoryModel.findByIdAndDelete(id);      // no need to save the response here hence not stored in a constant
    
    res.status(200).send({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    
    console.log(error);
    
    res.status(500).send({
      success: false,
      message: "There was an error while deleting the category",
      error,
    });
  }
};