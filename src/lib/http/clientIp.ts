import "server-only";
import { headers } from "next/headers";

// x-forwarded-for puede traer una cadena de proxies ("cliente, proxy1,
// proxy2..."); el primero es el IP original del request.
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
}
