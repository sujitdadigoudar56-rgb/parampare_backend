# Backend Setup & Architecture

This document outlines the modular architecture for the Parampara backend.

## 1. Project Structure

The project will move from a layered architecture (controllers, models, routes folders) to a **Modular Architecture**. Each features (User, Auth, Product, Order) will be self-contained in `src/modules`.

```
src/
├── config/             # Database configuration, env vars
├── core/               # Shared logic (guards, interceptors, filters)
├── modules/            # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── dto/
│   ├── user/
│   │   ├── user.model.ts
│   │   ├── user.service.ts
│   │   └── ...
│   ├── product/        # [NEW]
│   └── order/          # [NEW]
├── shared/             # Shared utilities
├── app.ts              # App entry point (Express setup)
└── server.ts           # Server listener
```

## 2. Modules

### 2.1 Auth Module
Handles registration, login, and token management.
- **Endpoints**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh-token`
- **Service**: `AuthService` (Hashing, JWT generation)

### 2.2 User Module
Manages user profiles and data.
- **Model**: `User` (Name, Email, Role, Address)
- **Endpoints**:
  - `GET /users/profile`
  - `PUT /users/profile`

### 2.3 Product Module
Manages catalog.
- **Model**: `Product` (Title, Description, Price, Category, Stock, Images)
- **Controller**: `ProductController`
- **Endpoints**:
  - `GET /products` (List with filters)
  - `GET /products/:id`
  - `POST /products` (Admin only)
  - `PUT /products/:id` (Admin only)
  - `DELETE /products/:id` (Admin only)

### 2.4 Order Module
Manages customer orders.
- **Model**: `Order` (User, Products, Total, Status, PaymentInfo)
- **Endpoints**:
  - `POST /orders` (Create order)
  - `GET /orders` (User's history)
  - `GET /orders/:id`
  - `PATCH /orders/:id/status` (Admin)

## 3. Technology Stack
- **Framework**: Express.js (confirmed via package.json)
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Validation**: express-validator or Zod

## 4. Next Steps
1. Refactor `src/controllers/auth.controller.ts` -> `src/modules/auth/auth.controller.ts` & `src/modules/auth/auth.service.ts`.
2. Move `src/models/user.model.ts` -> `src/modules/user/user.model.ts`.
3. Implement `Product` and `Order` modules.
