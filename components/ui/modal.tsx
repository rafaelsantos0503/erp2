"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | number;

const SIZES: Record<Exclude<ModalSize, number>, number> = {
  sm: 560,
  md: 720,
  lg: 920,
  xl: 1200,
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  width?: number | string;
  maxHeight?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
  width,
  maxHeight = "75vh",
}: ModalProps) {
  if (!isOpen) return null;

  const w = width ?? (typeof size === "number" ? size : SIZES[size]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div
        className="modal-content relative z-50 w-full max-h-[90vh] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
        style={{ 
          maxWidth: typeof w === "string" ? w : `${w}px`,
          borderRadius: '1.5rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          {title && (
            <h2 className="text-xl font-semibold text-card-foreground">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 pt-4 pb-6 custom-scrollbar"
          style={{ maxHeight: typeof maxHeight === "string" ? maxHeight : `${maxHeight}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
