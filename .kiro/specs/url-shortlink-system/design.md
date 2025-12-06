# Design Document

## Overview

The URL Shortlink System is a comprehensive link management solution integrated into the admin dashboard. It enables administrators to create shortened URLs with custom paths, attach preview images for social media sharing, track detailed analytics, detect route collisions, and optionally configure custom domains. The system consists of frontend management interfaces, backend database collections, redirect handling middleware, analytics tracking, and DNS verification services.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shortlink Management UI                             │  │
│  │  - Create/Edit/Delete Links                          │  │
│  │  - Upload Preview Images                             │  │
│  │  - View Analytics                                    │  │
│  │  - Manage Custom Domains                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Appwrite Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Shortlinks  │  │   Analytics  │  │    Domains   │     │
│  │  Collection  │  │  Collection  │  │  Collection  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Storage Bucket (Preview Images)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Routing Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Shortlink Redirect Handler                          │  │
│  │  - Collision Detection                               │  │
│  │  - Analytics Recording                               │  │
│  │  - 301 Redirect                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Destination  │
                    │      URL      │
                    └───────────────┘
```

### Component Interaction Flow

1. **Link Creation Flow**:
   - Admin enters long URL and optional custom path
   - System validates URL format and custom path characters
   - Collision detection checks against existing routes
   - Preview image uploaded to storage bucket
   - Shortlink record created in database
   - Short URL returned to admin

2. **Redirect Flow**:
   - User accesses short URL
   - Router intercepts request
   - System queries shortlink database
   - Analytics event recorded asynchronously
   - 301 redirect issued to destination URL

3. **Analytics Flow**:
   - Click event captured with metadata
   - IP geolocation performed
   - User agent parsed for device info
   - Analytics record created in database
   - Aggregated stats computed on-demand

## Components and Interfaces

### 1. Shortlink Management Component

**Location**: `src/pages/Admin/ShortlinkManagement/ShortlinkManagement.jsx`

**Responsibilities**:
- Display list of all shortlinks with search/filter
- Provide creation form for new shortlinks
- Enable editing of existing shortlinks
- Handle deletion with confirmation
- Show collision warnings
- Display analytics summary

**Key Functions**:
```javascript
- fetchShortlinks(): Promise<Shortlink[]>
- createShortlink(data: ShortlinkData): Promise<Shortlink>
- updateShortlink(id: string, data: ShortlinkData): Promise<Shortlink>
- deleteShortlink(id: string): Promise<void>
- checkCollision(path: string): Promise<CollisionResult>
- uploadPreviewImage(file: File): Promise<string>
```

### 2. Custom Domain Management Component

**Location**: `src/pages/Admin/ShortlinkManagement/DomainManagement.jsx`

**Responsibilities**:
- List configured custom domains
- Add new custom domains
- Verify DNS configuration
- Display DNS setup instructions
- Show domain verification status
- Enable/disable domains

**Key Functions**:
```javascript
- fetchDomains(): Promise<Domain[]>
- addDomain(domain: string): Promise<Domain>
- verifyDomain(id: string): Promise<VerificationResult>
- updateDomain(id: string, data: DomainData): Promise<Domain>
- deleteDomain(id: string): Promise<void>
```

### 3. Analytics Dashboard Component

**Location**: `src/pages/Admin/ShortlinkManagement/AnalyticsDashboard.jsx`

**Responsibilities**:
- Display click trends over time
- Show geographic distribution
- Present referrer breakdown
- Visualize device type statistics
- Export analytics data
- Filter by date range

**Key Functions**:
```javascript
- fetchAnalytics(shortlinkId: string, dateRange: DateRange): Promise<Analytics>
- getClickTrends(shortlinkId: string): Promise<TrendData[]>
- getGeographicData(shortlinkId: string): Promise<GeoData[]>
- getReferrerData(shortlinkId: string): Promise<ReferrerData[]>
- getDeviceData(shortlinkId: string): Promise<DeviceData[]>
- exportAnalytics(shortlinkId: string, format: string): Promise<Blob>
```

### 4. Shortlink Redirect Handler

**Location**: `src/components/ShortlinkRedirect/ShortlinkRedirect.jsx`

**Responsibilities**:
- Intercept requests to potential shortlink paths
- Query database for matching shortlink
- Record analytics event asynchronously
- Perform 301 redirect to destination
- Handle 404 for non-existent shortlinks
- Support custom domain routing

**Key Functions**:
```javascript
- resolveShortlink(path: string, domain: string): Promise<Shortlink | null>
- recordAnalytics(shortlinkId: string, metadata: AnalyticsMetadata): Promise<void>
- performRedirect(url: string): void
- getClientMetadata(): AnalyticsMetadata
```

### 5. Collision Detection Service

**Location**: `src/lib/collisionDetection.js`

**Responsibilities**:
- Check custom path against blog slugs
- Check custom path against project slugs
- Check custom path against certificate routes
- Check custom path against existing shortlinks
- Check custom path against static routes
- Return collision details

**Key Functions**:
```javascript
- checkAllCollisions(path: string): Promise<CollisionResult>
- checkBlogCollision(path: string): Promise<boolean>
- checkProjectCollision(path: string): Promise<boolean>
- checkCertificateCollision(path: string): Promise<boolean>
- checkShortlinkCollision(path: string): Promise<boolean>
- checkStaticRouteCollision(path: string): Promise<boolean>
```

### 6. DNS Verification Service

**Location**: `src/lib/dnsVerification.js`

**Responsibilities**:
- Verify DNS records for custom domains
- Generate DNS configuration instructions
- Check domain reachability
- Validate SSL certificate
- Update domain verification status

**Key Functions**:
```javascript
- verifyDNS(domain: string): Promise<DNSVerificationResult>
- generateDNSInstructions(domain: string): DNSInstructions
- checkDomainReachability(domain: string): Promise<boolean>
- validateSSL(domain: string): Promise<boolean>
```

## Data Models

### Shortlink Model

**Collection**: `shortlinks`

```javascript
{
  $id: string,                    // Unique identifier
  customPath: string,             // Custom URL path (e.g., "my-link")
  destinationUrl: string,         // Full destination URL
  previewImageId: string | null,  // Storage file ID for preview image
  previewImageUrl: string | null, // Full URL to preview image
  domainId: string | null,        // Custom domain ID (null = main domain)
  title: string | null,           // Open Graph title
  description: string | null,     // Open Graph description
  isActive: boolean,              // Whether link is active
  clickCount: number,             // Total clicks (denormalized)
  createdAt: string,              // ISO timestamp
  updatedAt: string,              // ISO timestamp
  createdBy: string               // Admin user ID
}
```

**Indexes**:
- `customPath_idx`: Unique index on `customPath`
- `domainId_idx`: Index on `domainId`
- `createdAt_idx`: Index on `createdAt` (descending)

### Analytics Model

**Collection**: `shortlink_analytics`

```javascript
{
  $id: string,                    // Unique identifier
  shortlinkId: string,            // Reference to shortlink
  timestamp: string,              // ISO timestamp of click
  ipAddress: string,              // Visitor IP (hashed for privacy)
  country: string | null,         // Country code (e.g., "US")
  countryName: string | null,     // Full country name
  city: string | null,            // City name
  referrer: string | null,        // Referrer URL
  userAgent: string,              // Full user agent string
  deviceType: string,             // "desktop", "mobile", "tablet"
  browser: string | null,         // Browser name
  os: string | null,              // Operating system
  customDomain: boolean           // Whether accessed via custom domain
}
```

**Indexes**:
- `shortlinkId_idx`: Index on `shortlinkId`
- `timestamp_idx`: Index on `timestamp` (descending)
- `country_idx`: Index on `country`

### Custom Domain Model

**Collection**: `shortlink_domains`

```javascript
{
  $id: string,                    // Unique identifier
  domain: string,                 // Domain name (e.g., "link.parvej.me")
  isVerified: boolean,            // DNS verification status
  verificationToken: string,      // Token for TXT record verification
  dnsRecords: object,             // Required DNS records
  lastVerifiedAt: string | null,  // Last successful verification
  isActive: boolean,              // Whether domain is active
  createdAt: string,              // ISO timestamp
  updatedBy: string               // Admin user ID
}
```

**Indexes**:
- `domain_idx`: Unique index on `domain`
- `isVerified_idx`: Index on `isVerified`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: URL Format Validation

*For any* string input, the URL validation function should accept valid HTTP/HTTPS URLs and reject invalid formats
**Validates: Requirements 1.1**

### Property 2: URL Persistence

*For any* valid URL submitted, querying the database after creation should return a shortlink record containing that URL
**Validates: Requirements 1.2**

### Property 3: Unique Identifier Generation

*For any* shortlink created without a custom path, the system should generate a unique identifier that doesn't collide with existing paths
**Validates: Requirements 1.3**

### Property 4: Custom Path Validation

*For any* custom path input, the validation should only accept alphanumeric characters, hyphens, and underscores with length between 3-50 characters
**Validates: Requirements 2.1, 2.3**

### Property 5: Path Normalization

*For any* custom path submitted, the system should convert it to lowercase before storage
**Validates: Requirements 2.5**

### Property 6: Preview Image Storage

*For any* valid preview image uploaded, the system should store it in the designated bucket and return a valid URL
**Validates: Requirements 3.2**

### Property 7: Analytics Recording

*For any* shortlink click, the system should record at minimum: timestamp, country, referrer, and user agent
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 8: Collision Detection Completeness

*For any* custom path, the collision detection should check against all existing routes: blogs, projects, certificates, shortlinks, and static routes
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 9: Collision Prevention

*For any* detected collision, the system should prevent shortlink creation until the path is modified
**Validates: Requirements 5.6**

### Property 10: Redirect Performance

*For any* valid shortlink access, the redirect should complete within 200ms under normal conditions
**Validates: Requirements 9.2**

### Property 11: DNS Verification Accuracy

*For any* custom domain, the verification should accurately check required DNS records and report status
**Validates: Requirements 7.2, 7.3, 7.4**

### Property 12: Analytics Asynchronicity

*For any* redirect operation, analytics recording should not block or delay the redirect response
**Validates: Requirements 9.4**

## Implementation Strategy

### Phase 1: Database Setup
1. Create Appwrite collections for shortlinks, analytics, and domains
2. Configure indexes for optimal query performance
3. Set up storage bucket for preview images
4. Configure permissions for admin-only access

### Phase 2: Core Services
1. Implement collision detection service
2. Create shortlink CRUD operations
3. Build analytics recording service
4. Develop DNS verification service

### Phase 3: Admin UI
1. Build shortlink management page
2. Create shortlink creation/edit forms
3. Implement analytics dashboard
4. Add domain management interface

### Phase 4: Redirect Handler
1. Implement route interception logic
2. Add shortlink resolution
3. Integrate analytics recording
4. Handle 404 cases

### Phase 5: Testing & Optimization
1. Test collision detection accuracy
2. Verify redirect performance
3. Validate analytics data collection
4. Test custom domain functionality

## Security Considerations

1. **Admin-Only Access**: All shortlink management operations require admin authentication
2. **IP Hashing**: Store hashed IP addresses for privacy compliance
3. **Input Validation**: Sanitize all user inputs to prevent injection attacks
4. **Rate Limiting**: Implement rate limits on shortlink creation to prevent abuse
5. **DNS Verification**: Validate domain ownership before allowing custom domains
6. **Preview Image Validation**: Restrict file types and sizes for preview images

## Performance Considerations

1. **Caching**: Cache frequently accessed shortlinks in memory
2. **Async Analytics**: Record analytics asynchronously to avoid blocking redirects
3. **Database Indexes**: Use indexes on frequently queried fields
4. **CDN Integration**: Serve preview images through CDN
5. **Query Optimization**: Minimize database queries in redirect path

## Error Handling

1. **Invalid URLs**: Display clear validation messages
2. **Collision Detected**: Show which resource conflicts with the path
3. **Upload Failures**: Provide retry mechanism for image uploads
4. **DNS Errors**: Display specific DNS configuration issues
5. **404 Shortlinks**: Show user-friendly error page
6. **Analytics Failures**: Log errors but don't block redirects