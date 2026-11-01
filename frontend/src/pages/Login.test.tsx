import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";
import { LanguageProvider } from "@/context/LanguageContext";

const api = vi.hoisted(() => ({ loginFarmer: vi.fn(), registerFarmer: vi.fn() }));
vi.mock("@/api", () => api);

const renderLogin = () => render(
  <LanguageProvider><MemoryRouter initialEntries={["/"]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <Routes><Route path="/" element={<Login />} /><Route path="/soil-report" element={<p>Soil report page</p>} /></Routes>
  </MemoryRouter></LanguageProvider>,
);

describe("Login", () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it("logs in with synthetic credentials and persists the secure session fields", async () => {
    api.loginFarmer.mockResolvedValue({ token: "synthetic-token", farmer: { _id: "FARMER-MONGO-1", farmer_id: "FARMER-1", name: "Synthetic Farmer" } });
    renderLogin();
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "synthetic-password" } });
    fireEvent.click(screen.getByRole("button", { name: /farmer login/i }));
    await screen.findByText("Soil report page");
    expect(api.loginFarmer).toHaveBeenCalledWith({ mobile: "9876543210", password: "synthetic-password", language: "en" });
    expect(localStorage.getItem("soil2crop_token")).toBe("synthetic-token");
    expect(localStorage.getItem("farmerId")).toBe("FARMER-MONGO-1");
  });

  it("validates a short password before it sends a request", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: /farmer login/i }));
    await waitFor(() => expect(api.loginFarmer).not.toHaveBeenCalled());
  });
});
