import { clientIp } from "@/lib/rate-limit";

function decodeHeader(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Mozilla Firefox";
  if (/chrome\//i.test(userAgent) && !/chromium/i.test(userAgent)) return "Google Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  return "Unknown browser";
}

export function parseOperatingSystem(userAgent: string): string {
  if (/windows nt/i.test(userAgent)) return "Windows";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/mac os x|macintosh/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown operating system";
}

export function maskIpAddress(ip: string): string {
  const ipv4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) return `${ipv4[1]}.${ipv4[2]}.x.x`;
  if (ip.includes(":")) {
    const groups = ip.split(":").filter(Boolean);
    return `${groups.slice(0, 2).join(":")}:****:****`;
  }
  return "Unavailable";
}

export function requestSecurityDetails(req: Request): {
  time: string;
  browser: string;
  operatingSystem: string;
  location?: string;
  ip: string;
} {
  const userAgent = req.headers.get("user-agent") ?? "";
  const cityHeader = req.headers.get("x-vercel-ip-city");
  const countryHeader = req.headers.get("x-vercel-ip-country");
  const city = cityHeader ? decodeHeader(cityHeader) : "";
  const country = countryHeader ? decodeHeader(countryHeader) : "";
  const location = [city, country].filter(Boolean).join(", ");
  const ip = clientIp(req);

  return {
    time: `${new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(new Date())} (Asia/Kolkata)`,
    browser: parseBrowser(userAgent),
    operatingSystem: parseOperatingSystem(userAgent),
    ...(location ? { location } : {}),
    ip: maskIpAddress(ip),
  };
}
