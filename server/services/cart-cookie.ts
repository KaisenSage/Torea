import { cookies } from "next/headers";

const COOKIE_KEY = "torea_cart";

type CartCookie = Record<string, number>;

export async function getCartCookieMap(): Promise<CartCookie> {
  const store = await cookies();
  const raw = store.get(COOKIE_KEY)?.value;

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as CartCookie;
  } catch {
    return {};
  }
}

export async function setCartCookieMap(map: CartCookie) {
  const store = await cookies();
  store.set(COOKIE_KEY, JSON.stringify(map), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCartCookieCount() {
  const parsed = await getCartCookieMap();
  return Object.values(parsed).reduce((sum, qty) => sum + qty, 0);
}

export async function addToCartCookie(key: string, quantity = 1) {
  const parsed = await getCartCookieMap();

  parsed[key] = (parsed[key] || 0) + quantity;
  await setCartCookieMap(parsed);
}
