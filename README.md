## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## MongoDB Atlas Authentication

1. Create a free MongoDB Atlas cluster and database user.
2. Allow your development IP address in Atlas Network Access.
3. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `MONGODB_DB_NAME`, and a long random `SESSION_SECRET`.
4. Configure email delivery in `.env.local`. AgentMail is preferred when `AGENTMAIL_API_KEY` and `AGENTMAIL_INBOX_ID` are set; otherwise configure Resend with `RESEND_API_KEY` and `OTP_FROM_EMAIL`.
5. Run `npm run dev`.

The app stores employee accounts in `employees` and payroll records in `payrollRecords`. During registration and admin employee creation, `id` is the exact employee ID issued by the school; it is never auto-generated. Duplicate IDs are rejected. Users can sign in with that employee ID or their email. Passwords are bcrypt-hashed, and login uses an HTTP-only session cookie. The MongoDB URI is used only by the server and is never exposed to the browser.

Registration sends a six-digit email OTP, and the pending registration is stored temporarily in `pendingRegistrations`. After verification, the employee record is created with `approved: false` and no session. An administrator or cashier must approve or reject the account in the Employee Directory; approval/rejection notices are sent to the registered email. Admin-created accounts require an initial password, which is stored as a bcrypt hash. Employees receive a login OTP the first time they sign in on each browser/device; successful verification remembers that browser for one year using an HttpOnly trusted-device cookie. Login sessions expire after one day. OTPs expire after 10 minutes and allow five attempts. Password resets revoke trusted devices.

Payroll records are stored in `payrollRecords`; admins can edit or delete them from Salary Records & Payslips, while employees only receive their own payroll records from the API.

The first administrator must be created directly in MongoDB with `role: "admin"`, a unique `userId`, and a bcrypt `passwordHash`. New accounts created through the app always use the `employee` role.

For initial setup, the app also includes a temporary hardcoded administrator fallback: `Admin001` or `admin@mit.edu.ph` with password `admin123`. This fallback is used only when no matching admin exists in MongoDB. Administrators do not require OTP and can log in directly; employee accounts still require email OTP. Replace the fallback with a MongoDB admin account and remove the hardcoded credentials before production deployment.
