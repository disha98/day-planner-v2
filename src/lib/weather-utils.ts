import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

interface WeatherInfo {
  icon: LucideIcon;
  label: string;
  color: string;      // icon color class
  bgColor: string;    // background tint class
  borderColor: string; // border class
}

export function getWeatherInfo(code: number): WeatherInfo {
  if (code <= 1)
    return { icon: Sun, label: "Clear skies", color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-100" };
  if (code === 2)
    return { icon: CloudSun, label: "Partly cloudy", color: "text-amber-400", bgColor: "bg-amber-50", borderColor: "border-amber-100" };
  if (code === 3)
    return { icon: Cloud, label: "Overcast", color: "text-stone-400", bgColor: "bg-stone-50", borderColor: "border-stone-200" };
  if (code >= 45 && code <= 48)
    return { icon: CloudFog, label: "Foggy", color: "text-stone-400", bgColor: "bg-stone-50", borderColor: "border-stone-200" };
  if (code >= 51 && code <= 57)
    return { icon: CloudDrizzle, label: "Light drizzle", color: "text-sky-400", bgColor: "bg-sky-50", borderColor: "border-sky-100" };
  if (code >= 61 && code <= 65)
    return { icon: CloudRain, label: "Rain", color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-100" };
  if (code >= 66 && code <= 67)
    return { icon: CloudRain, label: "Freezing rain", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-100" };
  if (code >= 71 && code <= 77)
    return { icon: Snowflake, label: "Snow", color: "text-sky-400", bgColor: "bg-sky-50", borderColor: "border-sky-100" };
  if (code >= 80 && code <= 82)
    return { icon: CloudRain, label: "Rain showers", color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-100" };
  if (code >= 85 && code <= 86)
    return { icon: Snowflake, label: "Snow showers", color: "text-sky-400", bgColor: "bg-sky-50", borderColor: "border-sky-100" };
  if (code >= 95 && code <= 99)
    return { icon: CloudLightning, label: "Thunderstorm", color: "text-violet-500", bgColor: "bg-violet-50", borderColor: "border-violet-100" };
  return { icon: Cloud, label: "Cloudy", color: "text-stone-400", bgColor: "bg-stone-50", borderColor: "border-stone-200" };
}

export function isPrecipitation(code: number): boolean {
  return code >= 51;
}
