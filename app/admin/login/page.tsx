import { constructMetadata } from "@/lib/metadata-utils";
import AdminLoginContent from "./AdminLoginContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    return constructMetadata({
      title: "Admin Login | Headless Firebase CMS",
      description: "Sign in to manage your content and schemas.",
      imageSubtitle: "Admin Portal",
    });
  } catch (e) {
    console.error(e)
    return constructMetadata();
  }
}

export default function LoginPage() {
  return <AdminLoginContent />;
}