# AGENTS.md --- E-Commerce Backend Development Guidelines

## 1. Project Overview

Develop a secure, scalable, maintainable, and production-ready
e-commerce backend using NestJS and TypeScript.

The backend must support a complete e-commerce ecosystem, including
customer storefronts, admin dashboards, inventory management, order
processing, payment integration, shipping, and business analytics.

### Technology Stack

Category Technology

---

Framework NestJS (latest stable)
Language TypeScript (Strict Mode)
Runtime Node.js LTS
Package Manager Yarn 4
Database PostgreSQL
ORM Prisma ORM
Authentication Passport.js + JWT
Authorization RBAC + Permissions
Validation class-validator + class-transformer
Environment Validation Joi
API Documentation Swagger / OpenAPI
Caching Redis

```{=html}
<!-- | Background Jobs | BullMQ | -->
```

| File Storage \| AWS S3 \|
| Payment Gateway \| Razorpay / Stripe \|
| Email \| Nodemailer / Resend \|
| Testing \| Jest + Supertest \|
| Linting \| ESLint Flat Config \|
| Formatting \| Prettier \|
| Git Hooks \| Husky + lint-staged \|
| Commit Standards \| Commitlint \|
| Containerization \| Docker + Docker Compose \|

Use stable, compatible package versions. Do not install optional
integrations until they are needed.

---

## 2. Architecture Principles

Follow modular, feature-based architecture with clear separation of
responsibilities.

### Core Principles

1.  Organize code by business domain.
2.  Keep controllers responsible for HTTP request handling.
3.  Keep business logic inside services.
4.  Use repositories or dedicated data-access services when database
    complexity justifies them.
5.  Use DTOs for request validation.
6.  Use dependency injection.
7.  Follow SOLID principles.
8.  Maintain loose coupling between modules.
9.  Use database transactions for critical business operations.
10. Avoid unnecessary abstractions and overengineering.
11. Keep business rules independent of external payment and shipping
    providers.
12. Never duplicate business logic across controllers.

### Recommended Folder Structure

```text
src/
├── main.ts
├── app.module.ts
│
├── config/
│   ├── configuration.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── payment.config.ts
│   └── env.validation.ts
│
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   ├── constants/
│   ├── enums/
│   ├── interfaces/
│   └── utils/
│
├── database/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── seed/
│
├── modules/
│   ├── admin/                         # Administrative API Modules (/api/v1/admin/...)
│   │   ├── admin.module.ts
│   │   ├── auth/                      # Staff auth (audience: admin-api)
│   │   ├── products/                  # Product management
│   │   ├── categories/                # Category management
│   │   ├── brands/                    # Brand management
│   │   ├── orders/                    # Order fulfillment & status state machine
│   │   ├── inventory/                 # Stock adjustments & warehouse management
│   │   ├── customers/                 # Customer moderation & account status
│   │   ├── coupons/                   # Promotion & coupon management
│   │   ├── shipping/                  # Shipping methods & shipments
│   │   ├── reviews/                   # Review moderation & approval
│   │   └── analytics/                 # Revenue & operational reporting
│   │
│   ├── storefront/                    # Customer & Public Storefront Modules (/api/v1/store/...)
│   │   ├── storefront.module.ts
│   │   ├── auth/                      # Customer auth (audience: store-api)
│   │   ├── products/                  # Active product browsing & search
│   │   ├── categories/                # Category browsing
│   │   ├── brands/                    # Brand browsing
│   │   ├── cart/                      # Cart management & calculations
│   │   ├── orders/                    # Customer checkout & order tracking
│   │   ├── wishlist/                  # Saved wishlist items
│   │   ├── coupons/                   # Coupon validation against cart
│   │   ├── payments/                  # Payment initiation & verification
│   │   ├── shipping/                  # Method calculation & public tracking
│   │   ├── reviews/                   # Approved reviews & submissions
│   │   └── profile/                   # Customer profile & addresses
│   │
│   ├── health/                        # System health checks (/health)
│   └── ... (shared domain modules & services)
│
├── shared/
│   ├── services/
│   ├── interfaces/
│   └── types/
│
└── test/
```

Create modules according to actual requirements. Do not implement every
module blindly.

---

## 3. Essential E-Commerce Modules

### 3.1 Authentication Module

Responsibilities:

- Customer registration.
- Customer login.
- Admin login.
- Logout.
- Access token management.
- Refresh token rotation.
- Password reset.
- Email verification.
- Account activation.
- Social authentication (optional).

### 3.2 Users Module

Responsibilities:

- User profile management.
- Account information.
- Customer status.
- Account deletion.
- Customer management from admin dashboard.

### 3.3 Catalog Module

Responsibilities:

- Product CRUD.
- Product categories.
- Brands.
- Product images and galleries.
- Product descriptions.
- Product attributes.
- Product variants.
- SKU management.
- Product availability.
- Featured products.
- Product search.
- Product filtering.
- Product sorting.
- Related products.

Support product variants such as:

