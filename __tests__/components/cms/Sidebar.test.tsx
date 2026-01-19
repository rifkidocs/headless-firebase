import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/cms/Sidebar";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock firebase/firestore
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(() => jest.fn()),
  query: jest.fn(),
  orderBy: jest.fn(),
  getFirestore: jest.fn(),
}));

// Mock firebase/auth
jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

// Mock @/lib/firebase
jest.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

describe("Sidebar Branding", () => {
  beforeEach(() => {
    (usePathname as jest.mock).mockReturnValue("/admin");
  });

  it("displays the correct branding name 'Headless Firebase'", () => {
    render(<Sidebar />);
    expect(screen.getByText("Headless Firebase")).toBeInTheDocument();
  });
});
