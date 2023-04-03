import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
  {
    products: [          // Array of objects (of products)
      {
        type: mongoose.ObjectId,     // A reference for 'Products'
        ref: "Products",           // Building a relationship in MongoDB
      },
    ],
    payment: {},
    buyer: { 
      type: mongoose.ObjectId,       // A reference for 'user'
      ref: "users",
    },
    status: {
      type: String,
      default: "Not Processed",
      enum: ["Not Processed", "Processing", "Shipped", "Delivered", "Cancelled"],     // An array of different options for 'status'
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);