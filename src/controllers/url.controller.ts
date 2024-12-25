import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../utils/helper";
import {
  RedirectToOrignalURLRequest,
  ShortenURLRequest,
} from "../types/API/URL/types";
import ErrorHandler from "../utils/ErrorHandler";
import URL from "../model/url.model.js";
import { nanoid } from "nanoid";
import useragent from "useragent";
import axios from "axios";
import Analytics from "../model/analytics.model";

const shortenUrl = TryCatch(
  async (
    req: Request<{}, {}, ShortenURLRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.userId;
    const { longUrl, customAlias, topic } = req.body;
    const baseUrl = process.env.BACKEND_URL;

    let shortIdCode: string;

    if (customAlias) {
      const existingAlias = await URL.findOne({ shortId: customAlias });
      if (existingAlias) {
        return next(
          new ErrorHandler(
            "Custom alias already exists. Please try another one",
            400
          )
        );
      }
      shortIdCode = customAlias;
    } else {
      shortIdCode = nanoid(8);
    }

    const newUrl = await URL.create({
      longUrl,
      shortId: shortIdCode,
      topic,
      userId
    });

    return res.status(201).json({
      success: true,
      shortUrl: `${baseUrl}/api/shorten/${shortIdCode}`,
      createdAt: newUrl.createdAt,
    });
  }
);

const redirectToOrignalURL = TryCatch(
  async (
    req: Request<RedirectToOrignalURLRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { shortId } = req.params;

    const url = await URL.findOne({ shortId });

    if (!url) return next(new ErrorHandler("URL not found", 404));

    // Extract analytics data
    const userAgent = req.headers["user-agent"];
    const ipAddress =
      (Array.isArray(req.headers["x-forwarded-for"])
        ? req.headers["x-forwarded-for"][0]
        : req.headers["x-forwarded-for"]?.split(",")[0]) ||
      req.socket.remoteAddress;

    const parsedAgent = useragent.parse(userAgent);
    const osName = parsedAgent.os.toString();
    const deviceType =
      parsedAgent.device.family === "Other" ? "desktop" : "mobile";

    let location = "Unknown";
    try {
      const geoResponse = await axios.get(
        `http://ip-api.com/json/${ipAddress}`
      );
      const { city, regionName, country } = geoResponse.data;
      location = `${city}, ${regionName}, ${country}`;
    } catch (err: any) {
      console.error("Geolocation fetch failed:", err.message);
    }

    await Analytics.create({
      shortId,
      userAgent,
      osName,
      deviceType,
      ipAddress,
      location,
    });

    return res.redirect(url.longUrl);
  }
);

const getAnalytics = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("coming here...");
    const { alias } = req.params;


    const visits = await Analytics.find({ shortId: alias });

    if (!visits.length) {
      return next(
        new ErrorHandler("No analytics data found for this alias.", 404)
      );
    }

    // Step 2: Total and unique clicks
    const totalClicks = visits.length;
    const uniqueIps = [...new Set(visits.map((visit) => visit.ipAddress))];
    const uniqueClicks = uniqueIps.length;

    // Step 3: Clicks by date (recent 7 days)
    const clicksByDate: any = {};
    visits.forEach((visit: any) => {
      const date: any = visit.timestamp.toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    const recentClicks = Object.entries(clicksByDate)
      .slice(-7)
      .map(([date, count]) => ({ date, count }));

    // Unique Clicks = Unique Users, because both are calculated based on the unique IP's

    // Step 4: Group by OS type
    const osType: any = {};
    visits.forEach((visit: any) => {
      osType[visit.osName] = osType[visit.osName] || {
        uniqueClicks: new Set(),
      };
      osType[visit.osName].uniqueClicks.add(visit.ipAddress);
    });
    const osAnalytics = Object.entries(osType).map(([osName, data]: any) => ({
      osName,
      uniqueClicks: data.uniqueClicks.size,
      uniqueUsers: data.uniqueClicks.size,
    }));

    // Step 5: Group by device type
    const deviceType: any = {};
    visits.forEach((visit: any) => {
      deviceType[visit.deviceType] = deviceType[visit.deviceType] || {
        uniqueClicks: new Set(),
      };
      deviceType[visit.deviceType].uniqueClicks.add(visit.ipAddress);
    });

    const deviceAnalytics = Object.entries(deviceType).map(
      ([deviceName, data]: any) => ({
        deviceName,
        uniqueClicks: data.uniqueClicks.size,
        uniqueUsers: data.uniqueClicks.size,
      })
    );

    return res.json({
      totalClicks,
      uniqueClicks,
      clicksByDate: recentClicks,
      osType: osAnalytics,
      deviceType: deviceAnalytics,
    });
  }
);

