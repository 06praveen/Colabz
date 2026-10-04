# Colabz — Phase 2 Authentication & User Connectivity Learning Guide

Welcome to the **Phase 2 Learning Guide** for Colabz! This guide explains how real authentication connects your React frontend, Express API server, and MongoDB database using Bcrypt, JWTs, and React Context.

---

## 1. Authentication Fundamentals

### Authentication vs. Authorization
* **Authentication (Who are you?)**: Verifying the identity of a user based on credentials (e.g., matching email and password, verifying a JWT token).
* **Authorization (What are you allowed to do?)**: Granting or denying access to specific resources based on permissions or roles (e.g., verifying that a user is an OWNER or MEMBER of a repository before granting access to its code or chat).

### Register vs. Login
* **Register (Sign Up)**: Creates a new user record in MongoDB, validates uniqueness of email, hashes password with Bcrypt, and issues an initial JWT token.
* **Login (Sign In)**: Finds the existing user in MongoDB, verifies the submitted plain password against the stored bcrypt hash with `bcrypt.compare()`, and returns a signed JWT token upon success.

### Session-Based Auth vs. Token-Based Auth (JWT)
| Characteristic | Session-Based Auth | Token-Based Auth (JWT) |
| :--- | :--- | :--- |
| **State Storage** | Server stores session in memory/Redis | Server is **stateless**; token stored on client |
| **Verification** | Server looks up session ID in DB on every request | Server cryptographically verifies signature using secret key |
| **Scalability** | Harder across multiple load-balanced servers | Highly scalable across distributed microservices |
| **Mobile & API** | Cookie handling can be complex across platforms | Standard `Authorization: Bearer <token>` works everywhere |

---

## 2. Password Security & Hashing

### Why Plaintext Passwords are Fatal
Storing plaintext passwords means any database breach, backup leak, or rogue admin query immediately exposes all user accounts and compromises credentials across multiple websites.

### What is Hashing?
Hashing is a **one-way cryptographic mathematical function** that turns input text of any length into a fixed-length string. Unlike encryption, hashing **cannot be decrypted or reversed**.

### What is a Salt and Why is it Essential?
* If two users have the same password (e.g., `Password123`), simple hashing produces the exact same hash for both.
* Attackers use precomputed lookup tables (**Rainbow Tables**) to crack millions of common hashes instantly.
* A **Salt** is random data generated per user and combined with the password before hashing. Even identical passwords will produce completely different hashes with different salts.

### How Bcrypt Works:
```text
Registration:
  Password ("Password123") + Random Salt (10 rounds) ──► bcrypt.hash() ──► $2a$10$e8gV9... (Saved to DB)

Login:
  Entered Password ("Password123") + Stored Hash ──► bcrypt.compare() ──► true / false
```

---

## 3. JSON Web Tokens (JWT) Architecture

A JWT consists of three Base64URL-encoded strings separated by dots (`.`):

```text
Header . Payload . Signature
(eyJhbGci... . eyJ1c2VySWQi... . SflKxwRJ...)
```

1. **Header**: Contains token metadata: algorithm (`HS256`) and type (`JWT`).
2. **Payload (Claims)**: Contains non-sensitive identity claims:
   ```json
   {
     "userId": "66f4c1e87834...",
     "email": "praveen@colabz.io",
     "iat": 1727940000,
     "exp": 1728544800
   }
   ```
   *(Never store passwords or sensitive data in the payload — it is readable by anyone who decodes Base64!)*
3. **Signature**: Cryptographic signature calculated as:
   ```text
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     process.env.JWT_SECRET
   )
   ```

### The Full Request & Verification Flow:
```text
1. User logs in (POST /api/auth/login)
   │
2. Express signs JWT using JWT_SECRET and returns { token }
   │
3. Client stores token in localStorage ('colabz_token')
   │
4. Client attaches header to subsequent API requests:
   Authorization: Bearer <token>
   │
5. authMiddleware intercepts request:
   jwt.verify(token, process.env.JWT_SECRET)
   │
6. Middleware queries User.findById(decoded.userId) and sets req.user
   │
7. Route controller executes with authenticated req.user
```