- Size
- Color
- Material
- Weight
- Storage capacity

Each purchasable variant should have its own SKU and inventory record
where applicable.

### 3.4 Inventory Module

Responsibilities:

- Stock management.
- Stock adjustments.
- Warehouse management (when required).
- Stock reservations.
- Low-stock alerts.
- Inventory movement history.
- Available stock calculation.

Maintain a clear distinction between:

- Physical stock.
- Reserved stock.
- Available stock.

Available stock should never become negative.

### 3.5 Cart Module

Responsibilities:

- Add products to cart.
- Remove products.
- Update quantities.
- Retrieve cart.
- Clear cart.
- Calculate cart totals.
- Validate product availability.

Important rules:

- Verify product and variant availability.
- Recalculate prices on the server.
- Never trust prices submitted by clients.
- Validate stock before checkout.
- Revalidate coupons and promotions during checkout.
- Support guest carts only if required.

### 3.6 Wishlist Module

Responsibilities:

- Add products to wishlist.
- Remove products.
- Retrieve wishlist.
- Prevent duplicate wishlist entries.

### 3.7 Orders Module

Responsibilities:

- Create orders.
- Retrieve order details.
- Customer order history.
- Admin order management.
- Order cancellation.
- Order status management.
- Order tracking.
- Order item management.

Suggested order statuses:

```text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED
```

Maintain payment status separately from order status.

Never allow arbitrary order status transitions. Define and validate
permitted state transitions.

### 3.8 Payments Module

Responsibilities:

- Payment initiation.
- Payment verification.
- Payment status management.
- Payment webhook handling.
- Refund processing.
- Payment transaction history.
- Payment failure handling.

Payment providers:

- Razorpay (India).
- Stripe (international).
- Other providers through separate adapters when required.

Never store raw card details, CVV, or sensitive payment credentials.

Verify payment signatures on the backend. Never trust frontend payment
success callbacks.

Use idempotency keys and unique provider transaction references to
prevent duplicate payment processing.

### 3.9 Shipping Module

Responsibilities:

- Shipping address validation.
- Shipping fee calculation.
- Shipping provider integration.
- Shipment creation.
- Tracking number management.
- Delivery status synchronization.
- Shipping cancellation.

Keep shipping provider logic behind an adapter or service interface.

### 3.10 Coupons and Promotions

Responsibilities:

- Coupon creation.
- Coupon validation.
- Percentage discounts.
- Fixed discounts.
- Minimum order value.
- Maximum discount limits.
- Expiration dates.
- Usage limits.
- Per-customer usage limits.
- Product/category-specific offers.
- Automatic promotions.

Validate all discount conditions on the server.

Prevent concurrent coupon overuse through appropriate transactional
controls.

### 3.11 Reviews Module

Responsibilities:

- Product ratings.
- Product reviews.
- Review moderation.
- Verified purchase checks.
- Review reporting.

Only allow eligible customers to review purchased products if the
business requires verified reviews.

### 3.12 Returns and Refunds

Responsibilities:

- Return requests.
- Return eligibility.
- Return reason management.
- Return approval or rejection.
- Refund initiation.
- Refund status tracking.
- Inventory restoration after approved returns.

Never automatically restore stock merely because a refund was initiated.
Define the appropriate inventory-restoration point in the return
workflow.

### 3.13 Analytics Module

Responsibilities:

- Total sales.
- Revenue reports.
- Order statistics.
- Product performance.
- Customer statistics.
- Inventory reports.
- Best-selling products.
- Average order value.
- Coupon performance.

Use PostgreSQL aggregation and optimized queries.

For expensive analytics, consider background jobs or precomputed
reporting tables.

Do not calculate financial reports from incomplete or unverified payment
transactions.

---

## 4. Database Architecture

### Database Standards

- PostgreSQL is the primary source of truth.
- Use Prisma ORM.
- Use migrations for all schema changes.
- Define appropriate foreign keys.
- Use unique constraints.
- Create indexes for frequently queried columns.
- Use database transactions for critical operations.
- Avoid N+1 query problems.
- Implement pagination.
- Never expose Prisma models directly as API responses.

### Core Database Entities

The database should support the following entities where applicable:

**User Management**

```text
User
Role
Permission
UserRole
RolePermission
Address
RefreshToken
```

**Product Catalog**

```text
Product
ProductVariant
Category
ProductCategory
Brand
ProductImage
ProductAttribute
ProductAttributeValue
```

**Inventory**

```text
Warehouse
Inventory
InventoryMovement
StockReservation
```

**Shopping**

```text
Cart
CartItem
Wishlist
WishlistItem
```

**Orders**

```text
Order
OrderItem
OrderAddress
OrderStatusHistory
```

**Payments**

```text
Payment
PaymentTransaction
PaymentWebhookEvent
Refund
```

**Promotions**

```text
Coupon
CouponUsage
Promotion
```

**Shipping**

```text
Shipment
ShipmentTracking
ShippingMethod
```

**Customer Experience**

