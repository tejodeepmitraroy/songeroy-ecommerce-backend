# AGENTS.md — E-Commerce Backend Development Guidelines

## 1. Project Overview

Develop a secure, scalable, maintainable, and production-ready e-commerce backend using NestJS and TypeScript.

The backend must support a complete e-commerce ecosystem, including customer storefronts, admin dashboards, inventory management, order processing, payment integration, shipping, and business analytics.

### Technology Stack

| Category               | Technology                          |
| ---------------------- | ----------------------------------- |
| Framework              | NestJS (latest stable)              |
| Language               | TypeScript (Strict Mode)            |
| Runtime                | Node.js LTS                         |
| Package Manager        | Yarn 4                              |
| Database               | PostgreSQL                          |
| ORM                    | Prisma ORM                          |
| Authentication         | Passport.js + JWT                   |
| Authorization          | RBAC + Permissions                  |
| Validation             | class-validator + class-transformer |
| Environment Validation | Joi                                 |
| API Documentation      | Swagger / OpenAPI                   |
| Caching                | Redis                               |

<!-- | Background Jobs | BullMQ | -->

| File Storage | AWS S3 |
| Payment Gateway | Razorpay / Stripe |
| Email | Nodemailer / Resend |
| Testing | Jest + Supertest |
| Linting | ESLint Flat Config |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |
| Commit Standards | Commitlint |
| Containerization | Docker + Docker Compose |

Use stable, compatible package versions. Do not install optional integrations until they are needed.

---

## 2. Architecture Principles

Follow modular, feature-based architecture with clear separation of responsibilities.

### Core Principles

1. Organize code by business domain.
2. Keep controllers responsible for HTTP request handling.
3. Keep business logic inside services.
4. Use repositories or dedicated data-access services when database complexity justifies them.
5. Use DTOs for request validation.
6. Use dependency injection.
7. Follow SOLID principles.
8. Maintain loose coupling between modules.
9. Use database transactions for critical business operations.
10. Avoid unnecessary abstractions and overengineering.
11. Keep business rules independent of external payment and shipping providers.
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
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── permissions/
│   ├── addresses/
│   │
│   ├── catalog/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── attributes/
│   │   └── product-variants/
│   │
│   ├── inventory/
│   ├── cart/
│   ├── wishlist/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── coupons/
│   ├── promotions/
│   ├── reviews/
│   ├── returns/
│   ├── refunds/
│   ├── notifications/
│   ├── storage/
│   ├── analytics/
│   ├── audit/
│   └── health/
│
├── shared/
│   ├── services/
│   ├── interfaces/
│   └── types/
│
└── test/
```

Create modules according to actual requirements. Do not implement every module blindly.

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

Each purchasable variant should have its own SKU and inventory record where applicable.

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

Never allow arbitrary order status transitions. Define and validate permitted state transitions.

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

Verify payment signatures on the backend. Never trust frontend payment success callbacks.

Use idempotency keys and unique provider transaction references to prevent duplicate payment processing.

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

Prevent concurrent coupon overuse through appropriate transactional controls.

### 3.11 Reviews Module

Responsibilities:

- Product ratings.
- Product reviews.
- Review moderation.
- Verified purchase checks.
- Review reporting.

Only allow eligible customers to review purchased products if the business requires verified reviews.

### 3.12 Returns and Refunds

Responsibilities:

- Return requests.
- Return eligibility.
- Return reason management.
- Return approval or rejection.
- Refund initiation.
- Refund status tracking.
- Inventory restoration after approved returns.

Never automatically restore stock merely because a refund was initiated. Define the appropriate inventory-restoration point in the return workflow.

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

For expensive analytics, consider background jobs or precomputed reporting tables.

Do not calculate financial reports from incomplete or unverified payment transactions.

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

1. Use UUID identifiers or another consistent ID strategy.
2. Use PostgreSQL Decimal types for monetary values.
3. Never use JavaScript floating-point arithmetic for financial calculations.
4. Store the currency code with monetary amounts.
5. Use appropriate database indexes.
6. Use unique SKU constraints.
7. Preserve historical order item information.
8. Store product name, SKU, unit price, tax, and discount snapshots in order items.
9. Store shipping and billing address snapshots in orders.
10. Never depend on the current product price to reconstruct historical orders.
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

1. Validate customer authentication.
2. Retrieve cart items.
3. Validate product and variant availability.
4. Retrieve current product prices.
5. Recalculate discounts.
6. Calculate taxes.
7. Calculate shipping fees.
8. Calculate final order total.
9. Validate shipping address.
10. Reserve inventory transactionally.
11. Create a pending order with immutable price snapshots.
12. Initiate payment.
13. Verify payment through a trusted provider response or webhook.
14. Confirm the order after verified payment.
15. Trigger confirmation notifications.

Use a state machine or explicit transition rules for checkout and order processing.

Do not trust any totals submitted by the frontend.

### 5.2 Inventory Consistency

- Use atomic database operations for stock updates.
- Use transactions when creating orders and reserving stock.
- Prevent overselling under concurrent checkout requests.
- Implement reservation expiration.
- Release expired or failed reservations.
- Record every stock adjustment.
- Use idempotent inventory operations.

Use appropriate isolation levels or conditional updates to handle concurrency.

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
- Use integer minor units or a decimal arithmetic library for calculations.
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

1. Use authentication guards.
2. Use role and permission decorators.
3. Enforce resource ownership.
4. Customers must only access their own carts and orders.
5. Admin access must be restricted by permissions.
6. Never trust roles submitted by the client.
7. Protect sensitive administrative endpoints.

---

## 7. API Design Standards

Use RESTful APIs with URI versioning.

Example:

```text
/api/v1/auth
/api/v1/users
/api/v1/products
/api/v1/categories
/api/v1/cart
/api/v1/wishlist
/api/v1/orders
/api/v1/payments
/api/v1/coupons
/api/v1/shipping
/api/v1/reviews
/api/v1/admin
/api/v1/analytics
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

