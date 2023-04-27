import type { MongoDBQuery } from "~/server/types/segments";

export const addEventsToProfiles = (pipeline?: MongoDBQuery[]) => {
  if (pipeline && pipeline.length > 0) {
    return {
      $lookup: {
        from: "events",
        localField: "id",
        foreignField: "profile.id",
        as: "events",
        pipeline,
      },
    };
  } else {
    return {
      $lookup: {
        from: "events",
        localField: "id",
        foreignField: "profile.id",
        as: "events",
      },
    };
  }
};

/**
 * Get all profiles that had not transactions since this time period
 */
export const getProspectQuery = (timePeriod: Date) => ({
  totalTransactions: 0,
  customerCreatedAt: { $gte: timePeriod },
});