---

## 4. Express Authentication Pipeline

```text
HTTP Request (POST /api/auth/login)
  │
  ▼
[1] express.json() ──► Parses request body
  │
  ▼
[2] validate(loginValidator) ──► Validates email format & non-empty fields
  │
  ▼
[3] authController.loginUser ──►
    • Normalizes email: email.trim().toLowerCase()
    • User.findOne({ email }).select("+password")
    • bcrypt.compare(password, user.password)
    • jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' })
    • sendSuccess(res, { user, token })
  │
  ▼
[4] Centralized errorHandler ──► Catches any unexpected database or server errors
```

---

## 5. MongoDB & Mongoose in Authentication

* **Finding a user**: `User.findOne({ email: normalizedEmail })` performs an indexed $O(1)$ or $O(\log n)$ lookup.
* **`select: false` on Password**: By adding `select: false` to the password schema definition, Mongoose automatically strips passwords from all regular queries (`find`, `findById`, `populate`), preventing accidental leakage.
* **`select("+password")`**: Explicitly includes the password field only when performing login comparison.
* **Unique Email Index**: Ensures MongoDB rejects duplicate registrations at the database engine level with error code `11000`.

---

## 6. React Authentication & AuthContext

### AuthContext Architecture:
`AuthContext` provides a single source of truth for user authentication across the entire React component tree:
```jsx
const { user, token, isAuthenticated, loading, login, signup, logout } = useAuth();
```

### Eliminating Authentication Flicker:
When a user refreshes the page:
1. `loading` starts as `true`.
2. `useEffect` checks `localStorage.getItem('colabz_token')`.
3. If token exists, calls `GET /api/auth/me` to fetch fresh user profile.
4. `ProtectedRoute` shows a clean loading spinner while `loading === true`.
5. Once verified, `loading` becomes `false` and the protected application renders smoothly without redirecting to `/login`.

### Protected Routes:
```jsx
<Route
  path="/app"
  element={
    <ProtectedRoute>
      <AuthenticatedLayout />
    </ProtectedRoute>
  }
/>
```
If `!isAuthenticated` once loading finishes, `ProtectedRoute` redirects to `/login`.

---

## 7. API Communication with Axios

### Centralized Axios Client (`client/src/services/api.js`):
* **Request Interceptor**: Automatically reads `colabz_token` from `localStorage` and injects `Authorization: Bearer <token>` into every outgoing HTTP request.
* **Response Interceptor**: Automatically catches `401 Unauthorized` responses and cleans up expired local tokens, notifying the app to redirect without manual error checking in every component.

---

## 8. Hands-on Learning Exercises

1. **Create a Test Protected Route**:
   * Add `router.get("/test-protected", protect, (req, res) => res.json({ secret: "Only for logged in users!", user: req.user }));` in `routes/authRoutes.js`.
2. **Explain JWT without looking at notes**:
   * Draw the 3 parts (Header, Payload, Signature) and explain why changing 1 character in the payload breaks the token.
3. **Explain Bcrypt Salt**:
   * Explain why hashing `"123456"` 5 times with bcrypt results in 5 completely different hash strings.
4. **Trace the Authentication Middleware**:
   * Follow a request with an invalid token and trace which line throws an error and what status code is sent.
5. **Create a Simple Login API from scratch**:
   * Write a standalone 15-line Express endpoint that takes username/password and compares them.
6. **Explain Password Hashing vs Encryption**:
   * Why can encryption be reversed with a key, but hashing cannot?
7. **Explain the Sign In Button Workflow**:
   * Trace the execution from `LoginForm.jsx` -> `useAuth().login()` -> `authService.login()` -> `Axios POST` -> `Express authRoutes` -> `authController` -> `Bcrypt` -> `JWT` -> `Response` -> `localStorage` -> `navigate('/app')`.
8. **Explain how React maintains login state**:
   * How does React state survive page reloads? (Answer: `localStorage` + `AuthContext` initialization `useEffect`).
