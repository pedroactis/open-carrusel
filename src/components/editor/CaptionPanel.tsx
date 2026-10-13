"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Hash, MessageSquare, FileDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CarouselMaterial } from "@/types/carousel";

interface CaptionPanelProps {
  carouselId: string;
  caption?: string;
  hashtags?: string[];
  material?: CarouselMaterial;
}

export function CaptionPanel({ carouselId, caption, hashtags, material }: CaptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedDm, setCopiedDm] = useState(false);

  const hasContent = (caption && caption.trim()) || (hashtags && hashtags.length > 0) || material;

  if (!hasContent) return null;

  const handleCopy = async (text: string, type: "caption" | "hashtags" | "dm") => {
    await navigator.clipboard.writeText(text);
    if (type === "dm") {
      setCopiedDm(true);
      setTimeout(() => setCopiedDm(false), 2000);
    } else if (type === "caption") {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  return (
    <div className="border-t border-border bg-surface">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3" />
          {material ? `Legenda, hashtags e material (${material.keyword})` : "Legenda e hashtags"}
        </span>
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          {caption && caption.trim() && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-muted-foreground">
                  Legenda
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] gap-1 px-1.5"
                  onClick={() => handleCopy(caption, "caption")}
                >
                  {copiedCaption ? (
                    <Check className="h-2.5 w-2.5 text-green-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  {copiedCaption ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <p className="text-xs text-foreground bg-muted rounded-md p-2 whitespace-pre-wrap">
                {caption}
              </p>
            </div>
          )}

          {hashtags && hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Hash className="h-2.5 w-2.5" />
                  Hashtags ({hashtags.length})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] gap-1 px-1.5"
                  onClick={() =>
                    handleCopy(hashtags.map((h) => `#${h}`).join(" "), "hashtags")
                  }
                >
                  {copiedHashtags ? (
                    <Check className="h-2.5 w-2.5 text-green-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5" />
                  )}
                  {copiedHashtags ? "Copiadas" : "Copiar todas"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {material && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Send className="h-2.5 w-2.5" />
                  Material da palavra-chave <b className="text-foreground">{material.keyword}</b>
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] gap-1 px-1.5"
                    onClick={() => handleCopy(material.dmText, "dm")}
                  >
                    {copiedDm ? (
                      <Check className="h-2.5 w-2.5 text-green-500" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                    {copiedDm ? "Copiada" : "Copiar mensagem"}
                  </Button>
                  <a
                    href={`/api/carousels/${carouselId}/material`}
                    download
                    className="h-5 inline-flex items-center gap-1 px-1.5 rounded-md text-[10px] font-medium hover:bg-muted"
                  >
                    <FileDown className="h-2.5 w-2.5" />
                    Baixar PDF
                  </a>
                </div>
              </div>
              <p className="text-xs text-foreground bg-muted rounded-md p-2 whitespace-pre-wrap">
                {material.dmText}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                &quot;{material.title}&quot;. Suba o PDF onde o Direct consiga abrir (Drive, site) e troque [LINK DO PDF] pelo link na automação.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
