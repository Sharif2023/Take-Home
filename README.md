# ShopSnap – E-Commerce Take-Home Assessment

A modern, responsive React e-commerce application built to fulfill the Frontend Tech Associate take-home assessment requirements.

**🔴 Live Demo:** [https://shopsnap-takehome.vercel.app](https://shopsnap-takehome.vercel.app)

## 🚀 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## 🏗️ Project Architecture Overview

The application is built using **React (Vite)** with a component-driven architecture and a strict separation of concerns:

- **`/src/components`**: Reusable UI components (`Navbar`, `CustomerBadge`, shared UI widgets like `LoadingPage` and `ErrorBanner`).
- **`/src/pages`**: Page-level components corresponding to routing (`ProductsPage`, `CartPage`, `LoginPage`, Admin pages).
- **`/src/store`**: Global state management powered by **Zustand**. 
  - `cartStore.js`: Handles cart logic, totals, and persistence via `localStorage`.
  - `authStore.js`: Manages JWT tokens, user state, and login flows.
- **`/src/lib/api.js`**: Centralized Axios instance with interceptors for attaching tokens and auto-refreshing expired tokens (handling `401` responses).
- **`index.css`**: A comprehensive, modern vanilla CSS stylesheet implementing a cohesive design system (glassmorphism, CSS variables, fluid typography, dark mode aesthetics) without relying on heavy external UI frameworks.

## 🤔 Assumptions & API Limitations Addressed

During development, several gaps in the provided backend APIs were identified. These were gracefully handled on the frontend to ensure a seamless user experience:

1. **Missing Product Description:** 
   - *Issue:* The `/api/products` endpoint returns products with only `name`, `price`, `quantity`, and `imageUrl`. The required `description` field is missing.
   - *Solution:* A deterministic client-side utility (`generateDescription`) constructs a contextual, plausible description based on the product's name. This ensures the UI remains rich and fulfills the description display requirement.
2. **Missing Order Status & Categories:** 
   - *Issue:* The API does not provide an order status or product categories.
   - *Solution:* These are visually mocked (e.g., hardcoded "Completed" status chip and generic "Product" category tags) to match standard e-commerce UI expectations.
3. **Simulated API Failures (50% failure rate):**
   - *Issue:* The checkout endpoint intermittently fails by design.
   - *Solution:* Implemented robust error handling and a "Retry" mechanism directly within the checkout modal to allow users to recover seamlessly without losing their inputted form data.
4. **Missing Order Total Price:** 
   - *Issue:* The backend API does not return a `totalPrice` for orders in the admin dashboard.
   - *Solution:* The frontend recalculates the total price dynamically from the populated `products` array for each order, and formats it as BDT (৳).

## ✨ Additional Features Implemented

Beyond the core requirements, this project includes several "product-quality" enhancements:

- **Premium UI/UX Design:** Implemented a bespoke dark-theme aesthetic utilizing subtle gradients, glassmorphism (`backdrop-filter`), hover micro-animations, and shimmer skeleton loaders for a modern feel.
- **Quick-View Product Modal:** Instead of navigating away to a separate product page, clicking a product card opens a sleek, side-by-side quick-view modal (with Escape-key and backdrop-click support).
- **Client-Side Search & Sorting:** Added a search bar and sorting dropdown (Price, Name) on the product listing page to help users easily navigate the currently loaded page of products.
- **Bangladesh-Specific Checkout Validation:** The checkout form enforces strict BD mobile formatting, prefixing the number with `+880` and strictly accepting the 10-digit number (`1XXXXXXXXX`) to ensure standardized data entry.
- **Privacy-First Returning Customer Detection:** Fulfills the "no identifying information" requirement strictly by setting an anonymous boolean flag (`snap_has_ordered`) in `localStorage` upon a successful order, triggering a "Welcome back" badge globally.
- **JWT Auto-Refresh:** Integrated Axios interceptors to automatically attempt token renewal (`/api/auth/refresh`) when a 401 error is encountered, preventing abrupt logouts.
- **Toast Notifications:** Built a lightweight custom toast notification system for admin actions (product creation, updates, deletions).