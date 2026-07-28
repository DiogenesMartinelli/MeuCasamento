import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Every public page also has a generateMetadata() that calls this independently -
// without request memoization that's two full Prisma round-trips (metadata, then
// the page itself) before the page can even start rendering. cache() dedupes
// repeated calls within the same request.
export const getAccountBySlug = cache(async (slug: string) => {
  return prisma.account.findUnique({
    where: { slug },
    include: { siteSettings: true, rsvpTheme: true, events: { orderBy: { date: "asc" } } },
  });
});
