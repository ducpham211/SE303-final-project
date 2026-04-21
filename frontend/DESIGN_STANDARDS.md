# Timsanbong Design Standards & UI Guidelines

This document serves as the official design system and style guide for the Timsanbong project. All developers and designers should adhere to these rules to maintain a premium, consistent user experience.

---

## 1. Core Principles

*   **Flat Design Only:** No gradients allowed for background fills or UI elements (except for the scroll indicator overlay). Use solid colors.
*   **Max Rounding:** All interactive elements (buttons, inputs) and containers (cards, dropdowns) must use heavily rounded corners (pill-shaped or large radii).
*   **Dynamic & Responsive:** Interfaces should feel "alive" using subtle transitions (`duration-200` or `duration-300`) and hover states.
*   **Modern Typography:** Clean, readable sans-serif fonts using modern weight distribution.

---

## 2. Design Tokens

### Colors (CSS Variables)
Found in `src/index.css`:
*   **Primary (Brand):** `#60D86E` (Bright Green)
*   **Primary Dark:** `#45c45a` (Used for hover states)
*   **Primary Light:** `#e8f9eb` (Used for badges/background highlights)
*   **Text (Headings):** `#1a202c` (Dark Navy/Slate)
*   **Text (Body):** `#4a5568`
*   **Background (Secondary):** `#f8faf8`

### Typography
*   **Font Family:** `Inter`, system-ui, sans-serif.
*   **Headings:** Bold/Extrabold (`font-bold` or `font-extrabold`).
*   **Letter Spacing:** Use `tracking-tight` for titles; `tracking-widest` for status labels.

### Border Radii
defined in `tailwind.config.js`:
*   **Buttons/Inputs:** `rounded-full` (Pill-shaped).
*   **Cards:** `rounded-3xl` (1.5rem).
*   **Nav/Dropdowns:** `rounded-2xl` (1rem).

### Shadows
*   **SM:** `0 2px 8px rgba(0, 0, 0, 0.06)`
*   **MD:** `0 4px 24px rgba(0, 0, 0, 0.08)`
*   **LG:** `0 8px 40px rgba(0, 0, 0, 0.10)`

---

## 3. Layout Patterns

### Component Sizing
*   **Section Height:** Landmark sections on the homepage should follow the **"1 Section = Full Height"** rule using `h-screen` or `min-h-screen`.
*   **Vertical Centering:** Use `flex flex-col justify-center` for full-height sections to keep content centered in the viewport.

### Navigation (The Floating Pill)
*   **Style:** `fixed`, pill-shaped, centered horizontally.
*   **Effects:** `bg-white/95`, `backdrop-blur-sm`, with a subtle gray border and `shadow-lg`.
*   **Active State:** The current route must be highlighted with a solid primary green background and white text.

---

## 4. Component Rules

### Interactive Buttons
*   **Standard:** `px-4 py-2 rounded-full font-semibold transition-all duration-200`.
*   **Hover Animation:** Active scale reduction (`active:scale-95`) and vertical translation (`hover:-translate-y-1`) for primary actions.

### Cards
*   **Structure:** White background, `rounded-3xl`, subtle border (`border-gray-100`), and a thumbnail placeholder block (solid color, no imagery if not yet provided).
*   **Spacing:** Always maintain generous internal padding (`p-5` to `p-7`).

---

## 5. UI Feedback & Interaction

*   **No Emojis/Icons (Initial State):** Emojis are currently banned to avoid an "AI-generated" look. Use SVGs or simple geometric shapes (e.g., colored dots) for visual cues.
*   **Scroll Indicators:** Use a fixed bottom-aligned bouncing arrow with a transparent-to-dark gradient on entry sections to guide the user downward.
*   **Scroll to Top:** A floating button (`fixed bottom-6 right-6`) should appear after the user scrolls down `300px`, allowing for a smooth return journey.
