import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared behavior for overlay dialogs: lock body scroll, keep Tab focus inside
// the node, close on Escape, and restore focus to whatever opened it. Pass
// isOpen so always-mounted modals (that render null when closed) only engage
// while shown. The initial focus goes to a [data-autofocus] child if present,
// else the node itself - so give the container tabIndex={-1}.
export function useModal(ref, onClose, isOpen = true) {
  // Keep the latest onClose without re-running the main effect when its identity
  // changes (an inline arrow prop would otherwise re-trap focus every render).
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    if (!isOpen) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (node.querySelector("[data-autofocus]") || node).focus?.();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const f = node.querySelectorAll(FOCUSABLE);
      if (!f.length) { e.preventDefault(); node.focus?.(); return; }
      const first = f[0];
      const last = f[f.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);

    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [ref, isOpen]);
}
