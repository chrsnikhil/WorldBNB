# 🎯 TACTICAL OPS DESIGN SYSTEM
## Comprehensive Style Guide & Implementation Manual

---

## 📋 TABLE OF CONTENTS

1. [Color Palette](#-color-palette)
2. [Typography](#-typography)
3. [Component Library](#-component-library)
4. [Design Patterns](#-design-patterns)
5. [Spacing & Layout](#-spacing--layout)
6. [Utility Classes](#-utility-classes)
7. [Responsive Design](#-responsive-design)
8. [Implementation Examples](#-implementation-examples)
9. [Best Practices](#-best-practices)

---

## 🎨 COLOR PALETTE

### Primary Colors
\`\`\`css
/* Orange (Primary Brand) */
--orange-500: #f97316;
--orange-400: #fb923c;
--orange-600: #ea580c;

/* Usage: CTAs, active states, highlights, brand elements */
\`\`\`

### Neutral Scale
\`\`\`css
/* Dark Theme Foundation */
--black: #000000;           /* Primary background */
--neutral-900: #171717;     /* Secondary background */
--neutral-800: #262626;     /* Card backgrounds */
--neutral-700: #404040;     /* Borders, dividers */
--neutral-600: #525252;     /* Inactive borders */
--neutral-500: #737373;     /* Secondary text */
--neutral-400: #a3a3a3;     /* Muted text */
--neutral-300: #d4d4d4;     /* Light text on dark */
--white: #ffffff;           /* Primary text */
\`\`\`

### Semantic Colors
\`\`\`css
/* System Status Colors */
--green-500: #22c55e;       /* Success, online status */
--yellow-500: #eab308;      /* Warning, pending states */
--red-500: #ef4444;         /* Error, danger zones */
--blue-500: #3b82f6;        /* Information, secondary actions */
\`\`\`

### Chart & Data Visualization
\`\`\`css
--chart-1: hsl(12 76% 61%);  /* Orange tone */
--chart-2: hsl(173 58% 39%); /* Teal tone */
--chart-3: hsl(197 37% 24%); /* Dark blue */
--chart-4: hsl(43 74% 66%);  /* Yellow tone */
--chart-5: hsl(27 87% 67%);  /* Orange-red tone */
\`\`\`

---

## 🔤 TYPOGRAPHY

### Font Stack
\`\`\`css
/* Primary Font Family */
font-family: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;

/* Cyberpunk Aesthetic: Monospace for technical/futuristic feel */
\`\`\`

### Font Weights & Styles
\`\`\`css
/* Weight Scale */
font-weight: 400;  /* Regular - body text */
font-weight: 500;  /* Medium - labels, buttons */
font-weight: 700;  /* Bold - headings, emphasis */

/* Letter Spacing */
letter-spacing: 0.05em;  /* tracking-wider - headings, labels */
letter-spacing: 0.1em;   /* tracking-widest - tactical elements */
\`\`\`

### Typography Hierarchy
\`\`\`tsx
// H1 - Main Headlines
<h1 className="text-4xl md:text-6xl font-bold tracking-wider text-white">
  TACTICAL OPERATIONS
</h1>

// H2 - Section Headers
<h2 className="text-3xl md:text-4xl font-bold tracking-wider text-white">
  MISSION BRIEFING
</h2>

// H3 - Component Titles
<h3 className="text-xl font-bold tracking-wider text-orange-500">
  SYSTEM STATUS
</h3>

// Body Text
<p className="text-sm text-neutral-300 leading-relaxed">
  Standard operational content
</p>

// Labels & Badges
<span className="text-xs font-medium tracking-wider uppercase text-orange-500">
  CLASSIFIED
</span>

// Technical/Code Text
<code className="text-xs font-mono text-green-500 bg-neutral-800 px-2 py-1 rounded">
  ./tactical-ops --status
</code>
\`\`\`

---

## 🧩 COMPONENT LIBRARY

### 1. TacticalButton
**Purpose**: Primary interactive elements with cyberpunk styling

\`\`\`tsx
// Variants
<TacticalButton variant="primary">   {/* Orange background */}
<TacticalButton variant="secondary"> {/* Neutral background */}
<TacticalButton variant="danger">    {/* Red background */}
<TacticalButton variant="success">   {/* Green background */}

// Sizes
<TacticalButton size="sm">  {/* px-3 py-1.5 text-xs */}
<TacticalButton size="md">  {/* px-4 py-2 text-sm */}
<TacticalButton size="lg">  {/* px-6 py-3 text-base */}

// States
<TacticalButton loading={true}>      {/* Shows spinner */}
<TacticalButton disabled={true}>     {/* Disabled state */}

// With Icons
<TacticalButton icon={<Shield />} iconPosition="left">
  SECURE ACCESS
</TacticalButton>
\`\`\`

**Styling Features**:
- Hover scale animation (1.02x)
- Tap scale animation (0.98x)
- Glow effects on hover
- Loading spinner integration
- Monospace typography

### 2. TacticalCard3D
**Purpose**: Interactive 3D cards with popup functionality

\`\`\`tsx
<TacticalCard3D
  title="MISSION BRIEFING"
  description="Classified operational data"
  status="active"
  glowColor="orange"
  onClick={() => setShowPopup(true)}
>
  <div className="space-y-2">
    <div className="text-xs text-neutral-500">STATUS: OPERATIONAL</div>
    <div className="text-sm text-white">Security Level: ALPHA</div>
  </div>
</TacticalCard3D>
\`\`\`

**Features**:
- 3D perspective effects
- Interactive hover animations
- Glow variants: orange, green, blue, red
- Status indicators with pulsing dots
- Popup modal with spinning 3D animation
- Canvas-based 3D rendering

### 3. TacticalForm
**Purpose**: Form inputs with cyberpunk styling

\`\`\`tsx
<TacticalForm>
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-medium tracking-wider text-orange-500 mb-2">
        ACCESS CODE
      </label>
      <input
        type="password"
        className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
        placeholder="Enter classified code..."
      />
    </div>
    
    <div className="flex items-center space-x-2 text-xs text-yellow-500">
      <AlertTriangle className="w-4 h-4" />
      <span>SECURITY NOTICE: All access attempts are logged</span>
    </div>
  </div>
</TacticalForm>
\`\`\`

**Styling Features**:
- Dark theme inputs
- Orange accent colors
- Icon integration
- Security notices
- Focus state management

### 4. TacticalNavbar
**Purpose**: Main navigation with tactical styling

\`\`\`tsx
<TacticalNavbar>
  <nav className="flex items-center justify-between">
    <div className="flex items-center space-x-6">
      <div className="text-xl font-bold tracking-wider text-orange-500">
        TACTICAL OPS
      </div>
      <div className="hidden md:flex space-x-4">
        <NavLink href="/dashboard">COMMAND</NavLink>
        <NavLink href="/operations">OPERATIONS</NavLink>
        <NavLink href="/intel">INTELLIGENCE</NavLink>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <StatusIndicator status="online" />
      <UserMenu />
    </div>
  </nav>
</TacticalNavbar>
\`\`\`

**Features**:
- Sticky positioning with backdrop blur
- Mobile-responsive hamburger menu
- Active state management
- System status indicators
- Smooth animations

---

## 🎭 DESIGN PATTERNS

### Cyberpunk Aesthetic Principles

#### 1. Dark Theme Foundation
\`\`\`css
/* Primary backgrounds */
background-color: #000000;     /* Full black for main areas */
background-color: #171717;     /* Neutral-900 for sections */
background-color: #262626;     /* Neutral-800 for cards */
\`\`\`

#### 2. Neon Accent System
\`\`\`css
/* Primary accent - Orange */
color: #f97316;
border-color: #f97316;
box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);

/* Secondary accents */
color: #22c55e;  /* Green for success */
color: #ef4444;  /* Red for danger */
color: #3b82f6;  /* Blue for info */
\`\`\`

#### 3. Glowing Effects
\`\`\`css
/* Subtle glow for interactive elements */
.glow-orange {
  box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
}

.glow-green {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

/* Hover intensification */
.glow-orange:hover {
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.5);
}
\`\`\`

#### 4. Status Indicators
\`\`\`tsx
// Pulsing status dots
<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
  <span className="text-xs text-green-500">ONLINE</span>
</div>

<div className="flex items-center space-x-2">
  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
  <span className="text-xs text-red-500">OFFLINE</span>
</div>
\`\`\`

### Animation Patterns

#### 1. Framer Motion Integration
\`\`\`tsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>

// Stagger animations
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {children}
</motion.div>
\`\`\`

#### 2. Hover Effects
\`\`\`css
/* Scale transforms */
.hover-scale:hover {
  transform: scale(1.02);
}

.hover-scale-lg:hover {
  transform: scale(1.05);
}

/* Glow intensification */
.hover-glow:hover {
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.5);
}
\`\`\`

---

## 📐 SPACING & LAYOUT

### Spacing Scale
\`\`\`css
/* Tailwind spacing scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
\`\`\`

### Layout Patterns
\`\`\`tsx
// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items}
</div>

// Card layouts
<div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
  {content}
</div>

// Flexbox patterns
<div className="flex items-center justify-between space-x-4">
  {elements}
</div>
\`\`\`

### Border Radius System
\`\`\`css
/* Consistent radius scale */
border-radius: 0.25rem;  /* 4px - small elements */
border-radius: 0.5rem;   /* 8px - default */
border-radius: 0.75rem;  /* 12px - large cards */
border-radius: 9999px;   /* Full - circular elements */
\`\`\`

---

## 🔧 UTILITY CLASSES

### Background Classes
\`\`\`css
.bg-primary { background-color: #000000; }
.bg-secondary { background-color: #171717; }
.bg-card { background-color: #262626; }
.bg-accent { background-color: #f97316; }
\`\`\`

### Text Color Classes
\`\`\`css
.text-primary { color: #ffffff; }
.text-secondary { color: #a3a3a3; }
.text-accent { color: #f97316; }
.text-success { color: #22c55e; }
.text-danger { color: #ef4444; }
.text-warning { color: #eab308; }
\`\`\`

### Border Classes
\`\`\`css
.border-default { border-color: #404040; }
.border-accent { border-color: #f97316; }
.border-success { border-color: #22c55e; }
.border-danger { border-color: #ef4444; }
\`\`\`

---

## 📱 RESPONSIVE DESIGN

### Breakpoint System
\`\`\`css
/* Mobile First Approach */
/* Default: < 768px */

@media (min-width: 768px) {  /* md: tablet */
  /* Tablet styles */
}

@media (min-width: 1024px) { /* lg: desktop */
  /* Desktop styles */
}

@media (min-width: 1280px) { /* xl: large desktop */
  /* Large desktop styles */
}
\`\`\`

### Responsive Patterns
\`\`\`tsx
// Grid responsiveness
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Text size responsiveness
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">

// Spacing responsiveness
<div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">

// Visibility responsiveness
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
\`\`\`

---

## 💡 IMPLEMENTATION EXAMPLES

### Complete Component Example
\`\`\`tsx
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';

const TacticalMissionCard = ({ mission, status, priority }) => {
  return (
    <motion.div
      className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-orange-500 transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold tracking-wider text-white">
          {mission.title}
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            status === 'active' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className={`text-xs font-medium tracking-wider ${
            status === 'active' ? 'text-green-500' : 'text-red-500'
          }`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-neutral-300 mb-4 leading-relaxed">
        {mission.description}
      </p>

      {/* Priority Badge */}
      <div className="flex items-center space-x-2 mb-4">
        {priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
        <span className={`text-xs font-medium tracking-wider px-2 py-1 rounded ${
          priority === 'high' 
            ? 'bg-red-500/20 text-red-500 border border-red-500/30'
            : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
        }`}>
          PRIORITY: {priority.toUpperCase()}
        </span>
      </div>

      {/* Action Button */}
      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center space-x-2">
        <Shield className="w-4 h-4" />
        <span className="tracking-wider">EXECUTE MISSION</span>
      </button>
    </motion.div>
  );
};
\`\`\`

### Form Implementation
\`\`\`tsx
const TacticalLoginForm = () => {
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-wider text-orange-500 mb-2">
          SECURE ACCESS
        </h2>
        <p className="text-sm text-neutral-400">
          Enter classified credentials
        </p>
      </div>

      <form className="space-y-6">
        <div>
          <label className="block text-xs font-medium tracking-wider text-orange-500 mb-2">
            AGENT ID
          </label>
          <input
            type="text"
            className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter agent identifier..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium tracking-wider text-orange-500 mb-2">
            ACCESS CODE
          </label>
          <input
            type="password"
            className="w-full bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter classified code..."
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-yellow-500">
          <AlertTriangle className="w-4 h-4" />
          <span>All access attempts are monitored and logged</span>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded transition-colors duration-200 tracking-wider"
        >
          INITIATE ACCESS
        </button>
      </form>
    </div>
  );
};
\`\`\`

---

## ✅ BEST PRACTICES

### 1. Color Usage
- **Always maintain contrast ratios** of at least 4.5:1 for text
- **Use orange sparingly** as the primary accent - it should feel special
- **Leverage the neutral scale** for hierarchy and depth
- **Reserve semantic colors** (red, green, yellow) for their intended purposes

### 2. Typography
- **Stick to the monospace font** for consistency with the cyberpunk theme
- **Use tracking-wider** for headings and labels to enhance readability
- **Maintain the type scale** - don't create custom sizes
- **Uppercase sparingly** - reserve for labels and tactical elements

### 3. Spacing
- **Follow the 8px grid system** - all spacing should be multiples of 8px
- **Use consistent padding** within similar components
- **Maintain breathing room** - don't overcrowd interfaces
- **Responsive spacing** - adjust for different screen sizes

### 4. Animation
- **Keep animations subtle** - they should enhance, not distract
- **Use consistent timing** - 200-300ms for micro-interactions
- **Respect reduced motion** preferences
- **Test performance** on lower-end devices

### 5. Accessibility
- **Ensure keyboard navigation** works for all interactive elements
- **Provide focus indicators** that are clearly visible
- **Use semantic HTML** elements where appropriate
- **Test with screen readers** to ensure compatibility

### 6. Performance
- **Optimize images** and use appropriate formats
- **Lazy load** non-critical components
- **Minimize bundle size** by tree-shaking unused code
- **Use CSS variables** for theme consistency

---

## 🚀 GETTING STARTED

1. **Install Dependencies**
   \`\`\`bash
   npm install framer-motion lucide-react
   \`\`\`

2. **Import Base Styles**
   \`\`\`tsx
   import './globals.css'
   \`\`\`

3. **Use Components**
   \`\`\`tsx
   import { TacticalButton, TacticalCard3D } from '@/components/cyberpunk'
   \`\`\`

4. **Follow the Style Guide**
   - Reference color palette for consistent theming
   - Use typography hierarchy for proper text styling
   - Apply spacing system for consistent layouts
   - Implement responsive patterns for all screen sizes

---

*This style guide is a living document. Update it as the design system evolves to maintain consistency across the tactical operations interface.*
