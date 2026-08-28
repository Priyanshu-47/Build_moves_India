"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ComboboxProps = {
  value: string;
  onValueChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
  id?: string;
};

export function Combobox({
  value,
  onValueChange,
  suggestions,
  placeholder = "Type or select...",
  label,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const showCustom = query.trim() && !suggestions.some((s) => s.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border bg-card px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (filtered.length > 0 || showCustom) && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border bg-card shadow-xl">
          <div className="max-h-52 overflow-y-auto p-1">
            {filtered.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onValueChange(item);
                  setQuery(item);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition hover:bg-muted",
                  value === item && "bg-primary/5 font-medium text-primary"
                )}
              >
                {value === item && <Check className="size-3.5 shrink-0 text-primary" />}
                <span className={value === item ? "" : "pl-5.5"}>{item}</span>
              </button>
            ))}
            {showCustom && (
              <button
                type="button"
                onClick={() => {
                  onValueChange(query.trim());
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg border-t px-3 py-2 text-left text-sm font-medium text-primary transition hover:bg-primary/5"
              >
                <span className="pl-5.5">Add &quot;{query.trim()}&quot; as custom product</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
