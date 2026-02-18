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

  // Return the currently logged in user
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: loggedInUser });
  });

  // Update user information
  await page.route(/\/api\/user\/\d+$/, async (route) => {
    if (route.request().method() === "PUT") {
      const payload = route.request().postDataJSON();

      // Keep track of the old email to clean up the validUsers record
      const oldEmail = loggedInUser?.email;

      // Update the state
      const updatedUser = {
        ...loggedInUser,
        ...payload,
        id: payload.id.toString(), // Ensure ID stays a string for your User type
      };

      loggedInUser = updatedUser;

      if (loggedInUser && loggedInUser.email) {
        // 1. If the email changed, remove the old record
        if (oldEmail && oldEmail !== loggedInUser.email) {
          delete validUsers[oldEmail];
        }
        // 2. Add/Update the record with the new email key
        validUsers[loggedInUser.email] = loggedInUser;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: {
          user: {
            id: payload.id, // Return as number to match your API example
            name: loggedInUser!.name,
            email: loggedInUser!.email,
            roles: loggedInUser!.roles,
          },
          token: "abcdef-new-token",
        },
      });
    } else {
      await route.continue();
    }
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