```text
Review
ReturnRequest
ReturnItem
Notification
```

### Important Database Design Rules

1.  Use UUID identifiers or another consistent ID strategy.
2.  Use PostgreSQL Decimal types for monetary values.
3.  Never use JavaScript floating-point arithmetic for financial
    calculations.
4.  Store the currency code with monetary amounts.
5.  Use appropriate database indexes.
6.  Use unique SKU constraints.
7.  Preserve historical order item information.
8.  Store product name, SKU, unit price, tax, and discount snapshots in
    order items.
9.  Store shipping and billing address snapshots in orders.
10. Never depend on the current product price to reconstruct historical
    orders.
11. Use createdAt and updatedAt consistently.
12. Use soft deletion only when justified.
13. Use database-level constraints for important invariants.

### Prisma Rules

- Keep the Prisma schema organized.
- Use meaningful model and field names.
- Use enums for controlled states.
- Use explicit relation definitions.
- Create migrations for schema modifications.
- Review generated migrations before production deployment.
- Never use `db push` as a replacement for production migrations.

---

## 5. Critical E-Commerce Business Logic

These rules are mandatory for reliable order and inventory processing.

### 5.1 Checkout Workflow

Recommended checkout sequence:

1.  Validate customer authentication.
2.  Retrieve cart items.
3.  Validate product and variant availability.
4.  Retrieve current product prices.
5.  Recalculate discounts.
6.  Calculate taxes.
7.  Calculate shipping fees.
8.  Calculate final order total.
9.  Validate shipping address.
10. Reserve inventory transactionally.
11. Create a pending order with immutable price snapshots.
12. Initiate payment.
13. Verify payment through a trusted provider response or webhook.
14. Confirm the order after verified payment.
15. Trigger confirmation notifications.

Use a state machine or explicit transition rules for checkout and order
processing.

Do not trust any totals submitted by the frontend.

### 5.2 Inventory Consistency

- Use atomic database operations for stock updates.
- Use transactions when creating orders and reserving stock.
- Prevent overselling under concurrent checkout requests.
- Implement reservation expiration.
- Release expired or failed reservations.
- Record every stock adjustment.
- Use idempotent inventory operations.

Use appropriate isolation levels or conditional updates to handle
concurrency.

### 5.3 Payment Consistency

- A payment must have a unique provider reference.
- Verify payment signatures.
- Verify webhook authenticity.
- Handle duplicate webhook deliveries.
- Record payment attempts.
- Do not mark an order paid based only on a frontend response.
- Never process the same successful payment twice.
- Handle late payment success after reservation expiration.
- Implement reconciliation for inconsistent payment/order states.

### 5.4 Financial Calculations

Use a centralized pricing service.

Example calculation:

```text
Subtotal
- Product Discounts
- Coupon Discounts
+ Tax
+ Shipping Fee
= Final Payable Amount
```

Rules:

- Define the order of discount and tax calculations explicitly.
- Use integer minor units or a decimal arithmetic library for
  calculations.
- Define currency precision.
- Apply consistent rounding rules.
- Store calculated amounts as immutable order snapshots.
- Never independently calculate order totals in multiple modules.

---

## 6. Authentication and Authorization

Use Passport.js with JWT.

### Authentication Requirements

- Access tokens.
- Refresh tokens.
- Refresh token rotation.
- Password hashing using Argon2id or bcrypt.
- Email verification.
- Password reset.
- Logout and token revocation.
- Login rate limiting.

### User Roles

Suggested roles:

```text
SUPER_ADMIN
ADMIN
MANAGER
INVENTORY_MANAGER
ORDER_MANAGER
CUSTOMER_SUPPORT
CUSTOMER
```

Implement RBAC with fine-grained permissions.

Example permissions:

```text
products:create
products:read
products:update
products:delete

orders:create
orders:read
orders:update
orders:cancel

inventory:read
inventory:update

customers:read
customers:update

coupons:create
coupons:update

analytics:read
```

Rules:

1.  Use authentication guards.
2.  Use role and permission decorators.
3.  Enforce resource ownership.
4.  Customers must only access their own carts and orders.
5.  Admin access must be restricted by permissions.
6.  Never trust roles submitted by the client.
7.  Protect sensitive administrative endpoints.

---

## 7. API Design Standards

Use RESTful APIs with URI versioning and clean separation between **Admin** (`/api/v1/admin`) and **Storefront** (`/api/v1/store`) endpoints.

### Admin API Endpoints

