import { constructMetadata } from "@/lib/metadata-utils";
import AdminLoginContent from "./AdminLoginContent";

export async function generateMetadata(): Promise<Metadata> {
  try {
    return constructMetadata({
      title: "Admin Login | Headless Firebase CMS",
      description: "Sign in to manage your content and schemas.",
      imageSubtitle: "Admin Portal",
    });
  } catch (e) {
    return constructMetadata();
  }
}

export default function LoginPage() {
  return <AdminLoginContent />;
}