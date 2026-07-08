import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    shortUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customAlias: {
      type: String,
      unique: true,
      sparse: true,
    },

    clicks: {
      type: Number,
      default: 0,
    },

    clickHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
          index: true,
        },

        ip: String,
        hashedIp: String,

        country: String,
        countryCode: String,
        region: String,
        city: String,
        lat: Number,
        lon: Number,

        userAgent: String,
        browser: String,
        browserVersion: String,
        os: String,
        osVersion: String,
        device: String,
        deviceBrand: String,

        isp: String,
        connectionType: String,

        referrer: String,
        refererDomain: String,
        landingPage: String,

        isFirstVisit: Boolean,
        isUnique: Boolean,
        sessionId: String,

        language: String,
        timezone: String,

        isBot: {
          type: Boolean,
          default: false,
        },

        botName: String,

        isVpn: Boolean,
        isProxy: Boolean,
        threatLevel: String,

        responseTime: Number,
        redirectStatus: Number,

        metadata: {
          type: Map,
          of: String,
        },
      },
    ],

    password: {
      type: String,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const ShortUrl =
  mongoose.models.ShortUrl || mongoose.model("ShortUrl", shortUrlSchema);

export default ShortUrl;