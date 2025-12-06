# Requirements Document

## Introduction

This document specifies the requirements for a URL shortlink management system integrated into the admin dashboard. The system enables administrators to create, manage, and track shortened URLs with custom paths, preview images for social media sharing, analytics tracking, collision detection with existing routes, and optional custom domain support.

## Glossary

- **Shortlink System**: The complete URL shortening and management feature within the admin dashboard
- **Short URL**: A shortened version of a long URL using either the main domain or a custom subdomain
- **Custom Path**: A user-defined suffix appended to the domain to create a short URL
- **Preview Image**: An Open Graph image displayed when a short URL is shared on social platforms
- **Analytics Engine**: The component that tracks and reports click data for short URLs
- **Collision Detection**: The process of checking if a custom path conflicts with existing routes
- **Custom Domain**: An optional subdomain (e.g., link.parvej.me) used for creating short URLs
- **DNS Verification**: The process of validating that DNS records are correctly configured for a custom domain

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to create short URLs from long URLs, so that I can share concise links that are easier to distribute and track.

#### Acceptance Criteria

1. WHEN an administrator enters a long URL in the creation form THEN the Shortlink System SHALL validate the URL format and accept valid HTTP/HTTPS URLs
2. WHEN an administrator submits a valid long URL THEN the Shortlink System SHALL store the URL mapping in the database
3. WHEN an administrator creates a short URL THEN the Shortlink System SHALL generate a unique identifier if no custom path is provided
4. WHEN a short URL is created THEN the Shortlink System SHALL return the complete shortened URL to the administrator
5. WHEN an administrator attempts to create a short URL with an invalid URL format THEN the Shortlink System SHALL display a validation error message

### Requirement 2

**User Story:** As an administrator, I want to create custom short URL paths, so that I can create memorable and branded links.

#### Acceptance Criteria

1. WHEN an administrator enters a custom path suffix THEN the Shortlink System SHALL validate that the path contains only alphanumeric characters, hyphens, and underscores
2. WHEN an administrator submits a custom path THEN the Shortlink System SHALL append the path to the selected domain to create the short URL
3. WHEN an administrator creates a custom path THEN the Shortlink System SHALL enforce a minimum length of 3 characters and maximum length of 50 characters
4. WHEN a custom path contains invalid characters THEN the Shortlink System SHALL display a validation error with allowed character information
5. WHEN an administrator creates a custom path THEN the Shortlink System SHALL convert the path to lowercase for consistency

### Requirement 3

**User Story:** As an administrator, I want to add preview images to short URLs, so that shared links display attractive previews on social media platforms and messaging apps.

#### Acceptance Criteria

1. WHEN an administrator uploads a preview image THEN the Shortlink System SHALL accept common image formats including JPEG, PNG, and WebP
2. WHEN a preview image is uploaded THEN the Shortlink System SHALL store the image in the designated storage bucket
3. WHEN a short URL with a preview image is accessed THEN the Shortlink System SHALL serve Open Graph meta tags with the image URL
4. WHEN a preview image exceeds 5MB THEN the Shortlink System SHALL reject the upload and display a size limit error
5. WHEN an administrator updates a preview image THEN the Shortlink System SHALL replace the previous image and update the metadata

### Requirement 4

**User Story:** As an administrator, I want to track analytics for short URLs, so that I can understand link performance and audience behavior.

#### Acceptance Criteria

1. WHEN a user clicks a short URL THEN the Analytics Engine SHALL record the click event with a timestamp
2. WHEN a click event occurs THEN the Analytics Engine SHALL capture the visitor's country based on IP geolocation
3. WHEN a click event occurs THEN the Analytics Engine SHALL record the referrer URL if available
4. WHEN a click event occurs THEN the Analytics Engine SHALL capture the user agent string for device and browser identification
5. WHEN an administrator views analytics THEN the Analytics Engine SHALL display total click count, geographic distribution, referrer sources, and device types

### Requirement 5

**User Story:** As an administrator, I want collision detection for custom paths, so that I can avoid creating short URLs that conflict with existing application routes.

#### Acceptance Criteria

