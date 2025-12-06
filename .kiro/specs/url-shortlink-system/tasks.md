# Tasks

## Task 1: Setup Appwrite Database Collections

**Description**: Create the necessary Appwrite database collections and storage bucket for the shortlink system.

**Depends On**: None

**Acceptance Criteria**:
- [ ] Create `shortlinks` collection with all required attributes
- [ ] Create `shortlink_analytics` collection with all required attributes
- [ ] Create `shortlink_domains` collection with all required attributes
- [ ] Create indexes on `customPath`, `domainId`, `createdAt` for shortlinks
- [ ] Create indexes on `shortlinkId`, `timestamp`, `country` for analytics
- [ ] Create indexes on `domain`, `isVerified` for domains
- [ ] Create storage bucket `shortlink-previews` for preview images
- [ ] Configure appropriate permissions for admin-only access

**Implementation Notes**:
- Use Appwrite CLI or console to create collections
- Reference existing database ID from .env
- Set up proper attribute types and sizes
- Enable required validation on critical fields

---

## Task 2: Implement Collision Detection Service

**Description**: Create a service that checks if a custom path conflicts with existing routes in the application.

**Depends On**: Task 1

**Acceptance Criteria**:
- [ ] Create `src/lib/collisionDetection.js` service file
- [ ] Implement `checkBlogCollision()` to query blog posts by slug
- [ ] Implement `checkProjectCollision()` to query projects by slug
- [ ] Implement `checkCertificateCollision()` to check certificate routes
- [ ] Implement `checkShortlinkCollision()` to check existing shortlinks
- [ ] Implement `checkStaticRouteCollision()` for hardcoded routes (admin, shop, etc.)
- [ ] Implement `checkAllCollisions()` that runs all checks and returns detailed results
- [ ] Return collision type and conflicting resource details

**Implementation Notes**:
- Query Appwrite collections for blogs, projects, shortlinks
- Maintain a list of static routes to check against
- Return structured collision result with boolean and details
- Make all checks case-insensitive

---

## Task 3: Create Shortlink Service Layer

**Description**: Build the core service layer for CRUD operations on shortlinks.

**Depends On**: Task 1, Task 2

**Acceptance Criteria**:
- [ ] Create `src/lib/shortlinkService.js` service file
- [ ] Implement `createShortlink()` with validation and collision check
- [ ] Implement `getShortlink()` to fetch by ID
- [ ] Implement `getShortlinkByPath()` to fetch by custom path
- [ ] Implement `listShortlinks()` with pagination and search
- [ ] Implement `updateShortlink()` with re-validation
- [ ] Implement `deleteShortlink()` with preview image cleanup
- [ ] Implement `uploadPreviewImage()` for image storage
- [ ] Implement `generateRandomPath()` for auto-generated paths

**Implementation Notes**:
- Use Appwrite SDK for database operations
- Validate URL format using URL constructor
- Validate custom path with regex: /^[a-z0-9_-]{3,50}$/
- Convert custom paths to lowercase
- Handle preview image upload to storage bucket
- Return full shortlink object with preview URL

---

## Task 4: Create Analytics Service Layer

**Description**: Build the service layer for recording and querying analytics data.

**Depends On**: Task 1

**Acceptance Criteria**:
- [ ] Create `src/lib/analyticsService.js` service file
- [ ] Implement `recordClick()` to create analytics record
- [ ] Implement `getAnalyticsSummary()` for overview stats
- [ ] Implement `getClickTrends()` for time-series data
- [ ] Implement `getGeographicData()` for country breakdown
- [ ] Implement `getReferrerData()` for referrer sources
- [ ] Implement `getDeviceData()` for device type stats
- [ ] Implement IP geolocation using a free API (ipapi.co or similar)
- [ ] Implement user agent parsing for device/browser detection

