/** Campo de legenda que reúne rótulo, edição e contagem acessível de caracteres. */
"use client";
import { useId } from "react";

interface CaptionFieldProps {
  value: string;
  disabled: boolean;
  onChange: (caption: string) => void;
}

/** Conta pontos de código após trim, seguindo o mesmo critério de validação do servidor. */
export function CaptionField({ value, disabled, onChange }: CaptionFieldProps) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const characterCount = Array.from(value.trim()).length;
  return (
    <div className="space-y-2">
      <label className="block" htmlFor={inputId}>
        Legenda (opcional)
      </label>
      <textarea
        id={inputId}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full rounded border p-3 disabled:opacity-60"
        aria-describedby={helpId}
      />
      <p id={helpId} className="text-sm text-stone-600">
        {characterCount}/2.200 caracteres
      </p>
    </div>
  );
}