```text
POST   /api/v1/admin/auth/login
POST   /api/v1/admin/auth/refresh
POST   /api/v1/admin/auth/logout
GET    /api/v1/admin/auth/me

GET    /api/v1/admin/products
POST   /api/v1/admin/products
GET    /api/v1/admin/products/:id
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id

GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
GET    /api/v1/admin/categories/:id
PATCH  /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id

GET    /api/v1/admin/brands
POST   /api/v1/admin/brands
GET    /api/v1/admin/brands/:id
PATCH  /api/v1/admin/brands/:id
DELETE /api/v1/admin/brands/:id

GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/:id
PATCH  /api/v1/admin/orders/:id/status
POST   /api/v1/admin/orders/:id/cancel

GET    /api/v1/admin/inventory/variant/:variantId
POST   /api/v1/admin/inventory/adjust
GET    /api/v1/admin/inventory/movements
POST   /api/v1/admin/inventory/warehouses
GET    /api/v1/admin/inventory/warehouses

GET    /api/v1/admin/customers
GET    /api/v1/admin/customers/:id
PATCH  /api/v1/admin/customers/:id/status

GET    /api/v1/admin/coupons
POST   /api/v1/admin/coupons
GET    /api/v1/admin/coupons/:id
DELETE /api/v1/admin/coupons/:id

GET    /api/v1/admin/shipping/methods
POST   /api/v1/admin/shipping/methods
POST   /api/v1/admin/shipping/shipments

GET    /api/v1/admin/reviews
PATCH  /api/v1/admin/reviews/:id/approval

GET    /api/v1/admin/analytics/overview
```

### Storefront API Endpoints

```text
POST   /api/v1/store/auth/register
POST   /api/v1/store/auth/login
POST   /api/v1/store/auth/refresh
POST   /api/v1/store/auth/logout
GET    /api/v1/store/auth/me

GET    /api/v1/store/products
GET    /api/v1/store/products/:slug

GET    /api/v1/store/categories
GET    /api/v1/store/categories/:slug

GET    /api/v1/store/brands
GET    /api/v1/store/brands/:slug

GET    /api/v1/store/cart
POST   /api/v1/store/cart/items
PATCH  /api/v1/store/cart/items/:itemId
DELETE /api/v1/store/cart/items/:itemId
DELETE /api/v1/store/cart

POST   /api/v1/store/orders/checkout
GET    /api/v1/store/orders
GET    /api/v1/store/orders/:id
POST   /api/v1/store/orders/:id/cancel

GET    /api/v1/store/wishlist
POST   /api/v1/store/wishlist/:productId
DELETE /api/v1/store/wishlist/:productId

POST   /api/v1/store/coupons/validate

POST   /api/v1/store/payments/initiate
POST   /api/v1/store/payments/verify
POST   /api/v1/store/payments/webhook/razorpay

GET    /api/v1/store/shipping/methods
GET    /api/v1/store/shipping/track/:trackingNumber

GET    /api/v1/store/reviews/product/:productId
POST   /api/v1/store/reviews

GET    /api/v1/store/profile
PATCH  /api/v1/store/profile
```

### API Conventions

- Use appropriate HTTP methods.
- Use appropriate status codes.
- Implement pagination.
- Support filtering and sorting.
- Validate query parameters.
- Use consistent response structures.
- Document endpoints through Swagger.

Example pagination:

```text
GET /api/v1/products?page=1&limit=20
```

Example response:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Never expose internal database errors or stack traces.

---

## 8. Validation and Error Handling

Use class-validator and class-transformer.

Configure a global ValidationPipe:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Requirements:

- Validate all request bodies.
- Validate route parameters.
- Validate query parameters.
- Validate monetary values.
- Validate product quantities.
- Validate file uploads.
- Validate coupon conditions.
- Validate state transitions.

Use custom exception filters when necessary.

Return consistent error responses.

Never silently ignore exceptions.

---

## 9. Security Standards

Follow security best practices.

### Required Measures

- Helmet.
- Restricted CORS.
- JWT authentication.
- RBAC authorization.
- Rate limiting.
- Secure password hashing.
- Input validation.
- SQL injection protection.
- Secure file uploads.
- Request payload limits.
- Sensitive information masking.
- Environment variable validation.
- HTTPS in production.

### E-Commerce Specific Security

1.  Never store raw payment card information.
2.  Verify payment webhooks.
3.  Prevent price manipulation.
4.  Prevent coupon abuse.
5.  Prevent unauthorized order access.
6.  Prevent inventory manipulation.
7.  Validate ownership of uploaded files.
8.  Prevent unauthorized administrative operations.
9.  Implement idempotency for critical operations.
10. Protect authentication and checkout endpoints against abuse.

---

## 10. Redis and Background Jobs

Use Redis for:

- Frequently accessed product information.
- Category caching.
- Rate limiting.
- Temporary verification codes.
- Distributed locks where necessary.
- Background job processing.

Use BullMQ for:

- Email notifications.
- Order confirmation.
- Invoice generation.
- Payment reconciliation.
- Inventory alerts.
- Abandoned cart notifications.
- Product image processing.
- Scheduled reports.

Rules:

- Implement retries.
- Implement failure handling.
- Use idempotent job processors.
- Define job priorities where necessary.
- Avoid using Redis as the primary source of business data.
- Define cache invalidation strategies.

---

## 11. File Storage

Use AWS S3 or another compatible object storage provider.

Support:

- Product images.
- Product galleries.
- Category banners.
- Brand logos.
- User profile images.
- Invoice documents.

