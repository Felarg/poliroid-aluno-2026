/** A entrada do site encaminha ao feed, que possui uma página própria. */
import { redirect } from "next/navigation";

/** Mantém uma única URL de navegação para o feed. */
export default function HomePage() {
  redirect("/feed");
}