1. Never store raw payment card information.
2. Verify payment webhooks.
3. Prevent price manipulation.
4. Prevent coupon abuse.
5. Prevent unauthorized order access.
6. Prevent inventory manipulation.
7. Validate ownership of uploaded files.
8. Prevent unauthorized administrative operations.
9. Implement idempotency for critical operations.
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

1. Add indexes to frequently queried columns.
2. Use database pagination.
3. Optimize product listing queries.
4. Avoid unnecessary database relations.
5. Cache frequently accessed catalog data.
6. Invalidate caches when relevant product data changes.
7. Use background jobs for expensive operations.
8. Optimize product image delivery.
9. Avoid unnecessary database transactions.
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

1. Never rewrite existing modules without understanding their purpose.
2. Never duplicate existing functionality.
3. Never install unnecessary dependencies.
4. Never expose database models directly.
5. Never trust client-provided prices or totals.
6. Never trust frontend payment success.
7. Never allow customers to access other customers' orders.
8. Never allow inventory to become negative.
9. Never process payment webhooks without verification.
10. Never process duplicate payment events.
11. Never modify financial records without appropriate auditability.
12. Never change historical order prices when products are updated.
13. Never introduce breaking database changes without explanation.
14. Never disable authentication for convenience.
15. Always consider concurrent requests in checkout and inventory operations.
16. Preserve existing project conventions.
17. Prefer maintainable solutions over unnecessary abstractions.
18. Explain important architectural decisions.
19. Keep business rules independent of external service providers.
20. Do not implement speculative features.

---

## 20. Definition of Done

A feature is complete only when the applicable requirements are satisfied.

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

Build a production-ready e-commerce backend that supports reliable product management, inventory tracking, cart operations, checkout, payments, order processing, shipping, customer management, and business analytics.

Prioritize:

1. Data consistency.
2. Payment security.
3. Inventory accuracy.
4. Transaction safety.
5. Scalable architecture.
6. Maintainable code.
7. API security.
8. Performance.
9. Testability.
10. Developer experience.

**Golden Rule:** Every financial, payment, inventory, and order operation must be validated and processed on the server. The frontend is never the source of truth for business-critical data.