Requirements:

- Validate file types.
- Validate file sizes.
- Generate unique filenames.
- Never trust original filenames.
- Restrict executable file uploads.
- Use signed URLs for private resources.
- Keep credentials in environment variables.

Do not store large files directly in PostgreSQL.

---

## 12. ESLint, Prettier and Code Quality

Use ESLint Flat Config and Prettier.

### Dependencies

```bash
yarn add -D eslint @eslint/js typescript-eslint
yarn add -D prettier eslint-config-prettier
yarn add -D eslint-plugin-simple-import-sort
yarn add -D husky lint-staged
yarn add -D @commitlint/cli @commitlint/config-conventional
```

### ESLint Configuration

Use `eslint.config.mjs`.

```javascript
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '.yarn/**', 'generated/**'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      '@typescript-eslint/no-non-null-assertion': 'warn',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  prettier,
);
```

### Prettier Configuration

Create `.prettierrc.json`.

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Create `.prettierignore`.

```text
node_modules
dist
coverage
.yarn
generated
prisma/generated
yarn.lock
```

### Package Scripts

Merge these scripts into the existing `package.json`.

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\"",

    "lint": "eslint \"{src,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,test}/**/*.ts\" --fix",

    "typecheck": "tsc --noEmit",

    "quality": "yarn lint && yarn format:check && yarn typecheck"
  }
}
```

Preserve existing NestJS scripts.

### Husky and lint-staged

Configure `.husky/pre-commit`:

```bash
yarn lint-staged
```

Configure lint-staged in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js,mjs}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### Commitlint

Create `commitlint.config.mjs`:

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
};
```

Configure `.husky/commit-msg`:

```bash
yarn commitlint --edit "$1"
```

Use conventional commits:

```text
feat: add product management
fix: prevent duplicate payment processing
refactor: improve inventory service
docs: update API documentation
test: add checkout integration tests
chore: update dependencies
```

### AI Agent Code Quality Rules

- Always follow ESLint and Prettier configurations.
- Avoid `any`.
- Use type-only imports.
- Remove unused imports.
- Do not disable lint rules without justification.
- Never bypass quality checks to force a commit.
- Run lint, formatting, and TypeScript checks after implementation.
- Do not modify configuration without a valid reason.

---

## 13. Testing Standards

Use Jest and Supertest.

### Required Testing Areas

**Authentication**

- Registration.
- Login.
- Token refresh.
- Unauthorized access.
- Permission checks.

**Products**

- Product creation.
- Product updates.
- Product search.
- Product filtering.
- Variant validation.

**Inventory**

- Stock updates.
- Stock reservations.
- Concurrent checkout.
- Reservation expiration.
- Overselling prevention.

**Cart and Checkout**

- Add/remove items.
- Quantity updates.
- Price recalculation.
- Coupon validation.
- Tax calculations.
- Checkout failures.

**Orders and Payments**

- Order creation.
- Payment verification.
- Duplicate webhooks.
- Payment failures.
- Cancellation.
- Refund processing.

**Security**

- Unauthorized access.
- Invalid input.
- Resource ownership.
- Rate limiting.

Use an isolated test database. Never run tests against production data.

---

## 14. Logging and Monitoring

Use structured logging.

Monitor:

- API requests.
- Application errors.
- Database performance.
- Payment failures.
- Failed webhooks.
- Inventory changes.
- Order processing.
- Background jobs.
- Authentication activity.

Mask sensitive information in logs.

Provide:

```text
GET /api/v1/health
GET /api/v1/health/database
GET /api/v1/health/redis
```

Use appropriate liveness and readiness checks.

---

## 15. Environment Configuration

Create `.env.example`.

```env
NODE_ENV=development
PORT=8000
API_PREFIX=api/v1

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=
```

Only configure credentials for integrations actually used.

Rules:

- Validate environment variables at startup.
- Never commit `.env` files.
- Never hardcode secrets.
- Use different credentials for development and production.
- Never use development secrets in production.

---

## 16. Docker and Deployment

Use Docker and Docker Compose.

Recommended files:

```text
Dockerfile
docker-compose.yml
.dockerignore
```

Local development services may include:

- NestJS API.
- PostgreSQL.
- Redis.
- Optional administration tools.

Requirements:

- Use multi-stage builds.
- Use non-root containers.
- Configure health checks.
- Persist PostgreSQL data.
- Keep secrets outside Docker images.
- Use production dependencies in the runtime image.
- Configure HTTPS through a reverse proxy.
- Enable database backups.
- Monitor application health.

Review Prisma migrations before production deployment.

Never automatically execute destructive migrations.

---

## 17. Performance Optimization

Follow these practices:

1.  Add indexes to frequently queried columns.
2.  Use database pagination.
3.  Optimize product listing queries.
4.  Avoid unnecessary database relations.
5.  Cache frequently accessed catalog data.
6.  Invalidate caches when relevant product data changes.
7.  Use background jobs for expensive operations.
8.  Optimize product image delivery.
9.  Avoid unnecessary database transactions.
10. Use appropriate database connection pooling.
11. Monitor slow queries.
12. Optimize analytics aggregation.

