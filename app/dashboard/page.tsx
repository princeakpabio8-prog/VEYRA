/**
 * /dashboard — redirects to /my-employees.
 * Keeping the route alive for backward compatibility.
 */
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();
  redirect("/my-employees");
}
