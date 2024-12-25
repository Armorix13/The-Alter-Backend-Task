import express from "express";
import rateLimit from "express-rate-limit";
import urlController from "../controllers/url.controller";
import validate from "../middlewares/validate.middleware";
import urlSchema from "../schema/url.schema";
import { verifyToken } from "../middlewares/auth.middleware";

const urlRoutes = express.Router();

const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "You have exceeded the 10 requests in 15 minutes limit!",
  },
  headers: true,
});

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: URL Shortening API
 *   description: An API to shorten URLs based on a given long URL, topic, and custom alias.
 *   version: 1.0.0
 * paths:
 *   /api/shorten:
 *     post:
 *       summary: Shorten a long URL
 *       description: Shortens a long URL with an optional custom alias and topic.
 *       operationId: shortenUrl
 *       tags:
 *         - URL Shortening
 *       security:
 *         - bearerAuth: []  # Bearer authentication for accessing this endpoint
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 longUrl:
 *                   type: string
 *                   description: The long URL to be shortened.
 *                   example: "https://www.google.com"
 *                 topic:
 *                   type: string
 *                   description: The topic of the URL (optional).
 *                   example: "demo"
 *                 customAlias:
 *                   type: string
 *                   description: A custom alias for the shortened URL (optional).
 *                   example: "dd1234"
 *               required:
 *                 - longUrl
 *       responses:
 *         '200':
 *           description: Successfully shortened the URL
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   shortUrl:
 *                     type: string
 *                     description: The shortened URL.
 *                     example: "http://short.ly/dd1234"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp when the shortened URL was created.
 *                     example: "2024-12-25T07:18:33.489Z"
 *         '400':
 *           description: Bad Request, invalid input or missing required fields.
 *         '401':
 *           description: Unauthorized, invalid or missing Bearer token.
 *         '404':
 *           description: Not Found, custom alias already taken or URL not found.
 *         '500':
 *           description: Internal Server Error, failure during URL shortening process.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # Indicating it's a JWT token
 *       description: Use the Bearer token for authentication. The token should be prefixed with "Bearer ".
 * security:
 *   - bearerAuth: [] 
 */
urlRoutes.post(
  "/shorten",
  validate(urlSchema.shortenUrlSchema),
  shortenLimiter,
  verifyToken,
  urlController.shortenUrl
);



urlRoutes.get(
  "/shorten/:shortId",
  validate(urlSchema.redirectToOrignalURLSchema),
  urlController.redirectToOrignalURL
);


/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: URL Shortening API
 *   description: An API to shorten URLs based on a given long URL, topic, and custom alias, with analytics on shortened URLs.
 *   version: 1.0.0
 * paths:
 *   /api/analytics/{alias}:
 *     get:
 *       summary: Get analytics for a shortened URL
 *       description: Retrieves analytics (e.g., number of clicks, traffic sources) for a shortened URL identified by the alias.
 *       operationId: getAnalytics
 *       tags:
 *         - Analytics  # Tag for analytics-related operations
 *       security:
 *         - bearerAuth: []  # Bearer Token authentication added here
 *       parameters:
 *         - name: alias
 *           in: path
 *           required: true
 *           description: The alias of the shortened URL for which analytics are requested.
 *           schema:
 *             type: string
 *             example: "dd1234"
 *       responses:
 *         '200':
 *           description: Successfully retrieved the analytics data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   alias:
 *                     type: string
 *                     description: The alias of the shortened URL.
 *                     example: "dd1234"
 *                   totalClicks:
 *                     type: integer
 *                     description: The total number of clicks on the shortened URL.
 *                     example: 1
 *                   uniqueClicks:
 *                     type: integer
 *                     description: The total number of unique clicks on the shortened URL.
 *                     example: 1
 *                   clicksByDate:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                           description: The date of the click.
 *                           example: "2024-12-25"
 *                         count:
 *                           type: integer
 *                           description: The number of clicks on that date.
 *                           example: 1
 *                   osType:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         osName:
 *                           type: string
 *                           description: The name of the operating system.
 *                           example: "Windows 10.0.0"
 *                         uniqueClicks:
 *                           type: integer
 *                           description: The number of unique clicks from this operating system.
 *                           example: 1
 *                         uniqueUsers:
 *                           type: integer
 *                           description: The number of unique users from this operating system.
 *                           example: 1
 *                   deviceType:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         deviceName:
 *                           type: string
 *                           description: The name of the device type (e.g., desktop, mobile).
 *                           example: "desktop"
 *                         uniqueClicks:
 *                           type: integer
 *                           description: The number of unique clicks from this device type.
 *                           example: 1
 *                         uniqueUsers:
 *                           type: integer
 *                           description: The number of unique users from this device type.
 *                           example: 1
 *         '404':
 *           description: Alias not found, no analytics available for the given alias.
 *         '500':
 *           description: Internal Server Error, failure in retrieving analytics data.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # Indicating it's a JWT token
 *       description: Use the Bearer token for authentication. The token should be prefixed with "Bearer ".
 * security:
 *   - bearerAuth: []  # Apply Bearer token security to this endpoint
 */

