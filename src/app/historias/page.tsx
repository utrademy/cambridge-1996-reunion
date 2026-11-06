import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageSquareQuote, Plus } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { contentRepository } from "@/lib/contentRepository";

export const metadata: Metadata = {
  title: "Recuerdos y Mensajes — Promoción 1996",
  description:
    "Anécdotas, historias y mensajes moderados de la generación 1996 del New Cambridge School.",
};

export default async function HistoriasPage() {
  const stories = await contentRepository.getStories();

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          {/* Header matching V2 Recuerdos y Mensajes Panel */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#142B53]/15 pb-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
                <MessageSquareQuote className="h-4 w-4" />
                <span>Memoria Viva · Class of 1996</span>
              </div>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
                Recuerdos y Mensajes
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#111827]/80 max-w-2xl">
                Anécdotas, historias y mensajes de nuestra generación. Todos los
                relatos pasan por moderación previa para garantizar autenticidad
                y respeto.
              </p>
            </div>

            <Link
              href="/compartir"
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-md bg-[#A52728] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8B1E1F]"
            >
              <Plus className="h-4 w-4" />
              <span>Compartir mi recuerdo</span>
            </Link>
          </div>

          {/* Editorial Integrity Notice */}
          <div className="mb-8 rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] px-5 py-3.5 text-xs sm:text-sm text-[#142B53]">
            <strong>Nota de integridad editorial:</strong> Este muro nunca
            atribuye citas inventadas a compañeros reales. Las tarjetas de
            muestra están señaladas como plantillas demostrativas hasta que cada
            integrante envíe y autorice su propio mensaje.
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {stories.map((story) => (
              <article
                key={story.id}
                className="album-tape-top flex flex-col justify-between rounded-xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="font-serif text-4xl font-bold text-[#A52728] leading-none"
                      aria-hidden="true"
                    >
                      “
                    </span>
                    <span className="rounded-full bg-[#142B53]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#142B53]">
                      {story.year_tag}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#142B53]">
                    {story.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#111827]/85">
                    {story.content}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#142B53]/10 pt-3.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#142B53]">
                      — {story.author_display}
                    </p>
                    <p className="text-xs text-[#111827]/65">
                      {story.author_role}
                    </p>
                  </div>
                  {story.is_verified_author && !story.is_editorial_example ? (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-900/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verificado
                    </span>
                  ) : (
                    <span className="rounded bg-amber-900/10 px-2 py-0.5 text-[11px] font-medium text-amber-900">
                      Muestra editorial
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
