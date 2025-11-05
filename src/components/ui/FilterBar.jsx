import React from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";
import { Filter as FilterIcon, X as XIcon } from "lucide-react";

/**
 * FilterBar - A highly reusable, professional filter bar for any page.
 *
 * Props:
 * - filters: Array of filter configs [{
 *     key: string,
 *     label: string,
 *     type: 'select' | 'input' | 'date',
 *     options?: Array<{ value: string, label: string }>,
 *     value: any,
 *     onChange: (value) => void,
 *     placeholder?: string,
 *     className?: string
 *   }]
 * - onClear: function to clear all filters
 * - showClear?: boolean (default: true)
 * - className?: string
 */
const FilterBar = ({
  filters = [],
  onClear,
  showClear = true,
  className = "",
}) => {
  return (
    <div className={`flex items-center flex-wrap gap-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <FilterIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filters:
        </span>
      </div>
      {filters.map((filter) => {
        if (filter.type === "select") {
          return (
            <div key={filter.key} className="min-w-[120px]">
              <label className="sr-only">{filter.label}</label>
              <Select
                value={filter.value}
                onChange={filter.onChange} // Remove e.target.value since custom Select passes value directly
                options={[
                  { value: "", label: `All ${filter.label}` },
                  ...(filter.options || []),
                ]}
                className={`py-1 px-3 text-sm ${filter.className || ""}`}
                placeholder={filter.placeholder || filter.label}
              />
            </div>
          );
        }
        if (filter.type === "date") {
          return (
            <div key={filter.key} className="min-w-[120px]">
              <label className="sr-only">{filter.label}</label>
              <Input
                type="date"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                placeholder={filter.placeholder || filter.label}
                className={`${filter.className || ""}`}
              />
            </div>
          );
        }
        // Default to text input
        return (
          <div key={filter.key} className="min-w-[120px]">
            <label className="sr-only">{filter.label}</label>
            <Input
              type="text"
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              placeholder={filter.placeholder || filter.label}
              className={`${filter.className || ""}`}
            />
          </div>
        );
      })}
      {showClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-1"
        >
          <XIcon className="w-4 h-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
