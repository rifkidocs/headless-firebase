import { constructMetadata } from "@/lib/metadata-utils";
import StandaloneApiDocs from "./StandaloneApiDocs";

export const metadata = constructMetadata({
  title: "API Documentation | Headless Firebase CMS",
  description: "Explore the interactive API reference for your headless CMS collections.",
  imageSubtitle: "Documentation",
});

export default function StandaloneApiDocsPage() {
  return <StandaloneApiDocs />;
}
