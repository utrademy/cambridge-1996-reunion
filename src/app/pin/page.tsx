import { redirect } from "next/navigation";

/**
 * Stable QR Code Entry Route (`/pin`)
 * Printed on physical commemorative pins/cards — must ALWAYS redirect cleanly to `/`.
 */
export default function PinRedirectPage() {
  redirect("/");
}