**Implementation Notes**:
- Hash IP addresses before storage for privacy
- Use ipapi.co or ip-api.com for geolocation
- Parse user agent with ua-parser-js library
- Aggregate data on-demand from raw analytics records
- Handle async recording without blocking

---

## Task 5: Create DNS Verification Service

**Description**: Build the service for verifying custom domain DNS configuration.

**Depends On**: Task 1

**Acceptance Criteria**:
- [ ] Create `src/lib/dnsVerification.js` service file
- [ ] Implement `generateVerificationToken()` for unique tokens
- [ ] Implement `verifyDNS()` to check DNS records
- [ ] Implement `generateDNSInstructions()` for setup guide
- [ ] Implement `checkDomainReachability()` to test domain access
- [ ] Create domain service CRUD operations in `src/lib/domainService.js`
- [ ] Handle A record and CNAME record verification

**Implementation Notes**:
- Use DNS lookup APIs or libraries (dns.lookup in Node.js)
- Generate unique verification tokens for TXT records
- Provide clear instructions for Cloudflare DNS setup
- Check if domain points to correct IP/CNAME
- Update verification status in database

---

## Task 6: Build Shortlink Management UI

**Description**: Create the main admin interface for managing shortlinks.

**Depends On**: Task 3, Task 2

**Acceptance Criteria**:
- [ ] Create `src/pages/Admin/ShortlinkManagement/ShortlinkManagement.jsx`
- [ ] Display list of all shortlinks in a table/grid
- [ ] Implement search and filter functionality
- [ ] Add "Create Shortlink" button and modal/form
- [ ] Show collision warnings in real-time as user types
- [ ] Display shortlink details with click count
- [ ] Add edit and delete actions for each shortlink
- [ ] Show preview image thumbnails
- [ ] Add copy-to-clipboard for short URLs
- [ ] Integrate with existing admin layout and navigation

**Implementation Notes**:
- Use existing UI components from the project
- Add debounced collision checking on path input
- Show visual indicators for collision status
- Use toast notifications for success/error messages
- Add confirmation dialog for deletions

---

## Task 7: Build Shortlink Creation/Edit Form

**Description**: Create the form component for creating and editing shortlinks.

**Depends On**: Task 3, Task 2

**Acceptance Criteria**:
- [ ] Create `src/components/Admin/ShortlinkForm/ShortlinkForm.jsx`
- [ ] Add input field for destination URL with validation
- [ ] Add input field for custom path with real-time validation
- [ ] Add toggle for auto-generate vs custom path
- [ ] Add domain selector (main domain vs custom domains)
- [ ] Add preview image upload with drag-and-drop
- [ ] Add Open Graph title and description fields
- [ ] Show collision warnings inline
- [ ] Display generated short URL preview
- [ ] Handle form submission with loading states

**Implementation Notes**:
- Validate URL format on blur
- Check collisions with 500ms debounce
- Show character count for custom path (3-50)
- Preview the short URL as user types
- Support image preview before upload
- Clear form after successful creation

---

## Task 8: Build Analytics Dashboard

**Description**: Create the analytics visualization interface for shortlinks.

**Depends On**: Task 4

**Acceptance Criteria**:
- [ ] Create `src/pages/Admin/ShortlinkManagement/AnalyticsDashboard.jsx`
- [ ] Display total clicks with trend indicator
- [ ] Show click trends chart (line/bar chart)
- [ ] Display geographic distribution (map or list)
- [ ] Show top referrer sources
- [ ] Display device type breakdown (pie/donut chart)
- [ ] Add date range selector
- [ ] Implement export to CSV functionality
- [ ] Show real-time updates option

**Implementation Notes**:
- Use chart library like recharts or chart.js
- Implement date range filtering
- Calculate percentage breakdowns
- Format numbers with commas
- Add loading skeletons for data fetching
- Cache analytics data with short TTL

---

## Task 9: Build Domain Management UI

**Description**: Create the interface for managing custom domains.

**Depends On**: Task 5

