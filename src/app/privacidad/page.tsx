import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { contentRepository } from "@/lib/contentRepository";

export const metadata: Metadata = {
  title: "Privacidad y Uso de Imágenes — Promoción 1996",
  description:
    "Aviso de privacidad, uso conmemorativo de fotografías y procedimiento de retiro de contenido para la Promoción 1996.",
};

export default async function PrivacidadPage() {
  const settings = await contentRepository.getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />

      <main id="contenido-principal" className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#142B53]/15 bg-[#FCFBF7] p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#A52728]">
              <ShieldCheck className="h-4 w-4" />
              <span>Transparencia y Protección de Datos</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B53]">
              Aviso de Privacidad y Uso de Fotografías
            </h1>

            <section className="space-y-2 text-sm sm:text-base text-[#111827]/85 leading-relaxed">
              <h2 className="font-serif text-xl font-bold text-[#142B53]">
                1. Iniciativa Independiente de Exalumnos
              </h2>
              <p>
                Este portal web es una iniciativa estrictamente conmemorativa,
                sin ánimo de lucro comercial, organizada de manera independiente
                por exalumnos de la{" "}
                <strong>Promoción 1996 — New Cambridge School</strong> con
                motivo del encuentro de los 30 años (sábado 19 de diciembre de
                2026).
              </p>
            </section>

            <section className="space-y-2 text-sm sm:text-base text-[#111827]/85 leading-relaxed">
              <h2 className="font-serif text-xl font-bold text-[#142B53]">
                2. Moderación Previa y Limpieza de Metadatos (EXIF)
              </h2>
              <p>
                Todas las fotografías y mensajes enviados a través de la sección{" "}
                <Link
                  href="/compartir"
                  className="font-semibold text-[#A52728] underline"
                >
                  Compartir
                </Link>{" "}
                ingresan inicialmente a una bandeja privada de moderación (
                <code>pending-private</code>). Antes de su carga, el sistema
                elimina automáticamente los metadatos de geolocalización y
                cámara (EXIF) y requiere consentimiento explícito del remitente.
              </p>
            </section>

            <section className="space-y-2 text-sm sm:text-base text-[#111827]/85 leading-relaxed">
              <h2 className="font-serif text-xl font-bold text-[#142B53]">
                3. Solicitud de Retiro o Actualización de Contenido
              </h2>
              <p>
                Cualquier integrante de la Promoción 1996 o persona que aparezca
                en una fotografía publicada puede solicitar en cualquier momento
                la ocultación inmediata, deshabilitación de descarga o
                eliminación definitiva de una imagen o relato.
              </p>
            </section>

            <section className="rounded-xl border border-[#142B53]/20 bg-[#F6F2E9] p-5 text-sm text-[#142B53]">
              <h2 className="font-serif text-lg font-bold">
                4. Contacto del Comité Organizador
              </h2>
              <p className="mt-1.5 text-[#111827]/85">
                {settings.organizer_contact_note}
              </p>
              <p className="mt-2 text-xs text-[#111827]/70">
                Nota: No se publica ninguna dirección de correo electrónico no
                verificada hasta que el comité organizador defina el buzón
                oficial definitivo. Mientras tanto, las solicitudes se atienden
                directamente a través del canal oficial del comité de la
                Promoción 1996.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
