/**
 * Mock Review Data
 * 
 * This file contains all review data used in the application.
 * Reviews are contextual to each product with realistic content.
 * In production, this would be fetched from Supabase.
 */

import { Review, ReviewSummary } from '../../types'

// ============================================================================
// MOCK REVIEWS - Contextual reviews for each product
// ============================================================================

export const mockReviews: Review[] = [
  // ============================================================================
  // PURE CUBE - Popular product with many reviews
  // ============================================================================
  {
    id: 'pc-1',
    productId: 'pure-cube-white',
    author: 'James R.',
    rating: 5,
    date: 'January 2025',
    location: 'San Francisco, CA',
    title: 'Perfect minimalist accent',
    content: 'The Pure Cube is exactly what I was looking for. The white finish is crisp and clean, and the proportions are spot-on. It sits beautifully on my console table and catches the light perfectly throughout the day.',
    verified: true,
    helpful: 34,
    images: [
      'https://placehold.co/400x400/f5f5f5/333333?text=Review+Photo+1',
      'https://placehold.co/400x400/f5f5f5/333333?text=Review+Photo+2',
    ],
  },
  {
    id: 'pc-2',
    productId: 'pure-cube-white',
    author: 'Maria S.',
    rating: 5,
    date: 'December 2024',
    location: 'New York, NY',
    title: 'Museum quality at home',
    content: 'I bought this for my home office and it elevates the entire space. The craftsmanship is impeccable - you can tell this is precision-made. The matte white finish doesn\'t show fingerprints which is a huge plus.',
    verified: true,
    helpful: 28,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Home+Office+Setup',
    ],
  },
  {
    id: 'pc-3',
    productId: 'pure-cube-white',
    author: 'Thomas K.',
    rating: 4,
    date: 'November 2024',
    location: 'Chicago, IL',
    title: 'Beautiful but smaller than expected',
    content: 'Gorgeous piece with excellent build quality. My only note is that I wish I had ordered the Large size - the Medium is a bit smaller than it appeared in photos. That said, the quality is outstanding.',
    verified: true,
    helpful: 19,
  },
  {
    id: 'pc-4',
    productId: 'pure-cube-white',
    author: 'Emily W.',
    rating: 5,
    date: 'October 2024',
    location: 'Portland, OR',
    title: 'Bought 3 for my shelving unit',
    content: 'These cubes arranged on my floating shelves create such a sophisticated look. The white color matches my Scandinavian decor perfectly. Already planning to buy more!',
    verified: true,
    helpful: 41,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Shelf+Display+1',
      'https://placehold.co/400x400/fafafa/333333?text=Shelf+Display+2',
      'https://placehold.co/400x400/fafafa/333333?text=Shelf+Display+3',
    ],
  },
  {
    id: 'pc-7',
    productId: 'pure-cube-white',
    author: 'Alexandra P.',
    rating: 5,
    date: 'February 2025',
    location: 'Boston, MA',
    title: 'A comprehensive review after 6 months of ownership',
    content: 'I\'ve been meaning to write this review for a while now, and after living with my Pure Cube White for six months, I feel I can give a truly comprehensive assessment. First, let me talk about the packaging - it arrived double-boxed with foam inserts that kept it perfectly protected during transit. The unboxing experience itself felt premium. Upon first holding the cube, I was immediately struck by its weight and density. This is not a hollow decorative piece; it has real substance and presence. The matte white finish is absolutely pristine, with no visible seams or imperfections whatsoever. I\'ve placed mine on a walnut console table in my entryway, and it catches the natural light beautifully throughout the day. In the morning sun, it has an almost warm glow, while in the evening it takes on cooler tones. Maintenance has been minimal - I simply dust it weekly with a microfiber cloth. I was initially worried about the white showing fingerprints, but the matte finish does an excellent job of hiding them. My interior designer actually asked where I got it because she wants to recommend it to her other clients. Overall, this is the kind of piece that elevates an entire room. Worth every penny and then some.',
    verified: true,
    helpful: 67,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=6+Month+Review',
    ],
  },
  {
    id: 'pc-5',
    productId: 'pure-cube-black',
    author: 'David L.',
    rating: 5,
    date: 'January 2025',
    location: 'Los Angeles, CA',
    title: 'Sleek and sophisticated',
    content: 'The black version is absolutely stunning. It has a subtle depth to the finish that photographs don\'t quite capture. Worth every penny.',
    verified: true,
    helpful: 22,
    images: [
      'https://placehold.co/400x400/2a2a2a/ffffff?text=Black+Cube+Photo',
    ],
  },
  {
    id: 'pc-6',
    productId: 'pure-cube-gray',
    author: 'Rachel M.',
    rating: 4,
    date: 'December 2024',
    location: 'Seattle, WA',
    title: 'Great neutral option',
    content: 'The gray is the perfect middle ground - not too stark like white, not as dramatic as black. Fits seamlessly into my living room.',
    verified: true,
    helpful: 15,
    images: [
      'https://placehold.co/400x400/888888/ffffff?text=Living+Room',
    ],
  },

  // ============================================================================
  // SOLID CYLINDER - Bestseller with solid reviews
  // ============================================================================
  {
    id: 'sc-1',
    productId: 'solid-cylinder',
    author: 'Nathan B.',
    rating: 5,
    date: 'January 2025',
    location: 'Austin, TX',
    title: 'Timeless design',
    content: 'The Solid Cylinder has a weight and presence that makes it feel substantial. It\'s become the anchor piece on my coffee table. The proportions are perfect.',
    verified: true,
    helpful: 27,
    images: [
      'https://placehold.co/400x400/d4d4d4/333333?text=Coffee+Table+View',
    ],
  },
  {
    id: 'sc-2',
    productId: 'solid-cylinder',
    author: 'Sophie T.',
    rating: 4,
    date: 'November 2024',
    location: 'Denver, CO',
    title: 'Versatile piece',
    content: 'I use this as a bookend and it works beautifully. Heavy enough to hold books in place while looking elegant. Would love to see more color options.',
    verified: true,
    helpful: 18,
  },
  {
    id: 'sc-3',
    productId: 'solid-cylinder',
    author: 'Marcus J.',
    rating: 5,
    date: 'October 2024',
    location: 'Miami, FL',
    title: 'Better than expected',
    content: 'Arrived perfectly packaged. The cylinder has a smooth, tactile finish that\'s addictive to touch. My guests always comment on it.',
    verified: true,
    helpful: 12,
    images: [
      'https://placehold.co/400x400/e0e0e0/333333?text=Unboxing',
      'https://placehold.co/400x400/e0e0e0/333333?text=Detail+Shot',
    ],
  },

  // ============================================================================
  // SOFT SPHERE - Good reviews with some variance
  // ============================================================================
  {
    id: 'ss-1',
    productId: 'soft-sphere',
    author: 'Lauren H.',
    rating: 5,
    date: 'December 2024',
    location: 'Boston, MA',
    title: 'Organic elegance',
    content: 'The Soft Sphere has this calming presence. The curved form is so pleasing to look at. It\'s become my favorite piece in my meditation corner.',
    verified: true,
    helpful: 31,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Meditation+Corner',
    ],
  },
  {
    id: 'ss-2',
    productId: 'soft-sphere',
    author: 'Chris P.',
    rating: 3,
    date: 'November 2024',
    location: 'Philadelphia, PA',
    title: 'Nice but not perfect',
    content: 'The sphere is beautiful but I noticed a small imperfection in the finish near the base. Customer service was helpful but I expected perfection at this price point.',
    verified: true,
    helpful: 8,
  },
  {
    id: 'ss-3',
    productId: 'soft-sphere',
    author: 'Amanda G.',
    rating: 5,
    date: 'October 2024',
    location: 'Nashville, TN',
    title: 'Absolutely love it',
    content: 'Perfect addition to my entryway console. The gray tone works with everything and the shape adds softness to an otherwise angular space.',
    verified: true,
    helpful: 24,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Entryway+Console',
      'https://placehold.co/400x400/e8e8e8/333333?text=Close+Up',
    ],
  },

  // ============================================================================
  // FINE CONE - Fewer reviews, newer product feel
  // ============================================================================
  {
    id: 'fc-1',
    productId: 'fine-cone',
    author: 'Diana K.',
    rating: 5,
    date: 'January 2025',
    location: 'San Diego, CA',
    title: 'Striking geometry',
    content: 'The Fine Cone makes such a statement. The precision of the point is remarkable - it looks like it could have been carved by a master sculptor.',
    verified: true,
    helpful: 14,
    images: [
      'https://placehold.co/400x400/f8f8f8/333333?text=Cone+Detail',
    ],
  },
  {
    id: 'fc-2',
    productId: 'fine-cone',
    author: 'Peter M.',
    rating: 4,
    date: 'December 2024',
    location: 'Dallas, TX',
    title: 'Great conversation starter',
    content: 'Everyone who visits asks about this piece. It has an almost architectural quality. Docking one star only because I wish it came in larger sizes.',
    verified: true,
    helpful: 9,
  },

  // ============================================================================
  // STEADY PRISM - New product, fewer but enthusiastic reviews
  // ============================================================================
  {
    id: 'sp-1',
    productId: 'steady-prism',
    author: 'Victoria N.',
    rating: 5,
    date: 'January 2025',
    location: 'Brooklyn, NY',
    title: 'Light plays beautifully on it',
    content: 'The Steady Prism catches and reflects light in the most beautiful way. In the morning sun, it creates subtle patterns on my wall. Absolutely magical.',
    verified: true,
    helpful: 38,
    images: [
      'https://placehold.co/400x400/fff8dc/333333?text=Morning+Light',
      'https://placehold.co/400x400/fff8dc/333333?text=Wall+Pattern',
    ],
  },
  {
    id: 'sp-2',
    productId: 'steady-prism',
    author: 'Jonathan R.',
    rating: 5,
    date: 'December 2024',
    location: 'Minneapolis, MN',
    title: 'Architectural beauty',
    content: 'As an architect, I appreciate precision and this delivers. The angles are crisp, the finish is flawless. It sits on my drafting desk as daily inspiration.',
    verified: true,
    helpful: 26,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Desk+Setup',
    ],
  },
  {
    id: 'sp-3',
    productId: 'steady-prism',
    author: 'Kelly T.',
    rating: 4,
    date: 'November 2024',
    location: 'Phoenix, AZ',
    title: 'Unique piece',
    content: 'Love the geometric form. It\'s stable on any surface and the proportions are perfect. Would recommend for anyone who appreciates clean design.',
    verified: true,
    helpful: 15,
  },

  // ============================================================================
  // DUAL FORMS - Limited edition, exclusive feel
  // ============================================================================
  {
    id: 'df-1',
    productId: 'dual-forms',
    author: 'Alexander B.',
    rating: 5,
    date: 'December 2024',
    location: 'Washington, DC',
    title: 'Worth the splurge',
    content: 'The Dual Forms are like yin and yang for my bookshelf. They complement each other perfectly while each standing beautifully on its own. Museum-quality pieces.',
    verified: true,
    helpful: 29,
    images: [
      'https://placehold.co/400x400/f5f5f5/333333?text=Bookshelf+Display',
      'https://placehold.co/400x400/f5f5f5/333333?text=Both+Forms',
    ],
  },
  {
    id: 'df-2',
    productId: 'dual-forms',
    author: 'Stephanie L.',
    rating: 5,
    date: 'November 2024',
    location: 'Atlanta, GA',
    title: 'Elegant pairing',
    content: 'I placed these on either side of my fireplace mantle and they create such beautiful symmetry. The quality is exceptional.',
    verified: true,
    helpful: 17,
    images: [
      'https://placehold.co/400x400/e8e0d8/333333?text=Fireplace+Mantle',
    ],
  },

  // ============================================================================
  // VERTICAL SET - Bestseller with many positive reviews
  // ============================================================================
  {
    id: 'vs-1',
    productId: 'vertical-set',
    author: 'Michelle B.',
    rating: 5,
    date: 'January 2025',
    location: 'Scottsdale, AZ',
    title: 'Best purchase this year',
    content: 'The Vertical Set exceeded all my expectations. The pieces stack perfectly and the quality is museum-grade. I rearrange them weekly for a fresh look.',
    verified: true,
    helpful: 52,
    images: [
      'https://placehold.co/400x400/f8f8f8/333333?text=Stacked+Arrangement',
      'https://placehold.co/400x400/f8f8f8/333333?text=Different+Config',
      'https://placehold.co/400x400/f8f8f8/333333?text=Close+Up',
    ],
  },
  {
    id: 'vs-2',
    productId: 'vertical-set',
    author: 'Brian K.',
    rating: 5,
    date: 'December 2024',
    location: 'San Jose, CA',
    title: 'Versatile and beautiful',
    content: 'These work together or separately. Currently have them cascading down my floating shelves. The quality of each piece is consistent and impressive.',
    verified: true,
    helpful: 38,
    images: [
      'https://placehold.co/400x400/ececec/333333?text=Floating+Shelves',
    ],
  },
  {
    id: 'vs-3',
    productId: 'vertical-set',
    author: 'Nina S.',
    rating: 4,
    date: 'November 2024',
    location: 'Raleigh, NC',
    title: 'Great value for the set',
    content: 'Buying the set is definitely the way to go. Each piece complements the others. Minor note: wish the packaging was more sustainable.',
    verified: true,
    helpful: 21,
  },
  {
    id: 'vs-4',
    productId: 'vertical-set',
    author: 'Daniel F.',
    rating: 5,
    date: 'October 2024',
    location: 'Columbus, OH',
    title: 'Interior designer approved',
    content: 'As an interior designer, I use these in client projects all the time. They photograph beautifully and work in virtually any modern space.',
    verified: true,
    helpful: 44,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Client+Project+1',
      'https://placehold.co/400x400/fafafa/333333?text=Client+Project+2',
    ],
  },
  {
    id: 'vs-5',
    productId: 'vertical-set',
    author: 'Margaret H.',
    rating: 5,
    date: 'January 2025',
    location: 'San Diego, CA',
    title: 'Transformed my living room completely - detailed review',
    content: 'I want to share my experience with the Vertical Set because I think potential buyers deserve a thorough review. I purchased this set after months of deliberation, and I can confidently say it was one of the best home decor decisions I\'ve ever made. The set arrived impeccably packaged, with each piece individually wrapped in soft cloth and nested in custom foam. When I first arranged the pieces on my credenza, I was blown away by how they transformed the entire feel of my living room. The craftsmanship is exceptional - you can tell these are precision-manufactured with extreme attention to detail. What I love most is the versatility. I\'ve experimented with at least a dozen different arrangements, and each one creates a completely different aesthetic. Sometimes I stack them vertically for a dramatic tower effect. Other times I spread them horizontally for a more relaxed, gallery-like display. My partner was initially skeptical about spending this much on decorative objects, but even he admits they\'ve become the focal point of our space. We\'ve received countless compliments from guests, with many asking where we purchased them. The white finish has held up beautifully over the past few months with minimal cleaning required. If you\'re on the fence, I say go for it. This is the kind of purchase that brings daily joy.',
    verified: true,
    helpful: 58,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Living+Room+Transform',
      'https://placehold.co/400x400/fafafa/333333?text=Arrangement+1',
      'https://placehold.co/400x400/fafafa/333333?text=Arrangement+2',
    ],
  },

  // ============================================================================
  // SPIRAL ACCENT - New and artistic
  // ============================================================================
  {
    id: 'sa-1',
    productId: 'spiral-accent',
    author: 'Olivia P.',
    rating: 5,
    date: 'January 2025',
    location: 'Salt Lake City, UT',
    title: 'Sculptural masterpiece',
    content: 'The Spiral Accent is more sculpture than decor. It has an organic flow that softens my otherwise geometric living room. Absolutely stunning.',
    verified: true,
    helpful: 23,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Living+Room+Spiral',
    ],
  },
  {
    id: 'sa-2',
    productId: 'spiral-accent',
    author: 'Michael H.',
    rating: 5,
    date: 'December 2024',
    location: 'Portland, ME',
    title: 'Art piece quality',
    content: 'This could easily be in a gallery. The spiral form is hypnotic and the craftsmanship is flawless. Worth every penny.',
    verified: true,
    helpful: 18,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Detail+1',
      'https://placehold.co/400x400/e8e8e8/333333?text=Detail+2',
    ],
  },

  // ============================================================================
  // FLOW FORM I - Bestseller, artistic product
  // ============================================================================
  {
    id: 'ff1-1',
    productId: 'flow-form-i',
    author: 'Catherine R.',
    rating: 5,
    date: 'January 2025',
    location: 'Santa Monica, CA',
    title: 'Breathtaking organic form',
    content: 'Flow Form I has this incredible sense of movement frozen in time. It looks different from every angle. My favorite piece in my collection.',
    verified: true,
    helpful: 41,
    images: [
      'https://placehold.co/400x400/f5f5f5/333333?text=Angle+1',
      'https://placehold.co/400x400/f5f5f5/333333?text=Angle+2',
      'https://placehold.co/400x400/f5f5f5/333333?text=Angle+3',
    ],
  },
  {
    id: 'ff1-2',
    productId: 'flow-form-i',
    author: 'Andrew T.',
    rating: 5,
    date: 'December 2024',
    location: 'Austin, TX',
    title: 'Worth the investment',
    content: 'This is a statement piece that elevates any room. The curves are so smooth and the finish is impeccable. Highly recommend.',
    verified: true,
    helpful: 33,
    images: [
      'https://placehold.co/400x400/ececec/333333?text=Room+Setting',
    ],
  },
  {
    id: 'ff1-3',
    productId: 'flow-form-i',
    author: 'Rebecca W.',
    rating: 4,
    date: 'November 2024',
    location: 'Charlotte, NC',
    title: 'Beautiful but needs care',
    content: 'Gorgeous piece but the curves collect dust easily. Small price to pay for something this beautiful. Get the Large size if you can!',
    verified: true,
    helpful: 19,
  },

  // ============================================================================
  // FUSION BLOCK - Bestseller, modular system
  // ============================================================================
  {
    id: 'fb-1',
    productId: 'fusion-block',
    author: 'Robert H.',
    rating: 5,
    date: 'January 2025',
    location: 'Detroit, MI',
    title: 'Endlessly configurable',
    content: 'The Fusion Block system is genius. I\'ve rearranged it dozens of times and it always looks intentional. The modular approach is perfect for my evolving taste.',
    verified: true,
    helpful: 36,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Config+1',
      'https://placehold.co/400x400/f0f0f0/333333?text=Config+2',
      'https://placehold.co/400x400/f0f0f0/333333?text=Config+3',
    ],
  },
  {
    id: 'fb-2',
    productId: 'fusion-block',
    author: 'Jessica M.',
    rating: 5,
    date: 'December 2024',
    location: 'Tampa, FL',
    title: 'Best modular design',
    content: 'I\'ve tried other modular decor but nothing compares to the quality and design of Fusion Block. Each piece fits together perfectly.',
    verified: true,
    helpful: 28,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Modular+Setup',
    ],
  },
  {
    id: 'fb-3',
    productId: 'fusion-block',
    author: 'William C.',
    rating: 4,
    date: 'November 2024',
    location: 'Indianapolis, IN',
    title: 'Great system, want more pieces',
    content: 'Love the concept and execution. Would buy expansion packs in a heartbeat if they were available. Hint hint, Salesforce Foundations!',
    verified: true,
    helpful: 22,
  },

  // ============================================================================
  // SIGNATURE FORM - Premium product, glowing reviews
  // ============================================================================
  {
    id: 'sf-1',
    productId: 'signature-form-white',
    author: 'Jennifer S.',
    rating: 5,
    date: 'January 2025',
    location: 'Beverly Hills, CA',
    title: 'The crown jewel of my home',
    content: 'The Signature Form is absolutely worth the premium price. It\'s the centerpiece of my living room and the quality is beyond reproach. Museum-quality craftsmanship.',
    verified: true,
    helpful: 56,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Living+Room+Center',
      'https://placehold.co/400x400/fafafa/333333?text=Detail+Shot',
    ],
  },
  {
    id: 'sf-2',
    productId: 'signature-form-white',
    author: 'Christopher L.',
    rating: 5,
    date: 'December 2024',
    location: 'Manhattan, NY',
    title: 'Investment piece',
    content: 'This is the kind of piece you build a room around. The white finish is pristine and the form is timeless. Will be in my family for generations.',
    verified: true,
    helpful: 42,
    images: [
      'https://placehold.co/400x400/f5f5f5/333333?text=Room+View',
    ],
  },
  {
    id: 'sf-3',
    productId: 'signature-form-silver',
    author: 'Angela M.',
    rating: 5,
    date: 'January 2025',
    location: 'Malibu, CA',
    title: 'Stunning silver finish',
    content: 'The silver version has this subtle shimmer that catches light beautifully. It\'s modern yet timeless. Absolutely love it.',
    verified: true,
    helpful: 31,
    images: [
      'https://placehold.co/400x400/c0c0c0/333333?text=Silver+Shimmer',
      'https://placehold.co/400x400/c0c0c0/333333?text=Light+Reflection',
    ],
  },
  {
    id: 'sf-4',
    productId: 'signature-form-black',
    author: 'Gregory P.',
    rating: 5,
    date: 'December 2024',
    location: 'Chicago, IL',
    title: 'Dramatic and elegant',
    content: 'The black Signature Form makes such a bold statement. It anchors my all-white living room perfectly. The contrast is chef\'s kiss.',
    verified: true,
    helpful: 27,
    images: [
      'https://placehold.co/400x400/1a1a1a/ffffff?text=Contrast+View',
    ],
  },
  {
    id: 'sf-5',
    productId: 'signature-form-white',
    author: 'Richard M.',
    rating: 5,
    date: 'January 2025',
    location: 'Miami Beach, FL',
    title: 'An investment piece that defines my space - full review',
    content: 'After researching premium home decor for nearly a year, I finally pulled the trigger on the Signature Form in white, and I need to share why this was absolutely the right choice. Let me start with my background: I\'m a collector of contemporary art and design pieces, and I\'ve purchased items from galleries around the world. The Signature Form stands shoulder to shoulder with pieces costing three times as much. The form itself is mesmerizing - it has these subtle curves that create different silhouettes depending on your viewing angle and the time of day. In my oceanfront condo, the morning light creates the most beautiful shadows on the wall behind it. By evening, with my accent lighting, it takes on an almost sculptural quality that draws the eye immediately upon entering the room. The craftsmanship deserves special mention. I examined every inch with my photographer\'s loupe and found zero imperfections. The finish is uniform, the edges are crisp where they should be and softly radiused where appropriate. This is the work of true artisans. I positioned mine on a custom pedestal in my living room, and it has essentially become the anchor point for all my other design decisions. Friends and colleagues who visit invariably gravitate toward it and want to know where I acquired such a piece. Several have already ordered their own after seeing mine in person. Is it an investment? Absolutely. Is it worth every penny? Without question.',
    verified: true,
    helpful: 73,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Oceanfront+Display',
      'https://placehold.co/400x400/fafafa/333333?text=Morning+Light',
      'https://placehold.co/400x400/fafafa/333333?text=Evening+Lighting',
    ],
  },

  // ============================================================================
  // CORE ASSEMBLY - Limited edition, enthusiast reviews
  // ============================================================================
  {
    id: 'ca-1',
    productId: 'core-assembly',
    author: 'Timothy R.',
    rating: 5,
    date: 'January 2025',
    location: 'San Francisco, CA',
    title: 'Engineering meets art',
    content: 'The Core Assembly is an engineering marvel. The way the pieces interlock is satisfying on a deep level. It\'s as much fun to build as it is to display.',
    verified: true,
    helpful: 24,
    images: [
      'https://placehold.co/400x400/e0e0e0/333333?text=Assembly+Process',
      'https://placehold.co/400x400/e0e0e0/333333?text=Final+Display',
    ],
  },
  {
    id: 'ca-2',
    productId: 'core-assembly',
    author: 'Samantha K.',
    rating: 5,
    date: 'December 2024',
    location: 'Seattle, WA',
    title: 'Worth the wait',
    content: 'Had to wait for this to come back in stock but it was worth every day. The complexity and quality are unmatched. A true collector\'s piece.',
    verified: true,
    helpful: 18,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Collection+Display',
    ],
  },

  // ============================================================================
  // TWIN TOWERS - Set product, positive reviews
  // ============================================================================
  {
    id: 'tt-1',
    productId: 'twin-towers-large',
    author: 'Patricia N.',
    rating: 5,
    date: 'January 2025',
    location: 'Houston, TX',
    title: 'Dramatic vertical presence',
    content: 'The Large Twin Towers flank my fireplace and create such drama. The height really draws the eye up. Beautiful craftsmanship.',
    verified: true,
    helpful: 31,
    images: [
      'https://placehold.co/400x400/f5f5f5/333333?text=Fireplace+View',
      'https://placehold.co/400x400/f5f5f5/333333?text=Height+Detail',
    ],
  },
  {
    id: 'tt-2',
    productId: 'twin-towers-small',
    author: 'Edward J.',
    rating: 4,
    date: 'December 2024',
    location: 'Pittsburgh, PA',
    title: 'Perfect desk companions',
    content: 'The Small size works great on my desk. They add sophistication without taking up too much space. Wish shipping was faster.',
    verified: true,
    helpful: 14,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Desk+Setup',
    ],
  },

  // ============================================================================
  // PRODUCTS WITH NO REVIEWS (realistic scenario)
  // ============================================================================
  // offset-pair, tilted-column, floating-disk-charcoal, micro-spiral, 
  // contrast-plane, shadow-edge, polished-fold, layer-one, layer-two - NO REVIEWS

  // ============================================================================
  // PRODUCTS WITH 1-2 REVIEWS
  // ============================================================================
  {
    id: 'fd-1',
    productId: 'floating-disk-white',
    author: 'Linda C.',
    rating: 4,
    date: 'December 2024',
    location: 'Sacramento, CA',
    title: 'Simple and elegant',
    content: 'The Floating Disk is understated but beautiful. It adds a subtle touch of design without overwhelming the space. Great quality.',
    verified: true,
    helpful: 8,
    images: [
      'https://placehold.co/400x400/fafafa/333333?text=Disk+Display',
    ],
  },
  {
    id: 'us-1',
    productId: 'unity-sphere',
    author: 'Mark W.',
    rating: 5,
    date: 'January 2025',
    location: 'Las Vegas, NV',
    title: 'Perfect sphere',
    content: 'The Unity Sphere is mesmerizing. The golden undertones in the finish give it warmth. Sits perfectly on my sideboard.',
    verified: true,
    helpful: 16,
    images: [
      'https://placehold.co/400x400/f5e6c8/333333?text=Golden+Tones',
      'https://placehold.co/400x400/f5e6c8/333333?text=Sideboard+View',
    ],
  },
  {
    id: 'us-2',
    productId: 'unity-sphere',
    author: 'Carol T.',
    rating: 4,
    date: 'December 2024',
    location: 'Milwaukee, WI',
    title: 'Beautiful addition',
    content: 'Bought this as a gift for my daughter\'s new apartment. She loves it! The size options are great.',
    verified: true,
    helpful: 11,
  },
  {
    id: 'bm-1',
    productId: 'base-module',
    author: 'Frank D.',
    rating: 5,
    date: 'December 2024',
    location: 'Kansas City, MO',
    title: 'Great foundation piece',
    content: 'Started my modular collection with the Base Module and it\'s perfect. Solid construction and works with all the other pieces.',
    verified: true,
    helpful: 14,
    images: [
      'https://placehold.co/400x400/e0e0e0/333333?text=Modular+Start',
    ],
  },
  {
    id: 'cl-1',
    productId: 'compact-layer',
    author: 'Helen R.',
    rating: 4,
    date: 'November 2024',
    location: 'Orlando, FL',
    title: 'Nice layered design',
    content: 'The Compact Layer has a nice horizontal emphasis that works well on my long console table. Good value.',
    verified: true,
    helpful: 7,
  },
  {
    id: 'lg-1',
    productId: 'layer-grid',
    author: 'Steven M.',
    rating: 5,
    date: 'January 2025',
    location: 'Cleveland, OH',
    title: 'Geometric perfection',
    content: 'The grid pattern on this piece is so satisfying. It casts interesting shadows on the wall behind it. Highly recommend.',
    verified: true,
    helpful: 12,
    images: [
      'https://placehold.co/400x400/e8e8e8/333333?text=Shadow+Pattern',
      'https://placehold.co/400x400/e8e8e8/333333?text=Grid+Detail',
    ],
  },
  {
    id: 'sc-4',
    productId: 'sky-column',
    author: 'Dorothy L.',
    rating: 5,
    date: 'December 2024',
    location: 'San Antonio, TX',
    title: 'Elegant vertical element',
    content: 'The Sky Column adds height and drama to my corner. The proportions are perfect and it\'s surprisingly stable.',
    verified: true,
    helpful: 9,
    images: [
      'https://placehold.co/400x400/f0f0f0/333333?text=Corner+View',
    ],
  },
]