Do not introduce caching without a clear invalidation strategy.

---

## 18. AI Agent Development Workflow

Before modifying the project, follow this workflow.

### Step 1: Inspect

- Read package.json.
- Inspect existing NestJS modules.
- Understand Prisma schema.
- Inspect environment configuration.
- Understand existing coding conventions.
- Identify reusable services.

### Step 2: Plan

Before implementing a feature, identify:

- Business requirements.
- Required modules.
- Database changes.
- API endpoints.
- DTOs and validation.
- Authentication requirements.
- Authorization requirements.
- Transaction boundaries.
- External integrations.
- Required tests.

### Step 3: Implement

- Follow modular architecture.
- Implement business logic inside services.
- Use DTOs.
- Apply validation.
- Implement authorization.
- Use transactions for critical operations.
- Handle exceptions properly.
- Follow security standards.

### Step 4: Verify

Run:

```bash
yarn lint
yarn format:check
yarn typecheck
yarn test
```

Also run E2E tests for critical workflows.

### Step 5: Document

Update relevant documentation:

- Installation guide.
- Environment variables.
- Database schema.
- API documentation.
- Payment integration.
- Checkout workflow.
- Deployment instructions.

---

## 19. Important Instructions for AI Agents

1.  Never rewrite existing modules without understanding their purpose.
2.  Never duplicate existing functionality.
3.  Never install unnecessary dependencies.
4.  Never expose database models directly.
5.  Never trust client-provided prices or totals.
6.  Never trust frontend payment success.
7.  Never allow customers to access other customers' orders.
8.  Never allow inventory to become negative.
9.  Never process payment webhooks without verification.
10. Never process duplicate payment events.
11. Never modify financial records without appropriate auditability.
12. Never change historical order prices when products are updated.
13. Never introduce breaking database changes without explanation.
14. Never disable authentication for convenience.
15. Always consider concurrent requests in checkout and inventory
    operations.
16. Preserve existing project conventions.
17. Prefer maintainable solutions over unnecessary abstractions.
18. Explain important architectural decisions.
19. Keep business rules independent of external service providers.
20. Do not implement speculative features.

---

## 20. Definition of Done

A feature is complete only when the applicable requirements are
satisfied.

- [ ] Correct module architecture.
- [ ] DTOs and request validation.
- [ ] Authentication and authorization.
- [ ] Correct database schema.
- [ ] Database migrations.
- [ ] Transaction handling where required.
- [ ] Business rules implemented.
- [ ] Error handling.
- [ ] Security checks.
- [ ] Unit tests.
- [ ] Integration tests.
- [ ] E2E tests for critical workflows.
- [ ] ESLint checks passing.
- [ ] Prettier checks passing.
- [ ] TypeScript checks passing.
- [ ] Swagger documentation updated.
- [ ] Relevant documentation updated.

---

## Primary Development Objective

Build a production-ready e-commerce backend that supports reliable
product management, inventory tracking, cart operations, checkout,
payments, order processing, shipping, customer management, and business
analytics.

Prioritize:

1.  Data consistency.
2.  Payment security.
3.  Inventory accuracy.
4.  Transaction safety.
5.  Scalable architecture.
6.  Maintainable code.
7.  API security.
8.  Performance.
9.  Testability.
10. Developer experience.

**Golden Rule:** Every financial, payment, inventory, and order
operation must be validated and processed on the server. The frontend is
never the source of truth for business-critical data.

---

## 21. Admin and Storefront API Architecture (Authoritative)

This section defines the required API architecture for this project. If
an older section, example, folder tree, or endpoint convention conflicts
with this section, follow this section. Preserve the existing e-commerce
business rules, security requirements, coding standards, and technology
choices.

### 21.1 Architecture Decision

Build the backend as a **modular monolith** with two separate API
surfaces:

1.  **Admin API** --- used by the admin dashboard and authorized staff.
2.  **Storefront API** --- used by the public website and authenticated
    customers.

Both API surfaces must:

- Run in the same NestJS application.
- Use the same PostgreSQL database and one shared Prisma
  client/PrismaService.
- Have separate NestJS modules, controllers, DTOs, application
  services, and authentication flows.
- Reuse shared domain services for common business rules.
- Enforce their own authorization policies.
- Avoid duplicating business logic.

Do not create separate database connections or duplicate domain modules
just to separate the API routes.

### 21.2 API Route Convention

Set the global API prefix once in `main.ts`:

```typescript
app.setGlobalPrefix('api/v1');
```

Register the two API roots through `RouterModule` in the root
application module:

```typescript
RouterModule.register([
  {
    path: 'admin',
    module: AdminModule,
  },
  {
    path: 'store',
    module: StorefrontModule,
  },
]);
```

The resulting route convention is:

```text
/api/v1/admin/...
/api/v1/store/...
```

