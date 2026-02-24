import { cn } from "@/lib/cn";

interface StatusBadgeProps {
  status: "SUCCESS" | "FAILED" | "PENDING";
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        status === "SUCCESS" && "bg-emerald-50 text-emerald-700",
        status === "FAILED" && "bg-red-50 text-red-700",
        status === "PENDING" && "bg-amber-50 text-amber-700",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "SUCCESS" && "bg-emerald-500",
          status === "FAILED" && "bg-red-500",
          status === "PENDING" && "bg-amber-500"
        )}
      />
      {status === "SUCCESS"
        ? "Published"
        : status === "FAILED"
        ? "Failed"
        : "Pending"}
    </span>
  );
}
