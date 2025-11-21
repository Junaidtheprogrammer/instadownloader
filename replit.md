# Instagram Video Downloader - InstaDown

## Project Overview
A web application that allows users to download Instagram videos (Reels, IGTV, Posts) by pasting the video URL. Features Instagram-inspired design with gradient purple/pink/orange aesthetics, dark mode support, and a clean, modern interface.

## Current Status: MVP Feature-Complete with Third-Party API Limitations

### Implemented Features ✅
1. **Frontend**
   - Hero section with URL input and validation
   - Video preview card with metadata display
   - Quality selector UI (shows best available quality)
   - Download button with progress tracking
   - Secondary actions: Copy URL and Share functionality
   - Features showcase section
   - How It Works guide (3-step process)
   - Footer with links (FAQ, Privacy, Terms, Contact)
   - Responsive design for mobile and desktop
   - Dark mode support with theme toggle
   - Comprehensive data-testid attributes for testing

2. **Backend**
   - POST `/api/fetch-video` - Fetches Instagram video metadata
   - GET `/api/download-video?token=<uuid>` - Secure token-based video download proxy
   - Token system with UUID generation, 30-minute expiration, and automatic cleanup
   - Strict hostname validation (prevents domain spoofing attacks)
   - HTTPS-only enforcement
   - Enhanced error handling for Instagram API issues (401, 404, 429 errors)

3. **Security**
   - Server-side URL storage with UUID tokens
   - Strict regex-based hostname validation
   - HTTPS protocol enforcement
   - Token expiration and automatic cleanup
   - CDN URL validation (Instagram domains only)

### Known Limitations (Third-Party API)

The application uses the `instagram-url-direct` npm package, which relies on Instagram's **unofficial API**. This introduces several fundamental limitations:

1. **Instagram Blocks Requests (401 Errors)**
   - Instagram actively prevents scraping by blocking requests with 401 Unauthorized errors
   - This is intentional anti-scraping behavior from Instagram
   - Affects ALL tools using unofficial Instagram APIs
   - **Impact**: Some video fetch requests will fail
   - **User Experience**: Clear error message displayed: "Instagram is currently blocking video downloads. Please try again later or use a different video URL."

2. **Limited Metadata Available**
   - View counts: Not exposed by Instagram's unofficial API
   - Multiple quality options: Instagram typically serves one optimized quality
   - Full duration/stats: May not always be available
   - **Impact**: Quality selector shows "Best Available" rather than multiple options
   - **User Experience**: UI displays available metadata gracefully, hiding unavailable fields

3. **Rate Limiting**
   - Instagram may rate limit excessive requests
   - **Impact**: Temporary blocks after too many downloads
   - **User Experience**: Clear error message about rate limits

### Alternative Solutions (Not Implemented)

To avoid these limitations, the following approaches would be needed:

1. **Instagram Official API**
   - Requires: OAuth authentication, Instagram app registration, user permissions
   - Benefits: Reliable access, official support, no blocking
   - Drawbacks: Complex setup, requires users to authenticate, limited to their own content

2. **Different Scraping Service**
   - Paid third-party APIs (e.g., RapidAPI Instagram scrapers)
   - Benefits: May have better reliability
   - Drawbacks: Costs money, still unofficial (may break)

3. **Browser Extension Approach**
   - Run scraping in user's browser with their Instagram session
   - Benefits: Uses user's own authentication
   - Drawbacks: Requires browser extension, different architecture

## Technical Architecture

### Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Video Fetching**: instagram-url-direct package
- **Storage**: In-memory (MemStorage)

### File Structure
```
client/src/
  ├── pages/
  │   └── home.tsx          # Main page with all functionality
  ├── components/ui/        # Shadcn UI components
  ├── lib/queryClient.ts    # React Query configuration
  └── index.css            # Design tokens and global styles

server/
  ├── routes.ts            # API endpoints
  ├── storage.ts           # Token storage interface
  └── index-dev.ts         # Server entry point

shared/
  └── schema.ts            # Shared TypeScript types and Zod schemas
```

### Data Flow
1. User pastes Instagram URL → Frontend validation
2. Frontend sends POST to `/api/fetch-video`
3. Backend calls `instagram-url-direct` to scrape Instagram
4. Backend generates UUID token, stores video URL in memory
5. Backend returns metadata + token to frontend
6. User clicks download → Frontend sends GET to `/api/download-video?token=<uuid>`
7. Backend validates token, fetches video from Instagram CDN
8. Backend streams video to user with proper headers

### Design System
- **Colors**: Instagram gradient (purple #C13584, pink, orange)
- **Font**: Inter
- **Components**: Shadcn UI with custom Instagram theming
- **Dark Mode**: Full support with theme toggle

## Running the Project
```bash
npm run dev
```
- Express server + Vite dev server run on port 5000
- Backend at `http://localhost:5000/api`
- Frontend at `http://localhost:5000`

## Testing
The application has been tested for:
- URL validation and error handling
- UI responsiveness and dark mode
- Download flow (when Instagram API allows)
- Progress tracking
- Secondary actions (copy, share)

**Note**: End-to-end testing may fail due to Instagram's 401 blocking, which is expected behavior from Instagram's anti-scraping measures.

## Future Enhancements (If Needed)
1. Implement Instagram Official API integration
2. Add session-bound tokens for enhanced security
3. Add download history (requires database)
4. Implement user authentication
5. Add support for photo downloads
6. Batch download multiple videos
7. Add video preview player

## User Preferences
- Prioritize clean, modern UI design
- Instagram-inspired aesthetics
- Full backend API integration (no mock data)
- Security through token-based downloads

## Last Updated
November 21, 2025
