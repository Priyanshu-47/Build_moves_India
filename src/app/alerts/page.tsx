import { redirect } from "next/navigation";

export default function AlertsPage() {
  redirect("/opportunities?view=alerts");
}