Child controllers should use resource paths such as
`@Controller('products')`. Do not repeat `admin`, `store`, or `api/v1`
in child controller paths, because the parent router and global prefix
already provide them.

Example endpoints:

```text
GET    /api/v1/admin/products
POST   /api/v1/admin/products
PATCH  /api/v1/admin/products/:id
DELETE /api/v1/admin/products/:id

GET    /api/v1/store/products
GET    /api/v1/store/products/:slug
GET    /api/v1/store/categories
POST   /api/v1/store/cart/items
POST   /api/v1/store/checkout
GET    /api/v1/store/orders
```

Keep public storefront read endpoints separate from protected customer
endpoints. Apply authentication only where the use case requires it.

### 21.3 Recommended Project Structure

Create modules based on implemented requirements. This is the target
organization, not a requirement to generate every listed module
immediately.

```text
src/
├── main.ts
├── app.module.ts
│
├── config/
│   ├── configuration.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── payment.config.ts
│   └── env.validation.ts
│
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── pipes/
│   ├── constants/
│   ├── enums/
│   ├── interfaces/
│   └── utils/
│
├── database/
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
├── modules/
│   ├── admin/
│   │   ├── admin.module.ts
│   │   ├── auth/
│   │   │   ├── admin-auth.module.ts
│   │   │   ├── admin-auth.controller.ts
│   │   │   ├── admin-auth.service.ts
│   │   │   ├── strategies/
│   │   │   ├── guards/
│   │   │   └── dto/
│   │   ├── products/
│   │   │   ├── admin-products.module.ts
│   │   │   ├── admin-products.controller.ts
│   │   │   ├── admin-products.service.ts
│   │   │   └── dto/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── customers/
│   │   ├── coupons/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   └── storefront/
│       ├── storefront.module.ts
│       ├── auth/
│       │   ├── store-auth.module.ts
│       │   ├── store-auth.controller.ts
│       │   ├── store-auth.service.ts
│       │   ├── strategies/
│       │   ├── guards/
│       │   └── dto/
│       ├── products/
│       │   ├── store-products.module.ts
│       │   ├── store-products.controller.ts
│       │   ├── store-products.service.ts
│       │   └── dto/
│       ├── categories/
│       ├── cart/
│       ├── checkout/
│       ├── orders/
│       ├── wishlist/
│       └── reviews/
│
├── domain/
│   ├── products/
│   │   ├── product-domain.module.ts
│   │   └── product-domain.service.ts
│   ├── pricing/
│   ├── inventory/
│   ├── orders/
│   └── payments/
│
├── shared/
│   ├── payment/
│   ├── storage/
│   ├── notifications/
│   └── redis/
│
└── test/
```

The existing `modules/` folder may be reorganized incrementally. Do not
move or rename all existing files blindly. Inspect dependencies and
update imports, module registrations, and tests as part of each
migration.

### 21.4 Admin and Storefront Module Responsibilities

**Admin modules** provide administrative use cases, such as:

- Product creation, editing, publishing, archiving, and deletion.
- Category and brand management.
- Inventory adjustments and stock movement review.
- Order processing and permitted status transitions.
- Customer support and customer account management.
- Coupon and promotion management.
- Analytics, reports, and settings.
- Staff authentication and permission checks.

**Storefront modules** provide customer and public-facing use cases,
such as:

- Public product and category browsing.
- Product search, filtering, sorting, and detail views.
- Customer registration, login, logout, and token refresh.
- Customer profile and address management.
- Cart and wishlist operations.
- Checkout and order placement.
- Customer order history and permitted cancellation.
- Product reviews and customer-facing order information.

A storefront endpoint must never expose admin-only fields or operations.
An admin endpoint must enforce staff permissions even when the caller
has a valid admin token.

### 21.5 Separate Authentication Systems

Implement two independent authentication boundaries:

**Admin authentication** - Own module, controller, service, DTOs,
Passport strategies, guards, and authorization decorators where
needed. - Authenticate staff/admin accounts only. - Enforce RBAC and
fine-grained permissions. - Use an admin-specific JWT secret or signing
key and a distinct token audience, such as `admin-api`. - Support staff
account status checks, token revocation, and audit logging.

**Storefront authentication** - Own module, controller, service, DTOs,
Passport strategies, and guards. - Authenticate customer accounts
only. - Enforce customer resource ownership. - Use a storefront-specific
JWT secret or signing key and a distinct token audience, such as
`store-api`. - Support customer account status checks, refresh token
rotation, and token revocation.

Mandatory isolation rules:

1.  An admin access token must not authenticate against customer-only
    routes.
2.  A customer access token must not authenticate against admin-only
    routes.
3.  Validate token signature, issuer, audience, expiry, and account
    status.
4.  Never trust a role, user ID, or account type supplied in a request
    body.
5.  Do not share a generic guard that accepts both token types unless a
    narrowly defined endpoint explicitly requires it and its policy is
    documented.
6.  Keep admin and customer refresh-token handling logically separated.
7.  Store password hashes securely and never return them in API
    responses.

