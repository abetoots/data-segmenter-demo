import { createTRPCRouter } from "~/server/api/trpc";
import accountSegmentsRouter from "./routers/segments";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { z } from "zod";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  segments: accountSegmentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterInput = inferRouterInputs<AppRouter>;
