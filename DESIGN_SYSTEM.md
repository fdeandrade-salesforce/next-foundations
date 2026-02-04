# Salesforce Foundations Design System

## Overview

This design system is built for the Salesforce Foundations e-commerce platform, following the Salesforce Foundations pattern with a three-tier token architecture using CSS Custom Properties as the foundation.

## Token Architecture

The design system uses a **three-tier token system**:

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: CSS Custom Properties (globals.css)            │
│  └─ :root { --color-brand-blue-500: oklch(...) }       │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Tailwind Theme Extensions (tailwind.config.ts) │
│  └─ colors: { 'brand-blue-500': 'var(--brand-blue-500)' │
├─────────────────────────────────────────────────────────┤
│  Tier 3: Semantic/Component Classes (globals.css)       │
│  └─ .btn-primary { @apply bg-brand-blue-500 ... }      │
└─────────────────────────────────────────────────────────┘
```

## Design Tokens

### Core Semantic Colors

All colors use the Oklch color format for perceptual uniformity.

| Token | Description | Usage |
|-------|-------------|-------|
| `--background` | Page background | Main content areas |
| `--foreground` | Primary text color | Body text, headings |
| `--primary` | Primary brand color | CTAs, links, focus states |
| `--secondary` | Secondary surfaces | Card backgrounds |
| `--muted` | Muted surfaces | Subtle backgrounds |
| `--accent` | Accent color | Highlights |
| `--destructive` | Error/danger | Delete actions, errors |
| `--border` | Border color | Dividers, inputs |
| `--ring` | Focus ring | Focus indicators |

### Status Colors

| Token | Usage |
|-------|-------|
| `--success` / `--success-light` | Success states, confirmations |
| `--warning` / `--warning-light` | Warnings, cautions |
| `--error` / `--error-light` | Errors, destructive actions |
| `--info` / `--info-light` | Informational messages |

### Brand Palette

**Brand Blue (Primary)**
- `--brand-blue-50` through `--brand-blue-900`

**Brand Gray**
- `--brand-gray-50` through `--brand-gray-900`

**Core**
- `--brand-black`: Primary dark color
- `--brand-white`: Primary light color

### Payment Brand Colors

| Token | Brand |
|-------|-------|
| `--payment-paypal-blue` | PayPal |
| `--payment-paypal-yellow` | PayPal |
| `--payment-venmo-blue` | Venmo |
| `--payment-visa-blue` | Visa |
| `--payment-mastercard-red` | Mastercard |
| `--payment-amex-blue` | American Express |
| `--payment-amazon-gray` | Amazon Pay |
| `--payment-applepay-black` | Apple Pay |
| `--payment-googlepay-gray` | Google Pay |

### Product Badge Colors

| Token | Usage |
|-------|-------|
| `--badge-new` | New product badge |
| `--badge-bestseller` | Best seller badge |
| `--badge-online-only` | Online only badge |
| `--badge-limited` | Limited edition badge |
| `--badge-sale` | Sale/promotion badge |
| `--badge-out-of-stock` | Out of stock badge |

### Loyalty Badge Colors

| Token | Tier |
|-------|------|
| `--loyalty-platinum` / `--loyalty-platinum-light` | Platinum tier |
| `--loyalty-gold` / `--loyalty-gold-light` | Gold tier |
| `--loyalty-silver` / `--loyalty-silver-light` | Silver tier |
| `--loyalty-bronze` / `--loyalty-bronze-light` | Bronze tier |

### Star Rating Colors

| Token | Usage |
|-------|-------|
| `--star-filled` | Filled star (rated) |
| `--star-empty` | Empty star (unrated) |

### Typography Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-display` | 4rem | 1.1 | Hero headlines |
| `text-h1` | 3rem | 1.2 | Page titles |
| `text-h2` | 2.25rem | 1.3 | Section titles |
| `text-h3` | 1.875rem | 1.4 | Subsection titles |
| `text-h4` | 1.5rem | 1.5 | Card titles |
| `text-h5` | 1.25rem | 1.5 | Small headings |
| `text-h6` | 1rem | 1.5 | Micro headings |
| `text-body-lg` | 1.125rem | 1.6 | Large body text |
| `text-body` | 1rem | 1.6 | Default body text |
| `text-body-sm` | 0.875rem | 1.5 | Small text |
| `text-caption` | 0.75rem | 1.4 | Captions, metadata |
| `text-micro` | 0.625rem | 1.4 | Tiny text (10px) |

### Spacing Tokens

**Component Spacing (responsive)**
| Token | Base | sm | lg |
|-------|------|-----|-----|
| `--spacing-modal-padding` | 1rem | 1.5rem | 2rem |
| `--spacing-section-gap` | 2rem | 3rem | 4rem |
| `--spacing-card-padding` | 1rem | - | - |

**Extended Scale**
- `spacing-18` through `spacing-50` (4.5rem to 12.5rem)

### Shadow Tokens

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Subtle elevation |
| `--shadow-sm` | Cards, buttons |
| `--shadow-md` | Default elevation |
| `--shadow-lg` | Dropdowns |
| `--shadow-xl` | Modals |
| `--shadow-2xl` | Large overlays |
| `--shadow-card` | Product cards (alias) |
| `--shadow-card-hover` | Card hover state |
| `--shadow-dropdown` | Dropdown menus |
| `--shadow-modal` | Modal dialogs |
| `--shadow-button` | Buttons |

### Border Radius Tokens

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Inputs, badges |
| `--radius-lg` | 0.5rem (8px) | Buttons, cards |
| `--radius-xl` | 0.75rem (12px) | Larger cards |
| `--radius-2xl` | 1rem (16px) | Modals |
| `--radius-3xl` | 1.5rem (24px) | Large containers |
| `--radius-full` | 9999px | Pills, avatars |
| `--radius-button` | var(--radius-lg) | Buttons |
| `--radius-card` | var(--radius-xl) | Cards |
| `--radius-modal` | var(--radius-2xl) | Modals |
| `--radius-badge` | var(--radius-md) | Badges |
| `--radius-input` | var(--radius-lg) | Form inputs |

### Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 50 | Dropdown menus |
| `--z-sticky` | 100 | Sticky elements |
| `--z-fixed` | 200 | Fixed elements |
| `--z-modal-backdrop` | 400 | Modal overlays |
| `--z-modal` | 500 | Modal dialogs |
| `--z-popover` | 600 | Popovers |
| `--z-tooltip` | 700 | Tooltips |
| `--z-toast` | 800 | Toast notifications |

### Opacity Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--opacity-backdrop` | 0.5 | Standard backdrops |
| `--opacity-backdrop-heavy` | 0.7 | Heavy overlays |
| `--opacity-backdrop-light` | 0.4 | Light overlays |
| `--opacity-disabled` | 0.5 | Disabled states |
| `--opacity-hover` | 0.8 | Hover states |
| `--opacity-muted` | 0.6 | Muted elements |

### Transition Tokens

**Duration**
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Quick feedback |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-slow` | 300ms | Complex animations |
| `--duration-slower` | 500ms | Long animations |

**Easing**
| Token | Usage |
|-------|-------|
| `--ease-default` | Standard easing |
| `--ease-in` | Entering animations |
| `--ease-out` | Exiting animations |
| `--ease-in-out` | Symmetric animations |

## Component Classes

### Buttons

```css
.btn              /* Base button styles */
.btn-primary      /* Primary CTA */
.btn-secondary    /* Secondary action */
.btn-ghost        /* Subtle action */
.btn-outline      /* Outlined button */
```

### Product Cards

```css
.product-card     /* Card container with hover effects */
.product-image    /* Image wrapper with aspect ratio */
```

### Status Badges

```css
.badge-success    /* Success/delivered states */
.badge-warning    /* Warning/partial states */
.badge-error      /* Error/cancelled states */
.badge-info       /* Info/processing states */
.badge-neutral    /* Default/neutral states */
```

### Product Badges

```css
.badge-new        /* New product */
.badge-bestseller /* Best seller */
.badge-online-only /* Online exclusive */
.badge-limited    /* Limited edition */
.badge-sale       /* On sale */
.badge-out-of-stock /* Out of stock */
```

### Loyalty Badges

```css
.badge-loyalty-platinum
.badge-loyalty-gold
.badge-loyalty-silver
.badge-loyalty-bronze
```

### Modal Components

```css
.modal-backdrop   /* Modal overlay */
.modal-content    /* Modal container */
```

### Form Components

```css
.input-base       /* Base input styles */
.dropdown-menu    /* Dropdown container */
```

### Backdrop Utilities

```css
.backdrop-light   /* Light overlay (40%) */
.backdrop-default /* Standard overlay (50%) */
.backdrop-heavy   /* Heavy overlay (70%) */
```

## Usage

### Using Tailwind Classes

```tsx
// Semantic colors
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="text-muted-foreground" />

// Status colors
<span className="text-success" />
<div className="bg-error-light text-error" />

// Brand colors
<button className="bg-brand-blue-500 hover:bg-brand-blue-600" />

// Payment colors
<button className="bg-payment-paypal-yellow" />

// Star ratings
<svg className="text-star-filled" />
<svg className="text-star-empty" />

// Shadows
<div className="shadow-card hover:shadow-card-hover" />
<div className="shadow-modal" />

// Border radius
<div className="rounded-card" />
<button className="rounded-button" />
<span className="rounded-badge" />
```

### Using Component Classes

```tsx
// Buttons
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>

// Badges
<span className="badge-success">Delivered</span>
<span className="badge-new">New</span>

// Product cards
<div className="product-card">
  <div className="product-image">...</div>
</div>

// Modals
<div className="modal-backdrop" />
<div className="modal-content">...</div>
```

## File Structure

- `app/globals.css` - CSS Custom Properties and component classes
- `tailwind.config.ts` - Tailwind theme extensions referencing CSS variables
- `components/` - React components using the design system

## Brand Alignment

The design system reflects Salesforce Foundations brand values:
- **Modern**: Clean, contemporary aesthetics
- **Professional**: Business-appropriate styling
- **Accessible**: WCAG-compliant color contrasts
- **Consistent**: Unified token system across all components
- **Scalable**: Three-tier architecture for easy maintenance
