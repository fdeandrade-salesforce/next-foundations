import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ============================================================================
        // SEMANTIC COLORS - Reference CSS Custom Properties
        // ============================================================================
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',

        // ============================================================================
        // STATUS COLORS
        // ============================================================================
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
          light: 'var(--success-light)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
          light: 'var(--warning-light)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
          light: 'var(--info-light)',
        },
        error: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--error-foreground)',
          light: 'var(--error-light)',
        },

        // ============================================================================
        // BRAND BLUE PALETTE - Reference CSS Custom Properties
        // ============================================================================
        'brand-blue': {
          50: 'var(--brand-blue-50)',
          100: 'var(--brand-blue-100)',
          200: 'var(--brand-blue-200)',
          300: 'var(--brand-blue-300)',
          400: 'var(--brand-blue-400)',
          500: 'var(--brand-blue-500)',
          600: 'var(--brand-blue-600)',
          700: 'var(--brand-blue-700)',
          800: 'var(--brand-blue-800)',
          900: 'var(--brand-blue-900)',
        },

        // ============================================================================
        // BRAND GRAY PALETTE - Reference CSS Custom Properties
        // ============================================================================
        'brand-gray': {
          50: 'var(--brand-gray-50)',
          100: 'var(--brand-gray-100)',
          200: 'var(--brand-gray-200)',
          300: 'var(--brand-gray-300)',
          400: 'var(--brand-gray-400)',
          500: 'var(--brand-gray-500)',
          600: 'var(--brand-gray-600)',
          700: 'var(--brand-gray-700)',
          800: 'var(--brand-gray-800)',
          900: 'var(--brand-gray-900)',
        },

        // ============================================================================
        // BRAND CORE COLORS
        // ============================================================================
        'brand-black': 'var(--brand-black)',
        'brand-white': 'var(--brand-white)',

        // ============================================================================
        // PAYMENT BRAND COLORS
        // ============================================================================
        payment: {
          'paypal-blue': 'var(--payment-paypal-blue)',
          'paypal-yellow': 'var(--payment-paypal-yellow)',
          'paypal-dark': 'var(--payment-paypal-dark)',
          'venmo-blue': 'var(--payment-venmo-blue)',
          'visa-blue': 'var(--payment-visa-blue)',
          'mastercard-red': 'var(--payment-mastercard-red)',
          'mastercard-orange': 'var(--payment-mastercard-orange)',
          'amex-blue': 'var(--payment-amex-blue)',
          'amazon-gray': 'var(--payment-amazon-gray)',
          'applepay-black': 'var(--payment-applepay-black)',
          'googlepay-gray': 'var(--payment-googlepay-gray)',
        },

        // ============================================================================
        // STAR RATING COLORS
        // ============================================================================
        star: {
          filled: 'var(--star-filled)',
          empty: 'var(--star-empty)',
        },

        // ============================================================================
        // PRODUCT BADGE COLORS
        // ============================================================================
        badge: {
          new: 'var(--badge-new)',
          'new-foreground': 'var(--badge-new-foreground)',
          bestseller: 'var(--badge-bestseller)',
          'bestseller-foreground': 'var(--badge-bestseller-foreground)',
          'online-only': 'var(--badge-online-only)',
          'online-only-foreground': 'var(--badge-online-only-foreground)',
          limited: 'var(--badge-limited)',
          'limited-foreground': 'var(--badge-limited-foreground)',
          sale: 'var(--badge-sale)',
          'sale-foreground': 'var(--badge-sale-foreground)',
          'out-of-stock': 'var(--badge-out-of-stock)',
          'out-of-stock-foreground': 'var(--badge-out-of-stock-foreground)',
        },

        // ============================================================================
        // LOYALTY BADGE COLORS
        // ============================================================================
        loyalty: {
          platinum: 'var(--loyalty-platinum)',
          'platinum-light': 'var(--loyalty-platinum-light)',
          gold: 'var(--loyalty-gold)',
          'gold-light': 'var(--loyalty-gold-light)',
          silver: 'var(--loyalty-silver)',
          'silver-light': 'var(--loyalty-silver-light)',
          bronze: 'var(--loyalty-bronze)',
          'bronze-light': 'var(--loyalty-bronze-light)',
        },

        // ============================================================================
        // AGENTIC EXPERIENCE COLORS
        // ============================================================================
        agentic: {
          DEFAULT: 'var(--agentic)',
          foreground: 'var(--agentic-foreground)',
          primary: 'var(--agentic-primary)',
          'primary-foreground': 'var(--agentic-primary-foreground)',
          accent: 'var(--agentic-accent)',
          'accent-foreground': 'var(--agentic-accent-foreground)',
          border: 'var(--agentic-border)',
          ring: 'var(--agentic-ring)',
          muted: 'var(--agentic-muted)',
          'muted-foreground': 'var(--agentic-muted-foreground)',
          input: 'var(--agentic-input)',
        },

        // ============================================================================
        // HEADER COLORS
        // ============================================================================
        header: {
          DEFAULT: 'var(--header)',
          foreground: 'var(--header-foreground)',
          primary: 'var(--header-primary)',
          'primary-foreground': 'var(--header-primary-foreground)',
          accent: 'var(--header-accent)',
          'accent-foreground': 'var(--header-accent-foreground)',
          muted: 'var(--header-muted)',
          'muted-foreground': 'var(--header-muted-foreground)',
          border: 'var(--header-border)',
          ring: 'var(--header-ring)',
        },

        // ============================================================================
        // LEGACY ZARA COLORS - For backward compatibility (deprecated)
        // ============================================================================
        zara: {
          black: 'var(--brand-black)',
          white: 'var(--brand-white)',
          gray: {
            50: 'var(--brand-gray-50)',
            100: 'var(--brand-gray-100)',
            200: 'var(--brand-gray-200)',
            300: 'var(--brand-gray-300)',
            400: 'var(--brand-gray-400)',
            500: 'var(--brand-gray-500)',
            600: 'var(--brand-gray-600)',
            700: 'var(--brand-gray-700)',
            800: 'var(--brand-gray-800)',
            900: 'var(--brand-gray-900)',
          },
          accent: {
            red: 'var(--brand-blue-500)',
            burgundy: 'var(--brand-blue-600)',
          },
        },
      },

      // ============================================================================
      // BORDER RADIUS - Reference CSS Custom Properties
      // ============================================================================
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
        badge: 'var(--radius-badge)',
        input: 'var(--radius-input)',
      },

      // ============================================================================
      // BOX SHADOW - Reference CSS Custom Properties
      // ============================================================================
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        dropdown: 'var(--shadow-dropdown)',
        modal: 'var(--shadow-modal)',
        button: 'var(--shadow-button)',
      },

      // ============================================================================
      // Z-INDEX - Reference CSS Custom Properties
      // ============================================================================
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        fixed: 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
        toast: 'var(--z-toast)',
      },

      // ============================================================================
      // TRANSITION DURATION - Reference CSS Custom Properties
      // ============================================================================
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },

      // ============================================================================
      // TRANSITION TIMING FUNCTION
      // ============================================================================
      transitionTimingFunction: {
        DEFAULT: 'var(--ease-default)',
        in: 'var(--ease-in)',
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },

      // ============================================================================
      // OPACITY
      // ============================================================================
      opacity: {
        backdrop: 'var(--opacity-backdrop)',
        'backdrop-heavy': 'var(--opacity-backdrop-heavy)',
        'backdrop-light': 'var(--opacity-backdrop-light)',
        disabled: 'var(--opacity-disabled)',
        hover: 'var(--opacity-hover)',
        muted: 'var(--opacity-muted)',
      },

      // ============================================================================
      // FONT FAMILY
      // ============================================================================
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // ============================================================================
      // FONT SIZE - Typography Scale
      // ============================================================================
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '300', letterSpacing: '-0.02em' }],
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '300', letterSpacing: '-0.01em' }],
        'h2': ['2.25rem', { lineHeight: '1.3', fontWeight: '400', letterSpacing: '-0.01em' }],
        'h3': ['1.875rem', { lineHeight: '1.4', fontWeight: '400' }],
        'h4': ['1.5rem', { lineHeight: '1.5', fontWeight: '500' }],
        'h5': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],
        'h6': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'micro': ['0.625rem', { lineHeight: '1.4' }],
      },

      // ============================================================================
      // SPACING SCALE - Extended
      // ============================================================================
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
        // Component spacing tokens
        'modal-padding': 'var(--spacing-modal-padding)',
        'card-padding': 'var(--spacing-card-padding)',
        'section-gap': 'var(--spacing-section-gap)',
      },

      // ============================================================================
      // BREAKPOINTS
      // ============================================================================
      screens: {
        'xs': '475px',
      },

      // ============================================================================
      // ANIMATION
      // ============================================================================
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },

      // ============================================================================
      // KEYFRAMES
      // ============================================================================
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
