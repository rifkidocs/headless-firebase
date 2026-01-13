import { render, screen, fireEvent } from "@testing-library/react";
import { MobileNavbar } from "@/components/cms/MobileNavbar";

describe("MobileNavbar", () => {
  const mockOnOpenMenu = jest.fn();

  it("displays the correct branding name 'Headless Firebase'", () => {
    render(<MobileNavbar onOpenMenu={mockOnOpenMenu} />);
    expect(screen.getByText("Headless Firebase")).toBeInTheDocument();
  });

  it("calls onOpenMenu when the hamburger button is clicked", () => {
    render(<MobileNavbar onOpenMenu={mockOnOpenMenu} />);
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);
    expect(mockOnOpenMenu).toHaveBeenCalledTimes(1);
  });
});
