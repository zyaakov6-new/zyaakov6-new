import { cn } from "@/lib/cn";

const providerColors: Record<string, string> = {
  MEDIUM: "bg-gray-900 text-white",
  WORDPRESS: "bg-blue-600 text-white",
  SUBSTACK: "bg-orange-500 text-white",
};

const providerLabels: Record<string, string> = {
  MEDIUM: "M",
  WORDPRESS: "W",
  SUBSTACK: "S",
};

export const providerNames: Record<string, string> = {
  MEDIUM: "Medium",
  WORDPRESS: "WordPress",
  SUBSTACK: "Substack",
};

interface ProviderIconProps {
  provider: string;
  size?: "sm" | "md";
  className?: string;
}

export default function ProviderIcon({
  provider,
  size = "sm",
  className,
}: ProviderIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold",
        size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm",
        providerColors[provider] ?? "bg-gray-400 text-white",
        className
      )}
      title={providerNames[provider] ?? provider}
    >
      {providerLabels[provider] ?? "?"}
    </span>
  );
}
