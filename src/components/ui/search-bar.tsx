"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  suggestions: string[];
  value?: string;
  onSearch: (query: string) => void;
  onSelect: (value: string) => void;
  didYouMean?: string | null;
  className?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function SearchBar({
  placeholder = "Search…",
  suggestions,
  value,
  onSearch,
  onSelect,
  didYouMean,
  className,
}: SearchBarProps) {
  const listId = useId();
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const filtered = suggestions.filter((item) =>
    normalize(item).includes(normalize(query))
  );

  const showSuggestions = open && query.length > 0 && filtered.length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(query), 300);
    return () => window.clearTimeout(timer);
  }, [query, onSearch]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectSuggestion = useCallback(
    (value: string) => {
      setQuery(value);
      onSelect(value);
      setOpen(false);
    },
    [onSelect]
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((index) => Math.min(index + 1, filtered.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && filtered[highlight]) {
      event.preventDefault();
      selectSuggestion(filtered[highlight]);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-autocomplete="list"
          className="pl-8"
        />
      </div>

      {didYouMean && query.length > 0 && filtered.length === 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Did you mean{" "}
          <button
            type="button"
            className="font-medium text-primary underline underline-offset-2"
            onClick={() => selectSuggestion(didYouMean)}
          >
            {didYouMean}
          </button>
          ?
        </p>
      )}

      {showSuggestions && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-popover py-1 shadow-md"
        >
          {filtered.map((item, index) => (
            <li key={item} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                  index === highlight && "bg-muted"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
