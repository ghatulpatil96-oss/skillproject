import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserFromToken, SESSION_COOKIE } from "@/lib/auth";

// Defence in depth: middleware checks the signed cookie, this layout
// re-checks the *actual* admin role from the user store before rendering.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const user = await getUserFromToken(token);
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");
  return <>{children}</>;
}
