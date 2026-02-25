import { cn } from "@/lib/cn";

const providerStyles: Record<string, string> = {
  MEDIUM: "bg-neutral-900 text-white",
  WORDPRESS: "bg-blue-600 text-white",
};

const providerLabels: Record<string, string> = {
  MEDIUM: "M",
  WORDPRESS: "W",
};

export const providerNames: Record<string, string> = {
  MEDIUM: "Medium",
  WORDPRESS: "WordPress",
};

interface ProviderIconProps {
  provider: string;
  size?: "sm" | "md" | "lg";
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
        "inline-flex items-center justify-center font-bold transition-transform duration-200",
        size === "sm" && "h-6 w-6 rounded-lg text-[10px]",
        size === "md" && "h-8 w-8 rounded-xl text-xs",
        size === "lg" && "h-10 w-10 rounded-xl text-sm",
        providerStyles[provider] ?? "bg-neutral-400 text-white",
        className
      )}
      title={providerNames[provider] ?? provider}
    >
      {providerLabels[provider] ?? "?"}
    </span>
  );
}
