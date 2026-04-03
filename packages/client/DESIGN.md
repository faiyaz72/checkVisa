# Passportal: Design System Specification

**Creative North Star: "The Digital Diplomat"**

Passportal is designed for the modern global traveler, specifically those from the Global South who navigate a complex web of visa requirements. The design language avoids "tech-startup" playfulness in favor of a trustworthy, authoritative, and minimalist aesthetic that feels like a premium travel concierge.

---

## 1. Visual Foundation

### 1.1 Color Palette: "The Executive Tones"

- **Primary:** `#102A43` (Midnight Navy) - Used for headers, primary actions, and brand identity. Represents stability and institutional trust.
- **Secondary:** `#006B5C` (Deep Emerald) - Used for success states and "relative ease" visa categories.
- **Surface:** `#F6FAFE` (Soft Alabaster) - The primary background color to ensure a clean, airy feel.
- **Accent:** `#00BFA5` (Bright Seafoam) - Reserved for high-priority calls to action.

### 1.2 Typography: "The Editorial Authority"

- **Font Family:** `Plus Jakarta Sans`
- **Rationale:** A modern sans-serif with a geometric foundation that maintains high legibility. It bridges the gap between technical precision and human-centric design.
- **Scale:**
  - **H1 (Hero):** 64px, Bold, -0.02em tracking.
  - **H2 (Section):** 32px, Semibold.
  - **Body:** 16px, Medium, 1.6 line-height for optimal readability.

---

## 2. Core Design Principles

### 2.1 Radical Minimalism

Every element on the screen must serve a functional purpose. We prioritize white space to reduce "cognitive load," especially given the inherent complexity of international visa laws.

### 2.2 Visual Hierarchy of Ease

The "Destination Discovery" section uses a "status-first" architecture. We use compact badges and clear status chips (e.g., "E-Visa", "Visa on Arrival") to communicate the ease of entry instantly, without overwhelming the user with text.

### 2.3 Credential-Centric Logic

Unlike generic travel sites, Passportal treats the user's current credentials (US/UK/Schengen visas) as first-class citizens. The toggle interface allows users to "unlock" the world in real-time.

---

## 3. Component Guidelines

### 3.1 The "Passport Badge"

A specialized UI component used in the Discovery section to anchor the user's identity. It should always feature the national flag and clear, bold typography for the country name.

### 3.2 Discovery Cards

- **Imagery:** Must use high-fidelity, real-world photography. No illustrations or generic travel stock.
- **Content:** Name of destination followed by a vertical stack of ease-of-entry badges.
- **Interactions:** Subtle scale transitions on hover (1.02x) to indicate interactivity.

### 3.3 The Compliance Banner

A persistent, expandable legal disclaimer positioned immediately below the global navigation. It uses a high-contrast background to ensure users acknowledge the necessity of official verification.

---

## 4. User Experience Pillars

1. **Zero-Friction Search:** Defaulting to "Bangladesh" (or relevant Global South origins) to provide immediate value.
2. **Contextual Discovery:** Allowing users to filter by visa type (VOA vs. E-Visa) to match their personal travel style.
3. **Institutional Trust:** Maintaining a formal tone that mirrors the seriousness of border control while remaining accessible.
