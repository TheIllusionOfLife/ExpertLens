import { expect, test } from "@playwright/test";
import { seedAuth } from "./helpers/auth";

test("unauthenticated visit to / redirects to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
});

test("login page renders login/register form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/username/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
});

test("login with valid credentials redirected to / and coaches visible", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("testuser");
  await page.getByLabel(/password/i).fill("testpass123");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.locator("[data-testid='coach-card']").first()).toBeVisible();
});

test("login with invalid credentials shows error message", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/username/i).fill("baduser");
  await page.getByLabel(/password/i).fill("badpass");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.locator("p[role='alert']")).toBeVisible();
});

test("register new user redirected to /", async ({ page }) => {
  await page.goto("/login");
  // Switch to register mode
  await page.getByRole("button", { name: /register/i }).first().click();
  await page.getByLabel(/username/i).fill("newuser");
  await page.getByLabel(/password/i).fill("newpass123");
  await page.getByRole("button", { name: /register/i }).last().click();
  await expect(page).toHaveURL("/");
});

test("register with taken username shows error message", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /register/i }).first().click();
  await page.getByLabel(/username/i).fill("existinguser");
  await page.getByLabel(/password/i).fill("anypass");
  await page.getByRole("button", { name: /register/i }).last().click();
  await expect(page.locator("p[role='alert']")).toBeVisible();
});

test("logout button clears auth and redirects to /login", async ({ page }) => {
  await seedAuth(page);
  await page.goto("/");
  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login/);
});