// ============================================================================
// HELPER: Generate Review Summary for a Product
// ============================================================================

export function generateReviewSummary(productId: string): ReviewSummary {
  const productReviews = mockReviews.filter((r) => r.productId === productId)
  
  if (productReviews.length === 0) {
    return {
      productId,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      aiSummary: undefined,
    }
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalRating = 0

  productReviews.forEach((review) => {
    const rounded = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5
    if (rounded >= 1 && rounded <= 5) {
      ratingDistribution[rounded]++
    }
    totalRating += review.rating
  })

  const averageRating = totalRating / productReviews.length

  return {
    productId,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: productReviews.length,
    ratingDistribution,
    aiSummary: undefined, // Placeholder for AI-generated summary
  }
}

// Pre-computed review summaries for all products with reviews
export const mockReviewSummaries: Record<string, ReviewSummary> = {
  'pure-cube-white': generateReviewSummary('pure-cube-white'),
  'pure-cube-black': generateReviewSummary('pure-cube-black'),
  'pure-cube-gray': generateReviewSummary('pure-cube-gray'),
  'solid-cylinder': generateReviewSummary('solid-cylinder'),
  'soft-sphere': generateReviewSummary('soft-sphere'),
  'fine-cone': generateReviewSummary('fine-cone'),
  'steady-prism': generateReviewSummary('steady-prism'),
  'dual-forms': generateReviewSummary('dual-forms'),
  'vertical-set': generateReviewSummary('vertical-set'),
  'spiral-accent': generateReviewSummary('spiral-accent'),
  'flow-form-i': generateReviewSummary('flow-form-i'),
  'fusion-block': generateReviewSummary('fusion-block'),
  'signature-form-white': generateReviewSummary('signature-form-white'),
  'signature-form-silver': generateReviewSummary('signature-form-silver'),
  'signature-form-black': generateReviewSummary('signature-form-black'),
  'core-assembly': generateReviewSummary('core-assembly'),
  'twin-towers-large': generateReviewSummary('twin-towers-large'),
  'twin-towers-small': generateReviewSummary('twin-towers-small'),
  'floating-disk-white': generateReviewSummary('floating-disk-white'),
  'unity-sphere': generateReviewSummary('unity-sphere'),
  'base-module': generateReviewSummary('base-module'),
  'compact-layer': generateReviewSummary('compact-layer'),
  'layer-grid': generateReviewSummary('layer-grid'),
  'sky-column': generateReviewSummary('sky-column'),
}
