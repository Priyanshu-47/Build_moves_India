"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const showCustom =
    query.trim() && !suggestions.some((s) => s.toLowerCase() === query.toLowerCase());

  const updateMenuPosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !wrapperRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleReposition() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  const dropdown =
    open && menuStyle && (filtered.length > 0 || showCustom) ? (
      <div
        ref={listRef}
        className="fixed z-[200] overflow-hidden rounded-xl border bg-card shadow-xl ring-1 ring-black/5"
        style={{
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
        }}
      >
        <div className="max-h-56 overflow-y-auto overscroll-contain p-1">
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
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-left transition hover:bg-muted",
                value === item && "bg-primary/5 font-medium text-primary"
              )}
            >
              {value === item ? (
                <Check className="size-3.5 shrink-0 text-primary" />
              ) : (
                <span className="size-3.5 shrink-0" />
              )}
              {item}
            </button>
          ))}
          {showCustom && (
            <button
              type="button"
              onClick={() => {
                onValueChange(query.trim());
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg border-t px-3 py-2.5 text-left text-sm font-medium text-primary transition hover:bg-primary/5"
            >
              <span className="size-3.5 shrink-0" />
              Add &quot;{query.trim()}&quot; as custom product
            </button>
          )}
        </div>
      </div>
    ) : null;

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
            updateMenuPosition();
          }}
          onFocus={() => {
            setOpen(true);
            updateMenuPosition();
          }}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border bg-card px-3 pr-9 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((prev) => !prev);
            updateMenuPosition();
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
          aria-label="Toggle suggestions"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {typeof document !== "undefined" && dropdown
        ? createPortal(dropdown, document.body)
        : null}
    </div>
  );
}