9. **Explain Browser Refresh Behavior**:
   * Why is `loading: true` crucial while `GET /api/auth/me` is running?
10. **Explain Session Expiration Handling**:
    * What triggers the Axios response interceptor on 401 and how does it clean up the expired session?

---

## 9. Technical Interview Questions & Answers

### Q1: What is authentication?
**Answer**: Authentication is the process of verifying that an entity or user is who they claim to be, typically using credentials like an email and password or a cryptographic token.

### Q2: What is the difference between authentication and authorization?
**Answer**: Authentication verifies identity (*who you are*), while authorization determines permissions and access rights (*what you can do*).

### Q3: What is a JSON Web Token (JWT)?
**Answer**: A JWT is an open, compact standard (RFC 7519) for securely transmitting information between parties as a digitally signed JSON object composed of a Header, Payload, and Signature.

### Q4: Why use JWTs instead of traditional server sessions?
**Answer**: JWTs are stateless and self-contained; the server does not need to store session data in memory or databases, allowing horizontal scalability across distributed servers.

### Q5: What is bcrypt and how does it work?
**Answer**: Bcrypt is a password-hashing function based on the Blowfish cipher. It incorporates a salt to protect against rainbow table attacks and includes an adaptive cost factor (work factor) to resist hardware brute-force attacks over time.

### Q6: Why do we hash passwords instead of encrypting them?
**Answer**: Encryption is two-way (can be decrypted with the decryption key). Hashing is one-way (irreversible). If a database is breached, hashed passwords cannot be mathematically reversed to plaintext.

### Q7: What is a salt in password hashing?
**Answer**: A salt is a cryptographically random string appended to a password before hashing, ensuring that identical passwords result in distinct hash values and defeating precomputed rainbow tables.

### Q8: What is Express middleware?
**Answer**: Middleware functions in Express are handlers that have access to `req`, `res`, and `next`. They can execute code, modify `req`/`res`, end the request, or pass control to the next handler using `next()`.

### Q9: How does JWT authentication work in an Express application?
**Answer**: The client sends the token in the `Authorization: Bearer <token>` header. The `authMiddleware` intercepts the request, calls `jwt.verify(token, secret)` to validate the signature and expiration, retrieves the user from MongoDB, and attaches it to `req.user`.

### Q10: Where should the JWT be sent in HTTP requests?
**Answer**: In the `Authorization` HTTP header with the `Bearer ` prefix format (`Authorization: Bearer <token>`).

### Q11: What is a Protected Route in React?
**Answer**: A wrapper component that checks whether the user is authenticated; if true, it renders the child view; if false, it redirects the user to the `/login` route.

### Q12: What does HTTP status code 401 Unauthorized mean?
**Answer**: It indicates that the request lacks valid authentication credentials for the requested resource (missing, invalid, or expired token).

### Q13: What does HTTP status code 409 Conflict mean?
**Answer**: It indicates that the request cannot be completed due to a conflict with the current state of the resource, such as attempting to register an email that already exists.

### Q14: Why should password hashes never be returned from API responses?
**Answer**: Even though password hashes are one-way, exposing them allows attackers to perform offline brute-force and dictionary attacks on the hashes.

### Q15: Why must validation be performed on the backend even if the frontend validates inputs?
**Answer**: Frontend validation can be bypassed easily using tools like Postman, curl, or direct API scripts. Backend validation is the only true security boundary.

### Q16: What is AuthContext in React?
**Answer**: A React Context that stores the authenticated user's state (`user`, `token`, `isAuthenticated`, `loading`) and provides authentication helper methods (`login`, `signup`, `logout`) globally to all components.

### Q17: Why use the Context API for authentication in React?
**Answer**: To avoid "prop drilling" authentication state through dozens of intermediate component layers and to provide a centralized, reactive auth state.

### Q18: What happens when a JWT expires?
**Answer**: `jwt.verify()` throws a `TokenExpiredError`. The backend returns a `401 Unauthorized` response, and the frontend Axios interceptor clears `localStorage` and redirects the user to `/login`.

---
*Phase 2 Complete — Prepared for Phase 3: Projects + Repositories.*
