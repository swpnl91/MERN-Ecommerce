import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.ObjectId,        // we're getting the type from the 'category' collection
      ref: "Category",                // giving the reference to the 'category' collection so that we can establish a relationship between the two collections
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer,               // a special case to store a file that can be pictures/documents etc. (provided by mongoose)
      contentType: String,        // so that we can specify what type of file is being stored (pictures/documents etc.)
    },
    shipping: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Products", productSchema);