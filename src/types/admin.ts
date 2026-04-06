export type AdminCredentialRow = {
  id: string;
  username: string;
  password_hash: string;
  updated_at: string;
};

/** Unified admin “Customers” row: bookings + newsletter + contact leads merged by email. */
export type AdminCustomerRow = {
  email: string;
  name: string;
  phone: string;
  lastActivityAt: Date;
  bookingCount: number;
  newsletterSignup: boolean;
  contactSubmissions: number;
};
