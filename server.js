import express from "express";      // using 'import' instead of 'const... = require(...)' by changing 'type' to 'module' in package.json. It's 'commonjs' by default for you to be able to use 'const...require'
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from './config/db.js';    // notice it's 'db.js' and not 'db' as we're using import/export instead of 'require' we also need to specify the file extension here
import authRoutes from "./routes/authRoute.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cors from "cors";
import path from "path";      // Comes with node.js. Done for deployment. ES module scope doesn't cover '__dirname'. Check 'server.js' in that OTHER repository for the fix. 
import { fileURLToPath } from "url";      // For resolving the error (ES module scope doesn't cover '__dirname') shown in cyclic


//Configure env
dotenv.config();   // since .env file is in the root folder we don't need to define a path like this 'dotenv.config({path:'...'});'

//Database config
connectDB();

//ES module fix as '__dirname' is not defined in ES module scope and hence error was being shown in cyclic
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Rest object
const app = express();

//Middelwares
app.use(cors());
app.use(express.json());  // enabling json so that we can send json data with 'req/res' (instead of 'body-parser')
app.use(morgan("dev"));   // tells us about the type of 'request (GET/POST etc.)' status code and how much time it took (in ms) for execution, in the terminal. Useful for debugging and will be removed in production

app.use(express.static(path.join(__dirname, './client/build')));      // For deployment. To set the path of the 'build' folder on client-side


//Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);



//Rest API
// app.get("/", (req, res) => {          // Commented out for deployment. Also in 'package.json' under 'scripts' -> 'dev', 'npm run server' was changed to 'npm run start' as we no longer need nodemon in deployment phase.
//   res.send("<h1>Welcome!</h1>");
// });

app.use('*', function(req, res) {           // This is done for deployment after 'npm run build'
  res.sendFile(path.join(__dirname, './client/build/index.html'));        // Setting the entry point file (index.html)
});

//PORT
const PORT = process.env.PORT || 8080;    // 'process' comes with node.js by default

//Run server/Listen
app.listen(PORT, () => {
  console.log(
    `Server Running on port ${PORT}`.bgCyan     // .bgCyan.white comes from the 'colors' package
      .white
  );
});