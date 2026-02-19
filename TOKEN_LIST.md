# Design Token List - Next Foundations

This document provides a comprehensive list of all design tokens used in the Next Foundations project. Tokens are organized by category for easy reference and auditing.

---

## Table of Contents

1. [Border Radius Tokens](#border-radius-tokens)
2. [Core Semantic Colors](#core-semantic-colors)
3. [Status Colors](#status-colors)
4. [Brand Colors](#brand-colors)
5. [Payment Brand Colors](#payment-brand-colors)
6. [Product Badge Colors](#product-badge-colors)
7. [Loyalty Badge Colors](#loyalty-badge-colors)
8. [Star Rating Colors](#star-rating-colors)
9. [Agentic Experience Tokens](#agentic-experience-tokens)
10. [Shadow Tokens](#shadow-tokens)
11. [Z-Index Tokens](#z-index-tokens)
12. [Opacity Tokens](#opacity-tokens)
13. [Transition/Duration Tokens](#transitionduration-tokens)
14. [Component Spacing Tokens](#component-spacing-tokens)
15. [Typography Tokens](#typography-tokens)
16. [Breakpoint Tokens](#breakpoint-tokens)

---

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0.5rem` | Base radius |
| `--radius-sm` | `0.25rem` | Small radius |
| `--radius-md` | `0.375rem` | Medium radius |
| `--radius-lg` | `0.5rem` | Large radius |
| `--radius-xl` | `0.75rem` | Extra large radius |
| `--radius-2xl` | `1rem` | 2XL radius |
| `--radius-3xl` | `1.5rem` | 3XL radius |
| `--radius-full` | `9999px` | Full circle |
| `--radius-button` | `var(--radius-lg)` | Button radius |
| `--radius-card` | `var(--radius-xl)` | Card radius |
| `--radius-modal` | `var(--radius-2xl)` | Modal radius |
| `--radius-badge` | `var(--radius-md)` | Badge radius |
| `--radius-input` | `var(--radius-lg)` | Input radius |

**Tailwind Classes:** `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`, `rounded-button`, `rounded-card`, `rounded-modal`, `rounded-badge`, `rounded-input`

---

## Core Semantic Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `oklch(1 0 0)` | `oklch(0.07 0 0)` | Main background |
| `--foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Main text |
| `--card` | `oklch(1 0 0)` | `oklch(0.14 0 0)` | Card background |
| `--card-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Card text |
| `--popover` | `oklch(1 0 0)` | `oklch(0.14 0 0)` | Popover background |
| `--popover-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Popover text |
| `--primary` | `oklch(0.59 0.2 264)` | `oklch(0.98 0 0)` | Primary color |
| `--primary-foreground` | `oklch(1 0 0)` | `oklch(0 0 0)` | Primary text |
| `--secondary` | `oklch(0.96 0 0)` | `oklch(0.20 0 0)` | Secondary color |
| `--secondary-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Secondary text |
| `--muted` | `oklch(0.96 0 0)` | `oklch(0.20 0 0)` | Muted background |
| `--muted-foreground` | `oklch(0.45 0 0)` | `oklch(0.62 0 0)` | Muted text |
| `--accent` | `oklch(0.96 0 0)` | `oklch(0.20 0 0)` | Accent color |
| `--accent-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Accent text |
| `--destructive` | `oklch(0.55 0.22 27)` | `oklch(0.62 0 0)` | Destructive color |
| `--destructive-foreground` | `oklch(1 0 0)` | `oklch(0 0 0)` | Destructive text |
| `--border` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 10%)` | Border color |
| `--input` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 15%)` | Input border |
| `--ring` | `oklch(0.59 0.2 264)` | `oklch(0.62 0 0)` | Focus ring |

**Tailwind Classes:** `bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `bg-primary`, `text-primary-foreground`, etc.

---

## Status Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--success` | `oklch(0.55 0.16 145)` | - | Success color |
| `--success-foreground` | `oklch(1 0 0)` | - | Success text |
| `--success-light` | `oklch(0.94 0.04 145)` | - | Success light background |
| `--warning` | `oklch(0.75 0.15 85)` | - | Warning color |
| `--warning-foreground` | `oklch(0.25 0 0)` | - | Warning text |
| `--warning-light` | `oklch(0.96 0.04 85)` | - | Warning light background |
| `--info` | `oklch(0.59 0.2 264)` | - | Info color |
| `--info-foreground` | `oklch(1 0 0)` | - | Info text |
| `--info-light` | `oklch(0.95 0.03 264)` | - | Info light background |
| `--error` | `oklch(0.55 0.22 27)` | - | Error color |
| `--error-foreground` | `oklch(1 0 0)` | - | Error text |
| `--error-light` | `oklch(0.95 0.04 27)` | - | Error light background |

**Tailwind Classes:** `bg-success`, `text-success-foreground`, `bg-success-light`, `bg-warning`, `text-warning-foreground`, `bg-warning-light`, `bg-info`, `text-info-foreground`, `bg-info-light`, `bg-error`, `text-error-foreground`, `bg-error-light`

---

## Brand Colors

### Brand Blue Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-blue-50` | `oklch(0.97 0.02 264)` | Lightest blue |
| `--brand-blue-100` | `oklch(0.93 0.04 264)` | Very light blue |
| `--brand-blue-200` | `oklch(0.88 0.08 264)` | Light blue |
| `--brand-blue-300` | `oklch(0.78 0.12 264)` | Medium-light blue |
| `--brand-blue-400` | `oklch(0.68 0.16 264)` | Medium blue |
| `--brand-blue-500` | `oklch(0.59 0.2 264)` | Base blue (primary) |
| `--brand-blue-600` | `oklch(0.52 0.2 264)` | Medium-dark blue |
| `--brand-blue-700` | `oklch(0.46 0.18 264)` | Dark blue |
| `--brand-blue-800` | `oklch(0.42 0.16 264)` | Very dark blue |
| `--brand-blue-900` | `oklch(0.38 0.14 264)` | Darkest blue |

**Tailwind Classes:** `bg-brand-blue-50` through `bg-brand-blue-900`, `text-brand-blue-50` through `text-brand-blue-900`

### Brand Gray Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-gray-50` | `oklch(0.98 0 0)` | Lightest gray |
| `--brand-gray-100` | `oklch(0.96 0 0)` | Very light gray |
| `--brand-gray-200` | `oklch(0.93 0 0)` | Light gray |
| `--brand-gray-300` | `oklch(0.88 0 0)` | Medium-light gray |
| `--brand-gray-400` | `oklch(0.74 0 0)` | Medium gray |
| `--brand-gray-500` | `oklch(0.62 0 0)` | Base gray |
| `--brand-gray-600` | `oklch(0.46 0 0)` | Medium-dark gray |
| `--brand-gray-700` | `oklch(0.38 0 0)` | Dark gray |
| `--brand-gray-800` | `oklch(0.26 0 0)` | Very dark gray |
| `--brand-gray-900` | `oklch(0.13 0 0)` | Darkest gray |

**Tailwind Classes:** `bg-brand-gray-50` through `bg-brand-gray-900`, `text-brand-gray-50` through `text-brand-gray-900`

### Brand Core Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-black` | `oklch(0 0 0)` | Pure black |
| `--brand-white` | `oklch(1 0 0)` | Pure white |

**Tailwind Classes:** `bg-brand-black`, `text-brand-black`, `bg-brand-white`, `text-brand-white`

---

## Payment Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--payment-paypal-blue` | `oklch(0.52 0.12 250)` | PayPal blue |
| `--payment-paypal-yellow` | `oklch(0.87 0.15 90)` | PayPal yellow |
| `--payment-paypal-dark` | `oklch(0.35 0.1 250)` | PayPal dark |
| `--payment-venmo-blue` | `oklch(0.55 0.18 250)` | Venmo blue |
| `--payment-visa-blue` | `oklch(0.35 0.15 265)` | Visa blue |
| `--payment-mastercard-red` | `oklch(0.55 0.22 27)` | Mastercard red |
| `--payment-mastercard-orange` | `oklch(0.75 0.18 65)` | Mastercard orange |
| `--payment-amex-blue` | `oklch(0.45 0.12 250)` | Amex blue |
| `--payment-amazon-gray` | `oklch(0.95 0 0)` | Amazon gray |
| `--payment-applepay-black` | `oklch(0 0 0)` | Apple Pay black |
| `--payment-googlepay-gray` | `oklch(0.96 0 0)` | Google Pay gray |

**Tailwind Classes:** `bg-payment-paypal-blue`, `text-payment-paypal-blue`, etc.

---

## Product Badge Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--badge-new` | `oklch(0.55 0.16 145)` | New badge |
| `--badge-new-foreground` | `oklch(1 0 0)` | New badge text |
| `--badge-bestseller` | `oklch(0.59 0.2 264)` | Bestseller badge |
| `--badge-bestseller-foreground` | `oklch(1 0 0)` | Bestseller badge text |
| `--badge-online-only` | `oklch(0.55 0.2 300)` | Online only badge |
| `--badge-online-only-foreground` | `oklch(1 0 0)` | Online only badge text |
| `--badge-limited` | `oklch(0.65 0.18 50)` | Limited badge |
| `--badge-limited-foreground` | `oklch(1 0 0)` | Limited badge text |
| `--badge-sale` | `oklch(0.59 0.2 264)` | Sale badge |
| `--badge-sale-foreground` | `oklch(1 0 0)` | Sale badge text |
| `--badge-out-of-stock` | `oklch(0.55 0.22 27)` | Out of stock badge |
| `--badge-out-of-stock-foreground` | `oklch(1 0 0)` | Out of stock badge text |

**Tailwind Classes:** `bg-badge-new`, `text-badge-new-foreground`, etc.

---

## Loyalty Badge Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--loyalty-platinum` | `oklch(0.55 0.2 300)` | Platinum badge |
| `--loyalty-platinum-light` | `oklch(0.94 0.04 300)` | Platinum badge light |
| `--loyalty-gold` | `oklch(0.75 0.15 85)` | Gold badge |
| `--loyalty-gold-light` | `oklch(0.96 0.04 85)` | Gold badge light |
| `--loyalty-silver` | `oklch(0.62 0 0)` | Silver badge |
| `--loyalty-silver-light` | `oklch(0.96 0 0)` | Silver badge light |
| `--loyalty-bronze` | `oklch(0.65 0.18 50)` | Bronze badge |
| `--loyalty-bronze-light` | `oklch(0.96 0.04 50)` | Bronze badge light |

**Tailwind Classes:** `bg-loyalty-platinum`, `bg-loyalty-platinum-light`, etc.

---

## Star Rating Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--star-filled` | `oklch(0.80 0.16 85)` | Filled star |
| `--star-empty` | `oklch(0.88 0 0)` | Empty star |

**Tailwind Classes:** `bg-star-filled`, `bg-star-empty`, `text-star-filled`, `text-star-empty`

---

## Agentic Experience Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--agentic` | `oklch(0.98 0 0)` | `oklch(0.14 0 0)` | Agent panel background |
| `--agentic-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Agent panel text |
| `--agentic-primary` | `oklch(0.59 0.2 264)` | `oklch(0.98 0 0)` | Primary actions (buttons, user messages) |
| `--agentic-primary-foreground` | `oklch(1 0 0)` | `oklch(0 0 0)` | Primary text |
| `--agentic-accent` | `oklch(0.96 0.01 264)` | `oklch(0.20 0.02 264)` | Accent/hover states |
| `--agentic-accent-foreground` | `oklch(0.13 0 0)` | `oklch(0.98 0 0)` | Accent text |
| `--agentic-border` | `oklch(0.91 0 0)` | `oklch(1 0 0 / 10%)` | Borders |
| `--agentic-ring` | `oklch(0.59 0.2 264)` | `oklch(0.62 0 0)` | Focus ring |
| `--agentic-muted` | `oklch(0.96 0 0)` | `oklch(0.20 0 0)` | Muted background |
| `--agentic-muted-foreground` | `oklch(0.45 0 0)` | `oklch(0.62 0 0)` | Muted text |
| `--agentic-input` | `oklch(0.96 0 0)` | `oklch(0.20 0 0)` | Input background |

**Tailwind Classes:** `bg-agentic`, `text-agentic-foreground`, `bg-agentic-primary`, `text-agentic-primary-foreground`, `bg-agentic-accent`, `text-agentic-accent-foreground`, `border-agentic-border`, `bg-agentic-muted`, `text-agentic-muted-foreground`, `bg-agentic-input`

---

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px 0 oklch(0 0 0 / 5%)` | Extra small shadow |
| `--shadow-sm` | `0 1px 3px 0 oklch(0 0 0 / 10%), 0 1px 2px -1px oklch(0 0 0 / 10%)` | Small shadow |
| `--shadow-md` | `0 4px 6px -1px oklch(0 0 0 / 10%), 0 2px 4px -2px oklch(0 0 0 / 10%)` | Medium shadow |
| `--shadow-lg` | `0 10px 15px -3px oklch(0 0 0 / 10%), 0 4px 6px -4px oklch(0 0 0 / 10%)` | Large shadow |
| `--shadow-xl` | `0 20px 25px -5px oklch(0 0 0 / 10%), 0 8px 10px -6px oklch(0 0 0 / 10%)` | Extra large shadow |
| `--shadow-2xl` | `0 25px 50px -12px oklch(0 0 0 / 25%)` | 2XL shadow |
| `--shadow-card` | `var(--shadow-sm)` | Card shadow |
| `--shadow-card-hover` | `var(--shadow-lg)` | Card hover shadow |
| `--shadow-dropdown` | `var(--shadow-lg)` | Dropdown shadow |
| `--shadow-modal` | `var(--shadow-xl)` | Modal shadow |
| `--shadow-button` | `var(--shadow-sm)` | Button shadow |

**Tailwind Classes:** `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-card`, `shadow-card-hover`, `shadow-dropdown`, `shadow-modal`, `shadow-button`

---

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | `50` | Dropdown menus |
| `--z-sticky` | `100` | Sticky elements |
| `--z-fixed` | `200` | Fixed elements |
| `--z-modal-backdrop` | `400` | Modal backdrop |
| `--z-modal` | `500` | Modal content |
| `--z-popover` | `600` | Popover |
| `--z-tooltip` | `700` | Tooltip |
| `--z-toast` | `800` | Toast notifications |

**Tailwind Classes:** `z-dropdown`, `z-sticky`, `z-fixed`, `z-modal-backdrop`, `z-modal`, `z-popover`, `z-tooltip`, `z-toast`

---

## Opacity Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--opacity-backdrop` | `0.5` | Default backdrop |
| `--opacity-backdrop-heavy` | `0.7` | Heavy backdrop |
| `--opacity-backdrop-light` | `0.4` | Light backdrop |
| `--opacity-disabled` | `0.5` | Disabled elements |
| `--opacity-hover` | `0.8` | Hover state |
| `--opacity-muted` | `0.6` | Muted elements |

**Tailwind Classes:** `opacity-backdrop`, `opacity-backdrop-heavy`, `opacity-backdrop-light`, `opacity-disabled`, `opacity-hover`, `opacity-muted`

---

## Transition/Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Fast transitions |
| `--duration-normal` | `200ms` | Normal transitions |
| `--duration-slow` | `300ms` | Slow transitions |
| `--duration-slower` | `500ms` | Slower transitions |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Ease in |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Ease out |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Ease in-out |

**Tailwind Classes:** `duration-fast`, `duration-normal`, `duration-slow`, `duration-slower`, `ease-default`, `ease-in`, `ease-out`, `ease-in-out`

---

## Component Spacing Tokens

| Token | Base Value | sm (640px+) | lg (1024px+) | Usage |
|-------|------------|-------------|--------------|-------|
| `--spacing-modal-padding` | `1rem` | `1.5rem` | `2rem` | Modal padding |
| `--spacing-card-padding` | `1rem` | `1rem` | `1rem` | Card padding |
| `--spacing-section-gap` | `2rem` | `3rem` | `4rem` | Section gap |
| `--spacing-input-x` | `1rem` | `1rem` | `1rem` | Input horizontal padding |
| `--spacing-input-y` | `0.75rem` | `0.75rem` | `0.75rem` | Input vertical padding |
| `--spacing-button-x` | `1.5rem` | `1.5rem` | `1.5rem` | Button horizontal padding |
| `--spacing-button-y` | `0.75rem` | `0.75rem` | `0.75rem` | Button vertical padding |

**Tailwind Classes:** `p-modal-padding`, `p-card-padding`, `gap-section-gap`, etc.

---

## Typography Tokens

### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `var(--font-sen), 'Sen', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif` | Sans-serif font stack |
| `--font-serif` | `var(--font-serif), Georgia, serif` | Serif font stack |
| `--font-mono` | `var(--font-mono), monospace` | Monospace font stack |

**Tailwind Classes:** `font-sans`, `font-serif`, `font-mono`

### Font Sizes

| Token | Size | Line Height | Font Weight | Letter Spacing | Usage |
|-------|------|-------------|-------------|----------------|-------|
| `display` | `4rem` | `1.1` | `300` | `-0.02em` | Display text |
| `h1` | `3rem` | `1.2` | `300` | `-0.01em` | Heading 1 |
| `h2` | `2.25rem` | `1.3` | `400` | `-0.01em` | Heading 2 |
| `h3` | `1.875rem` | `1.4` | `400` | - | Heading 3 |
| `h4` | `1.5rem` | `1.5` | `500` | - | Heading 4 |
| `h5` | `1.25rem` | `1.5` | `500` | - | Heading 5 |
| `h6` | `1rem` | `1.5` | `600` | - | Heading 6 |
| `body-lg` | `1.125rem` | `1.6` | - | - | Large body text |
| `body` | `1rem` | `1.6` | - | - | Body text |
| `body-sm` | `0.875rem` | `1.5` | - | - | Small body text |
| `caption` | `0.75rem` | `1.4` | - | - | Caption text |
| `micro` | `0.625rem` | `1.4` | - | - | Micro text |

**Tailwind Classes:** `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-h5`, `text-h6`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-micro`

---

## Breakpoint Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | `475px` | Extra small screens |
| `sm` | `640px` | Small screens (default Tailwind) |
| `md` | `768px` | Medium screens (default Tailwind) |
| `lg` | `1024px` | Large screens (default Tailwind) |
| `xl` | `1280px` | Extra large screens (default Tailwind) |
| `2xl` | `1536px` | 2XL screens (default Tailwind) |

**Tailwind Classes:** `xs:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

---

## Animation Tokens

### Keyframe Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| `fadeIn` | `0.8s` | `ease-out` | Fade in effect |
| `slideUp` | `0.8s` | `ease-out` | Slide up effect |
| `slideInRight` | `0.3s` | `ease-out` | Slide in from right |
| `menuSlideDown` | - | - | Menu dropdown |
| `anchorPulse` | - | - | Anchor pulse effect |
| `orderDetailsExpand` | `0.3s` | `ease-out` | Order details expand |
| `toastSlideDown` | `0.3s` | `ease-out` | Toast slide down |
| `skeleton-shimmer` | `1.5s` | `infinite` | Loading skeleton |

**Tailwind Classes:** `animate-fade-in`, `animate-slide-up`, `animate-slide-in-right`, `animate-order-expand`, `animate-toast-slide-down`, `animate-skeleton-shimmer`

---

## Notes

- All color tokens use the `oklch()` color space for better perceptual uniformity
- Dark mode tokens are defined in a `.dark` class selector (not shown in this list, but follow the same pattern)
- Component-specific tokens (like `--radius-button`) reference base tokens for consistency
- Spacing tokens are responsive and adjust at `sm` (640px) and `lg` (1024px) breakpoints
- All tokens are accessible via CSS custom properties and Tailwind utility classes

---

## Usage Examples

### Using CSS Custom Properties
```css
.my-component {
  background-color: var(--primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-card-padding);
}
```

### Using Tailwind Classes
```tsx
<div className="bg-primary rounded-lg shadow-md p-card-padding">
  Content
</div>
```

### Using Tailwind with Custom Properties
```tsx
<div className="bg-[var(--primary)] rounded-[var(--radius-lg)]">
  Content
</div>
```

---

**Last Updated:** February 4, 2026  
**Project:** Next Foundations
