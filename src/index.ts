import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";  // Assuming your main router is exported from routes.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { connectToDB } from "./utils/helper";
import { errorMiddleware } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// Middleware setup
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const setupSwagger = (app: express.Application) => {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Advanced URL Shortener",
        version: "1.0.0",
        description: "Build an Advanced URL Shortener app with Comprehensive Analytics, Custom Aliases, and Rate Limiting",
      },
      servers: [
        {
          url: "http://localhost:8080",
          description: "Development server",
        },
        {
          url: process.env.PRODUCTION_URL,
          description: "Production server",
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Use 'Bearer' followed by your JWT token.",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  };

  const swaggerSpec = swaggerJsdoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

// Setup Swagger
setupSwagger(app);

// API Routes
app.use("/api", routes);

// 404 Route not found
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error middleware (should be last middleware)
app.use(errorMiddleware);

// Connect to the database and start the server
connectToDB()
  .then(() => {
    console.log("Connected to DB successfully", process.env.MONGO_URI);
    const port = process.env.PORT || 8080;  // Default to 8080 if PORT is not defined
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to DB", error);
  });
