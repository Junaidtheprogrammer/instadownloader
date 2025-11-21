# Instagram Video Downloader - Design Guidelines

## Design Approach

**Reference-Based Approach: Instagram-Inspired**
Drawing from Instagram's design language: clean, minimal, content-first, mobile-optimized interface. The design emphasizes visual content (video previews) while maintaining utility and speed.

**Core Design Principles:**
- Mobile-first responsiveness (Instagram's primary platform)
- Visual hierarchy that guides users through: Input → Preview → Download
- Minimal distractions - focus on the core task
- Fast, intuitive interaction flow

## Typography

**Font Family:** Inter or SF Pro Display (Instagram's typography feel)
- Headings: Font weight 700, sizes from text-2xl to text-4xl
- Body text: Font weight 400-500, text-base to text-lg
- Input labels: Font weight 600, text-sm
- Buttons: Font weight 600, text-base

**Hierarchy:**
- Hero headline: text-3xl md:text-4xl font-bold
- Section headers: text-xl md:text-2xl font-semibold
- Video metadata: text-sm font-medium
- Helper text: text-xs font-normal

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Common padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Element gaps: gap-4, gap-6, gap-8
- Component margins: m-2, m-4, m-6

**Container Strategy:**
- Max width: max-w-2xl for main content (focused, not sprawling)
- Full-width sections with inner max-w-6xl for features
- Single column layout on mobile, strategic 2-column on desktop

## Page Structure

### Hero Section (60-70vh)
- Centered vertical layout
- Large headline explaining the service
- Subheadline with quick value proposition
- Primary URL input field (prominent, rounded-xl, shadow-lg)
- Single CTA button below input
- No background image - clean, focused on the input

### How It Works Section
- 3-column grid (single column mobile): grid-cols-1 md:grid-cols-3
- Numbered steps with icons
- Brief description per step
- Spacing: py-16

### Features Section
- 2-column grid alternating layout: grid-cols-1 md:grid-cols-2
- Each feature: Icon + Title + Description
- Visual balance with text left/right alternating
- Spacing: py-16

### Video Preview Component (appears after URL submission)
- Card-based design with rounded-2xl corners, shadow-xl
- Video thumbnail display (16:9 aspect ratio)
- Metadata row: username, duration, view count icons
- Download quality selector (dropdown/radio buttons)
- Primary download button (full-width within card)
- Secondary actions: Copy URL, Share

### Footer
- Centered layout
- Quick links: FAQ, Privacy, Terms, Contact
- Social media icons
- Disclaimer text about fair use
- Compact spacing: py-8

## Component Library

### Input Field (URL Entry)
- Large size: h-14 to h-16
- Rounded corners: rounded-xl
- Prominent shadow: shadow-lg
- Placeholder: "Paste Instagram video URL here..."
- Built-in validation indicator (icon right side)

### Buttons
**Primary CTA:**
- Size: px-8 py-4
- Rounded: rounded-xl
- Font weight: 600
- Full-width on mobile, auto on desktop

**Secondary Actions:**
- Size: px-6 py-3
- Rounded: rounded-lg
- Outlined style with border-2

### Cards (Video Preview)
- Padding: p-6
- Rounded: rounded-2xl
- Shadow: shadow-xl
- Border: border with subtle treatment

### Icons
- Library: Heroicons (outline for navigation, solid for actions)
- Sizes: w-5 h-5 for inline, w-8 h-8 for feature icons, w-12 h-12 for step numbers
- Always paired with text labels

### Loading States
- Spinner component for API calls
- Skeleton screens for video preview loading
- Progress bar for download operations

## Responsive Behavior

**Mobile (base):**
- Single column layouts
- Full-width components
- Larger touch targets (min h-12)
- Collapsed navigation if needed

**Tablet (md: 768px):**
- 2-column grids where appropriate
- Wider max-width containers
- Side-by-side feature displays

**Desktop (lg: 1024px):**
- 3-column feature grids
- Optimal max-width constraints (max-w-2xl for forms)
- Enhanced spacing

## Interaction Patterns

**URL Input Flow:**
1. User pastes URL
2. Real-time validation (format check)
3. Submit triggers loading state
4. Video preview card animates in
5. Download options become available

**Download Flow:**
1. Quality selection (if multiple available)
2. Click download button
3. Progress indicator appears
4. Success confirmation message

**Error Handling:**
- Inline error messages below input
- Toast notifications for system errors
- Clear, actionable error text
- Retry options always visible

## Images

**Hero Section:** No image - keep clean and focused on input functionality

**Feature Icons:** Use Heroicons for consistency - Download icon, Video icon, Lightning bolt (speed), Shield (privacy)

**Video Thumbnails:** User-generated content from Instagram API - displayed in 16:9 ratio with object-cover

**Placeholder States:** Use gradient backgrounds or icon-based placeholders when video thumbnail unavailable

## Accessibility

- All inputs have associated labels (can be visually hidden)
- Focus states clearly visible on all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Color contrast ratios meet WCAG AA standards minimum