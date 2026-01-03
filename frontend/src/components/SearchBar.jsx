import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search on this table",
  className = "",
}) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      {/* Search Icon */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-11
          pl-11 pr-9
          rounded-lg
          border border-gray-200
          bg-white
          text-sm text-gray-800
          placeholder:text-gray-400
          shadow-sm
          transition
          focus:outline-none
          focus:ring-2 focus:ring-blue-500
          focus:border-blue-500
        "
      />

      {/* Clear Button */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-1 rounded-md
            text-gray-400
            hover:text-gray-600
            hover:bg-gray-100
            transition
          "
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
