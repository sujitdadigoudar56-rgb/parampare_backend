# API Documentation & Postman Inputs

This document provides the request payloads (JSON bodies) and endpoints for testing the Parampara Backend API in Postman.

## **Base URL**
`http://localhost:5000/api`

---

## **1. Authentication (Auth)**

### **Register (Create Account)**
**Endpoint:** `POST /auth/register`
**Body (JSON):**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "mobile": "9876543210"
}
```

### **Login**
**Endpoint:** `POST /auth/login`
**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### **Send OTP (Login/Register)**
**Endpoint:** `POST /auth/send-otp`
**Body (JSON):**
```json
{
  "identifier": "9876543210", 
  "type": "login" 
}
```
*(Note: `type` can be "login" or "register". `identifier` can be mobile or email if supported)*

### **Verify OTP**
**Endpoint:** `POST /auth/verify-otp`
**Body (JSON):**
```json
{
  "identifier": "9876543210",
  "otp": "123456"
}
```
*(Note: If registering via OTP, you might need to pass `userData` object here if the backend expects it, otherwise register first)*

### **Get Current User Profile**
**Endpoint:** `GET /auth/userDetails`
**Headers:** `Authorization: Bearer <your_token_here>`

---

## **2. Products**

### **Get All Products**
**Endpoint:** `GET /products`
**Query Params (Optional):**
- `?page=1`
- `?limit=10`
- `?category=Sarees`
- `?sort=price` (or `-price`)

### **Get Single Product**
**Endpoint:** `GET /products/:id`
*(Replace `:id` with the actual Product ID)*

### **Create Product (Admin Only)**
**Endpoint:** `POST /products`
**Headers:** `Authorization: Bearer <admin_token>`
**Body (JSON):**
```json
{
  "name": "Banarasi Silk Saree",
  "description": "Elegant red Banarasi silk saree with gold zari work.",
  "price": 5000,
  "category": "Sarees",
  "stockQuantity": 50,
  "images": [
    "https://example.com/saree1.jpg",
    "https://example.com/saree2.jpg"
  ],
  "attributes": {
    "color": "Red",
    "fabric": "Silk"
  },
  "badges": ["Bestseller", "New"],
  "deliveryTimeDays": "5-7"
}
```

---

## **3. Cart**
*All Cart routes require `Authorization` header.*

### **Get Cart**
**Endpoint:** `GET /cart`

### **Add to Cart**
**Endpoint:** `POST /cart/add`
**Body (JSON):**
```json
{
  "productId": "65b2f8a9e9b0d12345678901",
  "quantity": 1
}
```

### **Update Cart Item**
**Endpoint:** `PUT /cart/update`
**Body (JSON):**
```json
{
  "productId": "65b2f8a9e9b0d12345678901",
  "quantity": 3
}
```

### **Remove from Cart**
**Endpoint:** `DELETE /cart/remove`
**Body (JSON):**
```json
{
  "productId": "65b2f8a9e9b0d12345678901"
}
```

---

## **4. User (Address & Wishlist)**
*All User routes require `Authorization` header.*

### **Get Addresses**
**Endpoint:** `GET /user/addresses`

### **Add Address**
**Endpoint:** `POST /user/addresses`
**Body (JSON):**
```json
{
  "fullName": "John Doe",
  "mobile": "9876543210",
  "house": "Flat 101, Galaxy Apts",
  "street": "MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "landmark": "Near Metro Station",
  "isDefault": true
}
```

### **Update Address**
**Endpoint:** `PUT /user/addresses/:addressId`
**Body (JSON):** *(Same as Add Address, fields are optional)*

### **Get Wishlist**
**Endpoint:** `GET /user/wishlist`

### **Toggle Wishlist (Add/Remove)**
**Endpoint:** `POST /user/wishlist/:productId`
*(No body required)*

---

## **5. Orders**
*All Order routes require `Authorization` header.*

### **Create Order**
**Endpoint:** `POST /orders`
**Body (JSON):**
```json
{
  "items": [
    {
      "productId": "65b2f8a9e9b0d12345678901",
      "quantity": 1
    }
  ],
  "addressId": "65b3a1d2f8c0e12345678902",
  "paymentMethod": "COD"
}
```
*(Note: `addressId` must be a valid ID from your saved addresses)*

### **Get My Orders**
**Endpoint:** `GET /orders`

### **Cancel Order**
**Endpoint:** `PUT /orders/:orderId/cancel`
