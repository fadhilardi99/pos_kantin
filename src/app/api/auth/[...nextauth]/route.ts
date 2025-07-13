import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Add error handling for build-time issues
const handler = NextAuth(authOptions);

// Export with proper error handling
export { handler as GET, handler as POST };

// Add dynamic configuration to prevent static generation issues
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
