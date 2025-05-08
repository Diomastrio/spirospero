import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function CustomFontDropdown({
  options,
  selectedOptionValue,
  onChange,
  placeholder = "Select Font",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(
    (option) => option.value === selectedOptionValue
  ) || { name: placeholder, value: "" };

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, dropdownRef]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="select select-bordered select-xs sm:select-sm bg-none !pr-3 w-full flex items-center justify-between text-left focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption.name}</span>
        {isOpen ? (
          <ChevronUp size={16} className="ml-1 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="ml-1 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <ul
          className="absolute z-20 mt-1 w-full bg-base-200 border border-base-300 rounded-md shadow-lg max-h-52 overflow-auto focus:outline-none py-1"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.name}
              className={`px-3 py-1.5 text-sm cursor-pointer ${
                option.value === selectedOptionValue
                  ? "bg-primary text-primary-content"
                  : "text-base-content hover:bg-primary hover:text-primary-content"
              }`}
              onClick={() => handleSelectOption(option)}
              role="option"
              aria-selected={option.value === selectedOptionValue}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomFontDropdown;
