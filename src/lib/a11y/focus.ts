export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);
}

export function focusElementById(id: string): void {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLElement)) return;
  element.focus();
  element.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function focusFirstFocusable(container: HTMLElement): void {
  const [first] = getFocusableElements(container);
  first?.focus();
}