urlRoutes.get(
  "/analytics/:alias",
  urlController.getAnalytics
);

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: URL Shortening API
 *   description: An API to shorten URLs based on a given long URL, topic, and custom alias, with analytics on shortened URLs.
 *   version: 1.0.0
 * paths:
 *   /api/analytics/topic/{topic}:
 *     get:
 *       summary: Get analytics based on the topic of shortened URLs
 *       description: Retrieves analytics (e.g., total clicks, traffic sources) for shortened URLs that are associated with the given topic.
 *       operationId: getAnalyticsBasedOnTopic
 *       tags:
 *         - Analytics  # Tag for analytics-related operations
 *       security:
 *         - bearerAuth: []  # Adding Bearer Token authentication here
 *       parameters:
 *         - name: topic
 *           in: path
 *           required: true
 *           description: The topic associated with the shortened URLs for which analytics are requested.
 *           schema:
 *             type: string
 *             example: "demo"
 *       responses:
 *         '200':
 *           description: Successfully retrieved analytics data for the given topic
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   totalClicks:
 *                     type: integer
 *                     description: The total number of clicks across all URLs associated with the given topic.
 *                     example: 20
 *                   uniqueClicks:
 *                     type: integer
 *                     description: The total number of unique clicks across all URLs associated with the given topic.
 *                     example: 3
 *                   clicksByDate:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         date:
 *                           type: string
 *                           description: The date of the click.
 *                           example: "2024-12-17"
 *                         count:
 *                           type: integer
 *                           description: The number of clicks on that date.
 *                           example: 6
 *                   urls:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         shortUrl:
 *                           type: string
 *                           description: The shortened URL.
 *                           example: "http://localhost:8080/api/shorten/dfSv84c8"
 *                         totalClicks:
 *                           type: integer
 *                           description: The total number of clicks on this specific shortened URL.
 *                           example: 6
 *                         uniqueClicks:
 *                           type: integer
 *                           description: The total number of unique clicks on this specific shortened URL.
 *                           example: 1
 *         '404':
 *           description: No analytics found for the given topic.
 *         '500':
 *           description: Internal Server Error, failure in retrieving analytics data.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # Indicating it's a JWT token
 *       description: Use the Bearer token for authentication. The token should be prefixed with "Bearer ".
 * security:
 *   - bearerAuth: []  # Apply Bearer token security to this endpoint
 */

urlRoutes.get(
  "/analytics/topic/:topic",
  urlController.getAnalyticsBasedOnTopic
);

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Advanced URL Shortener
 *   description: Build an Advanced URL Shortener app with Comprehensive Analytics, Custom Aliases, and Rate Limiting
 *   version: 1.0.0
 * paths:
 *   /api/analytics/overall:
 *     get:
 *       summary: Get overall analytics for the shortened URLs
 *       description: Retrieves overall analytics (e.g., total clicks, total URLs) for all shortened URLs in the system.
 *       operationId: getOverallAnalytics
 *       tags:
 *         - Analytics  # Tag for analytics-related operations
 *       security:
 *         - bearerAuth: []  # Add Bearer Token authentication here
 *       responses:
 *         '200':
 *           description: Successfully retrieved overall analytics data
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   totalUrls:
 *                     type: integer
 *                     description: The total number of shortened URLs in the system.
 *                     example: 300
 *                   totalClicks:
 *                     type: integer
 *                     description: The total number of clicks across all shortened URLs.
 *                     example: 12000
 *                   uniqueVisitors:
 *                     type: integer
 *                     description: The total number of unique visitors who clicked on the shortened URLs.
 *                     example: 5000
 *         '500':
 *           description: Internal Server Error, failure in retrieving overall analytics data.
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # Indicating it's a JWT token
 *       description: Use the Bearer token for authentication. The token should be prefixed with "Bearer ".
 * security:
 *   - bearerAuth: [] 
 */

urlRoutes.get(
  "/analytics/overall",
  verifyToken,
  urlController.getOverallAnalytics
);

export default urlRoutes;