const getAnalyticsBasedOnTopic = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { topic } = req.params;

    const urlsInTopic = await URL.find({ topic });

    if (!urlsInTopic || urlsInTopic.length === 0) {
      return next(new ErrorHandler("No URLs found for this topic", 404));
    }

    const analyticsData = await Analytics.find({
      shortId: { $in: urlsInTopic.map((url) => url.shortId) },
    });

    // Total and unique clicks for the topic
    let totalClicks = 0;
    let uniqueClicks = new Set<string | any>(); // Set to track unique IP addresses
    const clicksByDate: Record<string, number> = {};

    // Aggregate analytics data
    analyticsData.forEach((log) => {
      totalClicks++;
      uniqueClicks.add(log.ipAddress); // Track unique users by IP

      const date = new Date(log.timestamp).toISOString().split("T")[0]; // Extract only the date
      if (!clicksByDate[date]) {
        clicksByDate[date] = 0;
      }
      clicksByDate[date]++;
    });

    // Prepare data for each URL
    const urlsAnalytics = urlsInTopic.map((url) => {
      const urlAnalytics = analyticsData.filter(
        (log: any) => log.shortId === url.shortId
      );

      const urlTotalClicks = urlAnalytics.length;
      const urlUniqueClicks = new Set(urlAnalytics.map((log) => log.ipAddress))
        .size;

      const baseUrl = process.env.BACKEND_URL;
      return {
        shortUrl: `${baseUrl}/api/shorten/${url.shortId}`,
        totalClicks: urlTotalClicks,
        uniqueClicks: urlUniqueClicks,
      };
    });

    // Response structure
    const response = {
      totalClicks,
      uniqueClicks: uniqueClicks.size,
      clicksByDate: Object.entries(clicksByDate)
        .map(([date, count]) => ({ date, count }))
        .slice(-7), // Only the last 7 days
      urls: urlsAnalytics,
    };

    res.status(200).json(response);
  }
);

const getOverallAnalytics = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("coming here...2");
    const userId = req.userId;

    const userUrls = await URL.find({ createdBy: userId });
    if (!userUrls || userUrls.length === 0) {
      return next(new ErrorHandler("No URLs found for the user", 404));
    }

    const shortIds = userUrls.map((url) => url.shortId);

    // Fetch all analytics logs for user's URLs
    const analyticsData = await Analytics.find({ alias: { $in: shortIds } });

    let totalClicks = 0;
    const uniqueIps = new Set<string>();
    const clicksByDate: Record<string, number> = {};
    const osAnalytics: Record<string, Set<string>> = {};
    const deviceAnalytics: Record<string, Set<string>> = {};

    // Process analytics data
    analyticsData.forEach((log: any) => {
      totalClicks++;
      uniqueIps.add(log.ipAddress);

      // Group clicks by date
      const date = new Date(log.timestamp).toISOString().split("T")[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;

      // OS Type Analytics
      if (log.osName) {
        if (!osAnalytics[log.osName]) osAnalytics[log.osName] = new Set();
        osAnalytics[log.osName].add(log.ipAddress);
      }

      // Device Type Analytics
      if (log.deviceName) {
        if (!deviceAnalytics[log.deviceName])
          deviceAnalytics[log.deviceName] = new Set();
        deviceAnalytics[log.deviceName].add(log.ipAddress);
      }
    });

    // Format clicksByDate for response
    const formattedClicksByDate = Object.entries(clicksByDate).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    // Format OS data for response
    const formattedOsAnalytics = Object.entries(osAnalytics).map(
      ([osName, ips]) => ({
        osName,
        uniqueClicks: ips.size,
        uniqueUsers: ips.size,
      })
    );

    // Format Device data for response
    const formattedDeviceAnalytics = Object.entries(deviceAnalytics).map(
      ([deviceName, ips]) => ({
        deviceName,
        uniqueClicks: ips.size,
        uniqueUsers: ips.size,
      })
    );

    // Prepare response
    const response = {
      totalUrls: userUrls.length,
      totalClicks,
      uniqueClicks: uniqueIps.size,
      clicksByDate: formattedClicksByDate.slice(-7), // Last 7 days
      osType: formattedOsAnalytics,
      deviceType: formattedDeviceAnalytics,
    };
    res.status(200).json(response);
  }
);

export default {
  shortenUrl,
  redirectToOrignalURL,
  getAnalytics,
  getAnalyticsBasedOnTopic,
  getOverallAnalytics,
};
