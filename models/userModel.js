import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,     // removes/trims white space
    },
    email: {
      type: String,
      required: true,
      unique: true,    // ensures that we have unique email ids
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: {},          // It's kept as an object and not as a string to accommodate the multiple-line nature of an address
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }         // when a new user is created, its 'created-at' property also gets added
);

export default mongoose.model("users", userSchema);    // 'users' is the collection that's been already created in MongoDB compass