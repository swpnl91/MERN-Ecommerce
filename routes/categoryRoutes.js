import express from "express";
import { isAdmin, requireSignIn } from "./../middlewares/authMiddleware.js";
import {
  categoryController,
  createCategoryController,
  deleteCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "./../controllers/categoryController.js";


const router = express.Router();


// ROUTES


// Creating a category (Admin)
router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

// Updating a category (Admin)
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

// Getting All Categories (Users/Admin/Everyone)
router.get("/get-categories", categoryController);

// Getting a single Category (Users/Admin/Everyone)
router.get("/single-category/:slug", singleCategoryController);

// Deleting a category (Admin)
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);




export default router;