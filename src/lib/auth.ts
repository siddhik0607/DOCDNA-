export interface AuthUser {
  name: string;
  email: string;
}

const AUTH_KEY = "docdna.auth.v1";
const AUTH_EVENT = "docdna-auth-change";

function defaultUser(mode: "signin" | "signup"): AuthUser {
  return mode === "signup"
    ? { name: "New User", email: "new.user@docdna.xyz" }
    : { name: "Demo User", email: "demo@docdna.xyz" };
}

function emitAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  localStorage.setItem("docdna.name", user.name);
  localStorage.setItem("docdna.email", user.email);
  emitAuthChange();
}

export function signIn(mode: "signin" | "signup" = "signin") {
  const user = getAuthUser() ?? defaultUser(mode);
  setAuthUser(user);
  return user;
}

export function signOut() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem("docdna.wallet.v1");
  emitAuthChange();
}

export function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(AUTH_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AUTH_EVENT, handler);
  };
}