1. WHEN an administrator enters a custom path THEN the Collision Detection SHALL check against all existing blog post slugs
2. WHEN an administrator enters a custom path THEN the Collision Detection SHALL check against all existing project slugs
3. WHEN an administrator enters a custom path THEN the Collision Detection SHALL check against all existing certificate routes
4. WHEN an administrator enters a custom path THEN the Collision Detection SHALL check against all existing short URL paths
5. WHEN a collision is detected THEN the Collision Detection SHALL display a warning message indicating which resource conflicts with the path
6. WHEN a collision is detected THEN the Collision Detection SHALL prevent the creation of the short URL until the path is modified

### Requirement 6

**User Story:** As an administrator, I want to manage existing short URLs, so that I can update, organize, and remove links as needed.

#### Acceptance Criteria

1. WHEN an administrator accesses the shortlink management page THEN the Shortlink System SHALL display a list of all created short URLs with their metadata
2. WHEN an administrator selects a short URL THEN the Shortlink System SHALL allow editing of the destination URL, custom path, and preview image
3. WHEN an administrator updates a short URL THEN the Shortlink System SHALL re-validate the custom path for collisions
4. WHEN an administrator deletes a short URL THEN the Shortlink System SHALL remove the database record and associated preview image
5. WHEN an administrator searches for short URLs THEN the Shortlink System SHALL filter results by custom path, destination URL, or creation date

### Requirement 7

**User Story:** As an administrator, I want to configure custom domains for short URLs, so that I can use branded subdomains like link.parvej.me for my shortened links.

#### Acceptance Criteria

1. WHEN an administrator enters a custom domain THEN the Shortlink System SHALL validate the domain format
2. WHEN a custom domain is added THEN the DNS Verification SHALL check for required DNS records including A or CNAME records
3. WHEN DNS records are correctly configured THEN the DNS Verification SHALL mark the domain status as verified
4. WHEN DNS records are missing or incorrect THEN the DNS Verification SHALL display the required DNS configuration with specific record values
5. WHEN a custom domain is verified THEN the Shortlink System SHALL allow administrators to select it when creating new short URLs
6. WHEN an administrator views custom domain settings THEN the Shortlink System SHALL display the current verification status and DNS instructions

### Requirement 8

**User Story:** As an administrator, I want to view detailed analytics reports, so that I can make data-driven decisions about link sharing strategies.

#### Acceptance Criteria

1. WHEN an administrator views a short URL's analytics THEN the Analytics Engine SHALL display click trends over time with daily granularity
2. WHEN an administrator views geographic data THEN the Analytics Engine SHALL present a breakdown of clicks by country with percentages
3. WHEN an administrator views referrer data THEN the Analytics Engine SHALL list top referrer sources with click counts
4. WHEN an administrator views device data THEN the Analytics Engine SHALL categorize clicks by device type including desktop, mobile, and tablet
5. WHEN an administrator exports analytics THEN the Analytics Engine SHALL generate a downloadable report in CSV format

### Requirement 9

**User Story:** As a visitor, I want short URLs to redirect quickly, so that I can access the intended content without delay.

#### Acceptance Criteria

1. WHEN a visitor accesses a valid short URL THEN the Shortlink System SHALL perform a 301 permanent redirect to the destination URL
2. WHEN a visitor accesses a short URL THEN the Shortlink System SHALL complete the redirect within 200 milliseconds under normal conditions
3. WHEN a visitor accesses a non-existent short URL THEN the Shortlink System SHALL display a 404 error page
4. WHEN a redirect occurs THEN the Shortlink System SHALL record analytics data asynchronously without delaying the redirect
5. WHEN a short URL uses a custom domain THEN the Shortlink System SHALL handle the redirect identically to main domain short URLs

### Requirement 10

**User Story:** As an administrator, I want the shortlink system to integrate seamlessly with the existing admin dashboard, so that I can manage all features from a unified interface.

#### Acceptance Criteria

1. WHEN an administrator accesses the admin dashboard THEN the Shortlink System SHALL appear as a menu item in the navigation
2. WHEN an administrator creates a short URL THEN the Shortlink System SHALL use the existing authentication context to verify permissions
3. WHEN an administrator uploads a preview image THEN the Shortlink System SHALL use the existing Appwrite storage infrastructure
4. WHEN an administrator views analytics THEN the Shortlink System SHALL use consistent UI components matching the existing dashboard design
5. WHEN an administrator performs any shortlink operation THEN the Shortlink System SHALL display toast notifications using the existing toast context
