"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CarouselResult } from "@/types/carousel";

interface ResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carouselId: string;
  result?: CarouselResult;
  onSaved: () => void;
}

const FIELDS = [
  { key: "likes", label: "Curtidas", required: true },
  { key: "comments", label: "Comentários", required: true },
  { key: "saves", label: "Salvamentos", required: false },
  { key: "shares", label: "Envios", required: false },
  { key: "follows", label: "Seguidores ganhos", required: false },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

/** Numbers of the published post. They feed the agent's "what worked on this profile". */
export function ResultDialog({ open, onOpenChange, carouselId, result, onSaved }: ResultDialogProps) {
  const [url, setUrl] = useState(result?.url ?? "");
  const [values, setValues] = useState<Record<FieldKey, string>>(() => ({
    likes: result?.likes?.toString() ?? "",
    comments: result?.comments?.toString() ?? "",
    saves: result?.saves?.toString() ?? "",
    shares: result?.shares?.toString() ?? "",
    follows: result?.follows?.toString() ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/carousels/${carouselId}/result`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, ...values }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(err.error || "Não foi possível salvar o resultado");
        return;
      }
      onSaved();
      onOpenChange(false);
    } catch {
      setError("Não foi possível salvar o resultado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay data-oc-overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content data-oc-dialog className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-surface border border-border p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <Dialog.Title className="text-base font-semibold">Resultado do post</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-xs text-muted-foreground mb-5">
            Anote os números depois de 3 dias no ar. O assistente usa os melhores e os piores posts para planejar os próximos.
          </Dialog.Description>

          <div className="space-y-4">
            <div>
              <label htmlFor="result-url" className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Link do post
              </label>
              <Input
                id="result-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label htmlFor={`result-${f.key}`} className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    {f.label}
                    {!f.required && <span className="font-normal"> (opcional)</span>}
                  </label>
                  <Input
                    id={`result-${f.key}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              variant="accent"
              size="sm"
              onClick={handleSave}
              disabled={saving || !url.trim() || !values.likes || !values.comments}
            >
              {saving ? "Salvando…" : "Salvar resultado"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
