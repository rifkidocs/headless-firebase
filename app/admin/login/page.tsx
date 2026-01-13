import { constructMetadata } from "@/lib/metadata-utils";
import AdminLoginContent from "./AdminLoginContent";

export const metadata = constructMetadata({
  title: "Admin Login | Headless Firebase CMS",
  description: "Sign in to manage your content and schemas.",
  imageSubtitle: "Admin Portal",
});

export default function LoginPage() {
  return <AdminLoginContent />;
}