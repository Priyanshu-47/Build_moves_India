import demoAccountsData from "@/data/demo-accounts.json";
import { SellerProfile, SellerProfileSchema } from "@/lib/schemas";
import { clearSeller, setSeller } from "@/lib/store";

const SESSION_KEY = "sahayak-session";

export type DemoAccount = {
  id: string;
  username: string;
  password: string;
  label: string;
  profile: SellerProfile;
  orders: unknown[];
  payments: unknown[];
  bids: unknown[];
  rating: unknown;
  notifications: unknown[];
};

export type AuthSession = {
  accountId: string;
  username: string;
  loggedInAt: string;
};

export type LoginResult =
  | { success: true; seller: SellerProfile }
  | { success: false; error: string };

const accounts = demoAccountsData as DemoAccount[];

export function getDemoAccounts(): DemoAccount[] {
  return accounts;
}

export function findAccountByUsername(username: string): DemoAccount | undefined {
  return accounts.find(
    (account) => account.username.toLowerCase() === username.trim().toLowerCase()
  );
}

export function findAccountById(accountId: string): DemoAccount | undefined {
  return accounts.find((account) => account.id === accountId);
}

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSessionAccountId(): string | null {
  return readSession()?.accountId ?? null;
}

export function login(username: string, password: string): LoginResult {
  const account = findAccountByUsername(username);

  if (!account || account.password !== password) {
    return { success: false, error: "Invalid username or password" };
  }

  const seller = SellerProfileSchema.parse(account.profile);
  const session: AuthSession = {
    accountId: account.id,
    username: account.username,
    loggedInAt: new Date().toISOString(),
  };

  writeSession(session);
  setSeller(seller);

  return { success: true, seller };
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  clearSeller();
}

export function getCurrentUser(): SellerProfile | null {
  const session = readSession();
  if (!session) return null;

  const account = findAccountById(session.accountId);
  if (!account) return null;

  try {
    return SellerProfileSchema.parse(account.profile);
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return readSession() !== null && getCurrentUser() !== null;
}

/** Ensure a demo session exists (default: first account). Used for deep-links from public pages. */
export function ensureDemoSession(username = "ramesh"): LoginResult {
  if (isLoggedIn()) {
    const seller = getCurrentUser();
    if (seller) return { success: true, seller };
  }
  const account = findAccountByUsername(username) ?? accounts[0];
  if (!account) return { success: false, error: "No demo account available" };
  return login(account.username, account.password);
}

export function getCurrentAccount(): DemoAccount | null {
  const session = readSession();
  if (!session) return null;
  return findAccountById(session.accountId) ?? null;
}