**Acceptance Criteria**:
- [ ] Create `src/pages/Admin/ShortlinkManagement/DomainManagement.jsx`
- [ ] Display list of configured domains with status
- [ ] Add "Add Domain" button and form
- [ ] Show DNS verification status (verified/pending/failed)
- [ ] Display DNS configuration instructions
- [ ] Show required DNS records (A, CNAME, TXT)
- [ ] Add "Verify DNS" button to re-check
- [ ] Add enable/disable toggle for domains
- [ ] Add delete domain functionality

**Implementation Notes**:
- Use status badges for verification state
- Show copy buttons for DNS record values
- Display last verified timestamp
- Add manual refresh for DNS verification
- Show Cloudflare-specific instructions
- Warn before deleting domains with active shortlinks

---

## Task 10: Implement Shortlink Redirect Handler

**Description**: Create the routing logic to intercept and redirect shortlink requests.

**Depends On**: Task 3, Task 4

**Acceptance Criteria**:
- [ ] Create `src/components/ShortlinkRedirect/ShortlinkRedirect.jsx`
- [ ] Integrate with React Router to catch unmatched routes
- [ ] Query database for matching shortlink by path
- [ ] Extract client metadata (IP, user agent, referrer)
- [ ] Record analytics asynchronously
- [ ] Perform 301 redirect to destination URL
- [ ] Handle 404 for non-existent shortlinks
- [ ] Support custom domain detection
- [ ] Render Open Graph meta tags for preview

**Implementation Notes**:
- Use React Router's catch-all route
- Check shortlink before showing 404
- Use window.location.replace() for redirect
- Don't wait for analytics recording
- Add meta tags in document head for OG preview
- Handle both main domain and custom domains

---

## Task 11: Add Shortlink Navigation Menu Item

**Description**: Integrate the shortlink feature into the admin dashboard navigation.

**Depends On**: Task 6

**Acceptance Criteria**:
- [ ] Add "Shortlinks" menu item to admin sidebar
- [ ] Add appropriate icon for shortlinks
- [ ] Configure route in admin router
- [ ] Add permission check for admin users only
- [ ] Update navigation highlighting for active route

**Implementation Notes**:
- Follow existing navigation pattern
- Use link icon or similar for shortlinks
- Add route to admin routes configuration
- Ensure consistent styling with other menu items

---

## Task 12: Create Setup Documentation

**Description**: Write comprehensive documentation for setting up and using the shortlink system.

**Depends On**: All previous tasks

**Acceptance Criteria**:
- [ ] Create `SHORTLINK_SYSTEM_SETUP.md` guide
- [ ] Document Appwrite collection setup steps
- [ ] Document storage bucket configuration
- [ ] Document custom domain setup process
- [ ] Document DNS configuration for Cloudflare
- [ ] Add screenshots for key features
- [ ] Create quick start guide
- [ ] Document API endpoints if applicable

**Implementation Notes**:
- Include step-by-step instructions
- Add example DNS records
- Include troubleshooting section
- Document environment variables if needed
- Add usage examples

---

## Task 13: Testing and Optimization

**Description**: Test the complete shortlink system and optimize performance.

**Depends On**: All previous tasks

**Acceptance Criteria**:
- [ ] Test shortlink creation with various URLs
- [ ] Test collision detection accuracy
- [ ] Test redirect performance (< 200ms)
- [ ] Test analytics recording and aggregation
- [ ] Test custom domain functionality
- [ ] Test preview image display on social platforms
- [ ] Test mobile responsiveness
- [ ] Optimize database queries with indexes
- [ ] Add error boundaries for UI components

**Implementation Notes**:
- Test with real social media platforms (WhatsApp, Messenger, Twitter)
- Use browser dev tools to measure redirect time
- Test with various URL formats and edge cases
- Verify analytics data accuracy
- Test DNS verification with actual domain
- Check for memory leaks in analytics recording
