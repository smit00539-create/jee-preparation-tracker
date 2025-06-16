
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToggleButtonProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  size?: "sm" | "md";
}

const ToggleButton = ({ value, onChange, size = "md" }: ToggleButtonProps) => {
  const buttonSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        className={`${buttonSize} p-0 ${
          value === true 
            ? "bg-green-100 border-green-300 hover:bg-green-200" 
            : "hover:bg-green-50"
        }`}
        onClick={() => onChange(true)}
      >
        <Check className={`${iconSize} ${value === true ? "text-green-600" : "text-gray-400"}`} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`${buttonSize} p-0 ${
          value === false 
            ? "bg-red-100 border-red-300 hover:bg-red-200" 
            : "hover:bg-red-50"
        }`}
        onClick={() => onChange(false)}
      >
        <X className={`${iconSize} ${value === false ? "text-red-600" : "text-gray-400"}`} />
      </Button>
    </div>
  );
};

export default ToggleButton;
