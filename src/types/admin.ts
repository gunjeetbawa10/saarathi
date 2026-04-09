export type AdminCredentialRow = {
  id: string;
  username: string;
  password_hash: string;
  updated_at: string;
};

/** Unified admin “Customers” row: bookings + newsletter + contact + Clerk profiles merged by email. */
export type AdminCustomerRow = {
  email: string;
  name: string;
  phone: string;
  lastActivityAt: Date;
  bookingCount: number;
  newsletterSignup: boolean;
  contactSubmissions: number;
  /** True if this email exists in Clerk (synced via webhook or account page). */
  clerkAccount: boolean;
};

export type ClerkCustomerProfileRow = {
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  updated_at: string;
};
