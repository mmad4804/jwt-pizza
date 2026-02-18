import { test, expect } from "playwright-test-coverage";
import { Role, User } from "../src/service/pizzaService";
import { Page } from "@playwright/test";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;

  let franchises = [
    {
      id: 2,
      name: "LotaPizza",
      admins: [{ id: 4, name: "Frankie", email: "fr@jwt.com" }],
      stores: [{ id: 4, name: "Lehi", totalRevenue: 0 }],
    },
  ];

  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "Kai Chen",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
    "fr@jwt.com": {
      id: "4",
      name: "Frankie",
      email: "fr@jwt.com",
      password: "b",
      roles: [{ objectId: "2", role: Role.Franchisee }],
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

  // A standard menu
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: "LotaPizza",
          stores: [
            { id: 4, name: "Lehi" },
            { id: 5, name: "Springville" },
            { id: 6, name: "American Fork" },
          ],
        },
        { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
        { id: 4, name: "topSpot", stores: [] },
      ],
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });

  // Specific Franchise Detail (The missing link!)
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        json: franchises,
      });
    } else {
      await route.continue();
    }
  });

  // Order a pizza.
  await page.route("*/**/api/order", async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ json: orderRes });
  });

  // Create store
  await page.route(/\/api\/franchise\/\d+\/store$/, async (route) => {
    if (route.request().method() === "POST") {
      const storeReq = route.request().postDataJSON();
      const newStore = { ...storeReq, id: Date.now(), franchiseId: 2 };

      franchises[0].stores.push(newStore);
      console.log(franchises[0].stores);
      await route.fulfill({ status: 200, json: newStore });
    } else {
      await route.continue();
    }
  });

  // Close store
  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
    if (route.request().method() === "DELETE") {
      const urlParts = route.request().url().split("/");
      const storeId = parseInt(urlParts[urlParts.length - 1]);

      // UPDATE STATE: Remove the store
      franchises[0].stores = franchises[0].stores.filter(
        (s) => s.id !== storeId,
      );

      await route.fulfill({ status: 200, json: { message: "store deleted" } });
    } else {
      await route.continue();
    }
  });

  await page.goto("/");
}

test("login and logout", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
  // await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!",
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("register", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("John");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("john@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("johnny");
  await page.getByRole("button", { name: "Register" }).click();
});

test("franchise dashboard login", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("fr@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("b");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
  await page
    .getByLabel("Global")
    .getByRole("link", { name: "Franchise" })
    .click();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page.getByRole("textbox", { name: "store name" }).fill("Cheese Test");
  await page.getByRole("button", { name: "Create" }).click();
  await page
    .getByRole("row", { name: /Cheese Test/ })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Close" }).click();
});