Separate secrets must be configured and validated independently, for
example:

```env
ADMIN_JWT_ACCESS_SECRET=
ADMIN_JWT_REFRESH_SECRET=
ADMIN_JWT_ISSUER=
ADMIN_JWT_AUDIENCE=admin-api

STORE_JWT_ACCESS_SECRET=
STORE_JWT_REFRESH_SECRET=
STORE_JWT_ISSUER=
STORE_JWT_AUDIENCE=store-api
```

Use the project's chosen configuration-validation approach. Do not
commit real secrets.

### 21.6 Shared Prisma Database Layer

There must be one shared Prisma module and one PrismaService for the
NestJS application.

- Export PrismaService from the shared PrismaModule.
- Import the PrismaModule where database access is required, or make
  it global only if that matches the existing application convention.
- Do not instantiate PrismaClient separately inside feature modules.
- Do not create separate Prisma clients for Admin and Storefront.
- Keep schema changes and migrations centralized.
- Use the same database constraints and transaction rules for both API
  surfaces.

Both Admin and Storefront may access the same underlying domain data,
but each must expose only the fields and operations appropriate to its
API contract.

### 21.7 Shared Domain Logic Without Shared HTTP Boundaries

Put reusable business rules in domain services. Keep API-specific
orchestration in the corresponding Admin or Storefront application
services.

Example:

```text
AdminProductsController
    -> AdminProductsService
        -> ProductDomainService
            -> PrismaService

StoreProductsController
    -> StoreProductsService
        -> ProductDomainService
            -> PrismaService
```

The shared `ProductDomainService` may provide operations such as product
lookup, SKU validation, price calculation, and product persistence
rules. The Admin service decides whether the caller can create, update,
publish, or archive a product. The Storefront service decides whether a
product is published and visible to customers.

Apply the same pattern where appropriate to pricing, inventory, orders,
and payments.

Rules:

- Do not put HTTP request/response objects in domain services.
- Do not put admin permission checks inside generic domain services.
- Do not put customer ownership rules in generic domain services when
  they belong to the Storefront use case.
- Do not duplicate core pricing, stock, payment, or order invariants.
- Use explicit interfaces and NestJS dependency injection.
- Avoid circular module dependencies; extract a focused domain module
  when necessary.
- Keep transactions at the application/domain operation boundary that
  owns the complete business operation.

### 21.8 Swagger and API Documentation

Document the API surfaces separately, preferably with separate Swagger
documents:

```text
/api/docs/admin
/api/docs/store
```

Use distinct bearer-auth documentation schemes or clear security
descriptions so developers know which token is required. Do not expose
internal-only administrative endpoints in the storefront API
documentation.

### 21.9 CORS and Client Separation

Configure CORS using an explicit allowlist for the admin dashboard and
storefront origins. Do not use unrestricted wildcard origins with
credentialed requests.

Keep client-specific response DTOs and serialization rules separate. Do
not return Prisma model instances directly. Ensure storefront responses
omit internal cost, supplier, moderation, audit, and administrative
fields unless a field is intentionally public.

### 21.10 Required Tests

Add unit, integration, and E2E tests for the architecture, including:

- Admin routes resolve under `/api/v1/admin`.
- Storefront routes resolve under `/api/v1/store`.
- No duplicated `admin`, `store`, or `api/v1` path segments.
- Admin tokens are rejected by protected storefront endpoints.
- Customer tokens are rejected by protected admin endpoints.
- Admin permissions are enforced for staff operations.
- Customers cannot access another customer's cart, address, or orders.
- Unpublished or unavailable products are not exposed through public
  storefront endpoints.
- Both API surfaces use the shared PrismaService.
- Shared pricing, inventory, order, and payment rules remain
  consistent across both surfaces.

### 21.11 Instructions for AI Coding Agents

Before implementing or migrating this architecture:

1.  Inspect the current NestJS version, `package.json`, `app.module.ts`,
    `main.ts`, Prisma setup, auth implementation, and existing feature
    modules.
2.  Map existing features to Admin, Storefront, shared domain, or
    infrastructure responsibilities.
3.  Present a concise implementation plan when the change spans multiple
    modules or affects authentication/database behavior.
4.  Preserve working code and project conventions; migrate
    incrementally.
5.  Do not create duplicate Prisma clients, duplicate business rules, or
    a second database.
6.  Do not assume that a suggested folder exists; inspect the repository
    first.
7.  Update module imports, dependency injection, route registration,
    Swagger, environment validation, and tests together.
8.  Verify the final route paths and token isolation with E2E tests.
9.  Run the available lint, format, typecheck, unit-test, and E2E-test
    commands.
10. Report changed files, migration decisions, commands executed, and
    any checks that could not be completed.

**Architecture objective:** Keep one maintainable NestJS modular
monolith and one PostgreSQL/Prisma data layer, while providing clearly
separated Admin and Storefront APIs with independent authentication and
shared, consistent domain logic.
