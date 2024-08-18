import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import * as express from "express";
import { Application, Request, Response } from "express";
import connectMongoDB from "./config/Database";
import routes from "./routes/Routes";
import * as dotenv from "dotenv";
import * as cors from "cors";
import { API_VERSION } from "./utils/Constant";

dotenv.config();

const app: Application = express();

const env = process.env.ENV;

// CORS configuration options
const corsOptions: cors.CorsOptions = {
  origin: env === "prd" ? ["http://example.com", "http://anotherdomain.com"] : "*", // Allow these domains
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  credentials: env !== "prd", // Allow credentials
};
console.log(corsOptions);

app.use(cors());

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send(`Bamudungs Authenticate Service ${API_VERSION}!`);
});

app.use(`/api/v1`, routes);

const PORT = process.env.PORT || 3000;

connectMongoDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

exports.app = onRequest(app);
