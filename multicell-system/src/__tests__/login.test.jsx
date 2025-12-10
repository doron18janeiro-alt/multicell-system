import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "@/pages/Login";

const loginMock = vi.fn();
const navigateMock = vi.fn();

vi.mock("../contexts/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: loginMock,
    proprietarioId: null,
    loading: false,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Login", () => {
  beforeEach(() => {
    loginMock.mockReset();
    navigateMock.mockReset();
  });

  it("envia credenciais e redireciona para o dashboard", async () => {
    loginMock.mockResolvedValueOnce();

    render(<Login />);

    const emailInput = screen.getByPlaceholderText("Seu e-mail");
    const passwordInput = screen.getByPlaceholderText("Sua senha");
    const submitButton = screen.getByRole("button", { name: /entrar/i });

    await userEvent.type(emailInput, " admin@teste.com ");
    await userEvent.type(passwordInput, "123456");
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("admin@teste.com", "123456");
    });
    expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("mostra feedback quando o login falha", async () => {
    loginMock.mockRejectedValueOnce(new Error("Credenciais inválidas"));

    render(<Login />);

    const emailInput = screen.getByPlaceholderText("Seu e-mail");
    const passwordInput = screen.getByPlaceholderText("Sua senha");

    await userEvent.type(emailInput, "fail@teste.com");
    await userEvent.type(passwordInput, "wrong");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(
      await screen.findByText(/credenciais inválidas/i)
    ).toBeInTheDocument();
  });
});
