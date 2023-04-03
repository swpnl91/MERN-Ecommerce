import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,               // Was giving an error, hence commented out
    // unique: true,
  },
  slug: {            // used for slugifying, for ex. - '.../package-slugify'. To get the '-'/'_' in URLs (which is great for SEO)
    type: String,     // basically stores the slugified name of a category
    lowercase: true,
  },
});

export default mongoose.model("Category", categorySchema);