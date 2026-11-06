import React from "react";
import type { Metadata } from "next";
import { AdminWorkbench } from "@/components/AdminWorkbench";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Configuración del Sitio — Promoción 1996",
};

export default function AdminConfiguracionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory-paper">
      <Navbar />
      <main id="contenido-principal" className="flex-1">
        <AdminWorkbench activeSection="configuracion" />
      </main>
      <Footer />
    </div>
  );
}
