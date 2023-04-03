import express from "express";
import {
  loginController,
  registerController,
  testController,
  forgotPasswordController,
  updateProfileController,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";


// Router object
const router = express.Router();     // we need it if we're carrying out the routing logic in a separate file 



// ROUTING

// Routing for Registering; Method - POST
router.post("/register", registerController);     // 'registerController' is callback function from 'controllers' folder 

// Routing for Login; Method - POST
router.post("/login", loginController);

// Routing for Forgot Password; Method - POST
router.post("/forgot-password", forgotPasswordController);

// Test routes
router.get("/test", requireSignIn, isAdmin, testController);     // The 'next()' in 'requireSignIn'/'isAdmin' (middlewares) makes it execute 'testController'

// Routing for Protected/Authorized paths (User); Method - GET
router.get("/user-auth", requireSignIn, (req, res) => {     // not creating a separate controller as it's pretty straightforward
  res.status(200).send({ ok: true });
});

// Routing for Protected/Authorized paths (Admin); Method - GET
router.get("/admin-auth", requireSignIn,  isAdmin, (req, res) => {     
  res.status(200).send({ ok: true });
});

// Routing for updating profile (User); Method - PUT
router.put("/profile", requireSignIn, updateProfileController);

// Route for getting all orders (User); Method - GET
router.get("/orders", requireSignIn, getOrdersController);

// Route for getting all orders as an Admin; Method - GET
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// Route for updating order status as an Admin; Method - PUT
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);


export default router;