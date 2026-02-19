import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";
import { Role, User } from "../src/service/pizzaService";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;

  const validUsers: Record<string, User> = {
    "pd@jwt.com": {
      id: "1",
      name: "pizza diner",
      email: "pd@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "fr@jwt.com": {
      id: "4",
      name: "Frankie",
      email: "fr@jwt.com",
      password: "b",
      roles: [{ objectId: "2", role: Role.Franchisee }],
    },
    "ad@jwt.com": {
      id: "5",
      name: "Admin",
      email: "ad@jwt.com",
      password: "admin",
      roles: [{ role: Role.Admin }],
    },
  };

  // Handle Auth (Login and Logout)
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "PUT" || method === "POST") {
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        return route.fulfill({ status: 401, json: { error: "Unauthorized" } });
      }
      loggedInUser = user;
      await route.fulfill({
        status: 200,
        json: { user: loggedInUser, token: "abcdef" },
      });
    } else if (method === "DELETE") {
      loggedInUser = undefined; // Crucial for mocking "me" correctly
      await route.fulfill({
        status: 200,
        json: { message: "logout successful" },
      });
    }
  });

  // Consolidated User Management (GET, POST, PUT, DELETE)
  await page.route(/\/api\/user\b.*$/, async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    // 1. Handle /api/user/me
    if (url.includes("/api/user/me")) {
      return route.fulfill({ json: loggedInUser || null });
    }

    // 2. Handle Registration (POST /api/user)
    if (method === "POST") {
      const payload = route.request().postDataJSON();
      const newUser = {
        ...payload,
        id: Math.floor(Math.random() * 1000).toString(),
        roles: [{ role: Role.Diner }],
      };
      validUsers[payload.email] = newUser;
      loggedInUser = newUser; // Auto-login on register
      return route.fulfill({
        status: 200,
        json: { user: newUser, token: "abcdef" },
      });
    }

    // 3. Handle /api/user/:id (PUT and DELETE)
    const idMatch = url.match(/\/api\/user\/(\d+)$/);
    if (idMatch) {
      const userId = idMatch[1];

      if (method === "DELETE") {
        const userEntry = Object.entries(validUsers).find(
          ([_, u]) => u.id === userId,
        );
        if (userEntry) {
          delete validUsers[userEntry[0]];
          if (loggedInUser?.id === userId) loggedInUser = undefined;
          return route.fulfill({
            status: 200,
            json: { message: "User deleted" },
          });
        }
        return route.fulfill({ status: 404, json: { error: "Not found" } });
      }

      if (method === "PUT") {
        const payload = route.request().postDataJSON();
        // Update both the logged in state and the "database"
        const updated = { ...loggedInUser, ...payload };
        validUsers[payload.email || loggedInUser!.email] = updated;
        loggedInUser = updated;
        return route.fulfill({
          status: 200,
          json: { user: updated, token: "abcdef" },
        });
      }
    }

    // 4. Handle /api/user (LIST/SEARCH)
    if (method === "GET") {
      const urlObj = new URL(url);

      // Try to get the search term from 'filter', 'name', or 'email' params
      const rawFilter =
        urlObj.searchParams.get("filter") ||
        urlObj.searchParams.get("name") ||
        "";

      // Remove the asterisks and convert to lowercase
      const search = rawFilter.replace(/\*/g, "").toLowerCase();

      const allUsers = Object.values(validUsers);
      const filtered = allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search),
      );

      // Return the filtered results
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          users: filtered.slice(0, 10),
          more: filtered.length > 10,
        },
      });
    }

    await route.continue();
  });

  // Get Order History
  await page.route("*/**/api/order", async (route) => {
    // We only intercept GET here so we don't interfere with POST (placing an order)
    if (route.request().method() === "GET") {
      const ordersRes = {
        dinerId: 2,
        orders: [
          {
            id: 19,
            franchiseId: 1,
            storeId: 1,
            date: "2026-02-03T23:02:28.000Z",
            items: [
              { id: 22, menuId: 1, description: "Veggie", price: 0.0038 },
              { id: 23, menuId: 2, description: "Pepperoni", price: 0.0042 },
            ],
          },
          // ... add your other order objects here ...
          {
            id: 28,
            franchiseId: 1,
            storeId: 1,
            date: "2026-02-03T23:17:30.000Z",
            items: [
              { id: 40, menuId: 1, description: "Veggie", price: 0.0038 },
              { id: 41, menuId: 2, description: "Pepperoni", price: 0.0042 },
            ],
          },
        ],
        page: 1,
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: ordersRes,
      });
    } else {
      await route.continue();
    }
  });

  await page.goto("/");
}

test("updateUser", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
  await page.getByRole("textbox", { name: "Email address" }).fill("pd@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Register" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("textbox").nth(1).fill(`updated-pd@jwt.com`);
  await page.getByRole("textbox").nth(2).fill("dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
  await expect(page.getByRole("main")).toContainText(`updated-pd@jwt.com`);
  await expect(page.getByRole("main")).toContainText("dinerx");

  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(`updated-pd@jwt.com`);
  await page.getByRole("textbox", { name: "Password" }).fill("dinerx");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
  await expect(page.getByRole("main")).toContainText(`updated-pd@jwt.com`);
  await expect(page.getByRole("main")).toContainText("dinerx");
});

test("admin view users", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(`ad@jwt.com`);
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

  const rowCount = await page
    .locator("table")
    .first()
    .locator("tbody tr")
    .count();
  expect(rowCount).toBeGreaterThanOrEqual(3);

  const userTable = page.locator("table").first();
  const searchInput = userTable.locator('input[placeholder="Name"]');
  const searchButton = userTable.getByRole("button", { name: "Search" });

  await searchInput.fill("Frankie");
  await searchButton.click();

  const rows = userTable.locator("tbody tr");
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText("Frankie");
  await expect(rows).not.toContainText("pizza diner");

  const nextButton = userTable.getByRole("button", { name: "Next" });
  const prevButton = userTable.getByRole("button", { name: "Prev" });

  await expect(prevButton).toBeDisabled();
  await nextButton.click();
  await expect(prevButton).toBeEnabled();
});

test("admin delete user", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill(`ad@jwt.com`);
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Admin" }).click();

  const userTable = page.locator("table").first();
  const rowToDelete = userTable.locator("tr", { hasText: "Frankie" });

  const initialRowCount = await userTable.locator("tbody tr").count();
  await rowToDelete.locator("button").click();

  // Assertion: The text "Frankie" should no longer exist in the table
  await expect(userTable).not.toContainText("Frankie");
  const newRowCount = await userTable.locator("tbody tr").count();
  expect(newRowCount).toBe(initialRowCount - 1);
});
