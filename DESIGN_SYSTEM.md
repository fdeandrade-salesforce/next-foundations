# Zara E-commerce Design System

## Overview
This design system is built for the Zara e-commerce website, emphasizing minimalist, fashion-forward, and innovative design principles.

## Design Tokens

### Colors
- **Primary**: Black (`#000000`) - Zara's signature color
- **White**: (`#FFFFFF`) - Clean backgrounds
- **Gray Scale**: 50-900 shades for hierarchy and subtlety
- **Accent Colors**: 
  - Red (`#C41E3A`) - Discounts and highlights
  - Burgundy (`#8B1538`) - Secondary accent

### Typography
- **Font Weights**: Light (300), Regular (400), Medium (500), Semibold (600)
- **Scale**: Display (4rem), H1-H6, Body variants
- **Letter Spacing**: Tight tracking for headlines, normal for body text

### Spacing
- Extended spacing scale from 4.5rem to 12.5rem
- Consistent 4px base unit system

## Components

### Button
Variants: `primary`, `secondary`, `ghost`, `outline`
Sizes: `sm`, `md`, `lg`

### ProductCard
- Hover effects with image scaling
- Discount badges
- Quick actions (Add to Cart, Quick View)
- Responsive grid layouts

### Navigation
- Sticky header
- Desktop dropdown menus
- Mobile hamburger menu
- Search, Account, and Cart icons

### Hero
- Full-width hero sections
- Overlay text with CTA buttons
- Responsive typography

### ProductGrid
- Configurable columns (2, 3, 4)
- Responsive breakpoints
- Section titles

### Footer
- Multi-column layout
- Social media links
- Newsletter subscription

## Component Constraints

All components follow these principles:
1. **Minimalism**: Clean, uncluttered interfaces
2. **Responsiveness**: Mobile-first approach
3. **Accessibility**: ARIA labels and semantic HTML
4. **Performance**: Optimized animations and transitions
5. **Consistency**: Unified spacing, typography, and colors

## Usage

Components are located in `/components` and can be imported:
```tsx
import Button from '@/components/Button'
import ProductCard from '@/components/ProductCard'
```

## Brand Alignment

The design system reflects Zara's brand values:
- **Fashion**: Modern, trend-forward aesthetics
- **Innovation**: Smooth animations and interactive elements
- **Minimalism**: Clean layouts with ample white space
- **Quality**: Premium feel through typography and spacing

