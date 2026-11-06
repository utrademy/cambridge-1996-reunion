import React from "react";
import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ShareMemoryForm } from "@/components/ShareMemoryForm";

export const metadata: Metadata = {
  title: "Compartir Recuerdo o Fotografía — Promoción 1996",
  description:
    "Envía tus fotografías de 1996 o 2026 y comparte tu mensaje con la Promoción 1996 del New Cambridge School.",
};

export default function CompartirPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
              <HeartHandshake className="h-4 w-4" />
              <span>Participación de Exalumnos · Moderación Previa</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-[#142B53]">
              Compartir mi Recuerdo
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#111827]/80">
              Aporta tus fotografías de la época escolar (1996), postales del
              reencuentro (2026) o un mensaje para tus compañeros de promoción.
            </p>
          </div>

          <ShareMemoryForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
