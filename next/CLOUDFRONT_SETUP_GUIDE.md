# CloudFront CDN Setup Guide for S3 Assets

## Overview

This guide will help you set up Amazon CloudFront CDN to serve your S3 assets, significantly improving load times globally.

## Benefits

- **50-90% faster load times** globally
- **Edge caching** at 400+ locations worldwide
- **Lower costs** (reduced S3 egress charges)
- **Better reliability** (DDoS protection, automatic failover)
- **HTTP/2 and HTTP/3** support

## Prerequisites

- AWS Account with access to CloudFront and S3
- S3 bucket: `art-chip` in `ap-southeast-1` region
- Access to update your codebase

---

## Step 1: Configure S3 Bucket for CloudFront

### 1.1 Enable S3 Bucket for Static Website Hosting (Optional but Recommended)

1. Go to **AWS Console → S3 → art-chip bucket**
2. Go to **Properties** tab
3. Scroll to **Static website hosting**
4. Click **Edit**
5. Enable it (for CORS and public access compatibility)

### 1.2 Set Up Bucket Policy for CloudFront Access

1. Go to **Permissions** tab
2. Click **Bucket policy**
3. Add this policy (replace `YOUR-BUCKET-ARN`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::art-chip/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

**Note**: You'll get the Distribution ID after creating the CloudFront distribution in Step 2.

### 1.3 Configure CORS (If Needed)

1. Go to **Permissions** tab
2. Click **CORS**
3. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## Step 2: Create CloudFront Distribution

### 2.1 Create Distribution

1. Go to **AWS Console → CloudFront**
2. Click **Create distribution**

### 2.2 Origin Settings

- **Origin domain**: Select `art-chip.s3.ap-southeast-1.amazonaws.com`
  - Or use the S3 bucket directly: `art-chip.s3.ap-southeast-1.amazonaws.com`
- **Origin path**: Leave blank (or use `/next` if you want to serve only from that path)

- **Name**: `art-chip-s3-origin` (or any descriptive name)

- **Origin access**: Choose one:
  - **Option A (Recommended)**: Origin Access Control (OAC) - More secure
  - **Option B**: Public bucket access (simpler but less secure)

#### If using OAC (Recommended):

1. Click **Create control setting**
   - **Name**: `art-chip-oac`
   - **Signing behavior**: Sign requests (recommended)
   - **Origin type**: S3
   - Click **Create**

2. Select the created OAC in the dropdown

3. Click **Copy policy** to get the bucket policy (use it in Step 1.2)

### 2.3 Default Cache Behavior

- **Viewer protocol policy**: **Redirect HTTP to HTTPS** ✅
- **Allowed HTTP methods**: **GET, HEAD, OPTIONS**
- **Cache policy**: **CachingOptimized** (or create custom - see below)
- **Origin request policy**: **None** (or CORS-CustomOrigin for CORS)
- **Response headers policy**: **None** (or create custom for CORS headers)

#### Recommended Custom Cache Policy:

Instead of `CachingOptimized`, create a custom policy for better control:

1. Click **Create cache policy**
2. Settings:
   - **Name**: `art-chip-images-policy`
   - **TTL**:
     - **Default TTL**: `2592000` (30 days in seconds)
     - **Minimum TTL**: `86400` (1 day)
     - **Maximum TTL**: `31536000` (1 year)
   - **Cache key settings**:
     - ✅ Query strings: **None**
     - ✅ Headers: **None** (or include `Origin` if CORS is needed)
     - ✅ Cookies: **None**
3. Click **Create**

### 2.4 Distribution Settings

- **Price class**:
  - **Use all edge locations** (best performance, higher cost)
  - **Use only North America and Europe** (good balance)
  - **Use only North America** (cheapest, limited coverage)

- **Alternate domain names (CNAMEs)**:
  - Add your custom domain if you have one (e.g., `cdn.yourdomain.com`)
  - **Note**: You'll need to add SSL certificate

- **SSL certificate**:
  - **Default CloudFront certificate** (uses CloudFront domain)
  - Or **Request or Import a Certificate with ACM** (for custom domain)

- **Default root object**: Leave blank

- **Logging**: Enable if you want access logs

- **Comment**: `CDN for art-chip S3 assets`

### 2.5 Create Distribution

1. Review all settings
2. Click **Create distribution**
3. Wait 5-15 minutes for deployment
4. Note your **Distribution domain name**: `d1234abcd5678.cloudfront.net`

---

## Step 3: Configure CloudFront for Optimal Performance

### 3.1 Enable Compression

1. Go to your distribution → **Behaviors** tab
2. Click **Edit** on the default behavior
3. Scroll to **Compress objects automatically**: **Yes** ✅
4. Save changes

### 3.2 Create Behaviors for Different Asset Types (Optional but Recommended)

Create separate cache behaviors for different content types:

#### For Images (jpg, png, webp, svg):

1. Click **Create behavior**
2. **Path pattern**: `*.jpg`, `*.jpeg`, `*.png`, `*.webp`, `*.svg`, `*.gif`, `*.ico`, `*.avif`
3. **Origin**: Same S3 origin
4. **Cache policy**: Your custom `art-chip-images-policy` (30 days)
5. **Viewer protocol**: Redirect HTTP to HTTPS
6. **Compress**: Yes
7. Save

#### For Audio/Video:

1. Click **Create behavior**
2. **Path pattern**: `*.mp3`, `*.wav`, `*.mp4`, `*.webm`
3. **Origin**: Same S3 origin
4. **Cache policy**: Custom with longer TTL (60 days)
5. **Compress**: Yes (for audio)
6. Save

**Note**: Behaviors are matched in order - most specific patterns should be listed first.

### 3.3 Configure Error Pages (Optional)

1. Go to **Error pages** tab
2. Click **Create custom error response**
3. For 403/404 errors, you can redirect to a default image

---

## Step 4: Update Your Codebase

### 4.1 Create Environment Variable

Create or update `.env.local`:

```bash
NEXT_PUBLIC_CDN_URL=https://d1234abcd5678.cloudfront.net
NEXT_PUBLIC_USE_CDN=true
```

Replace `d1234abcd5678.cloudfront.net` with your actual CloudFront distribution domain.

### 4.2 Create CDN Utility

We'll create a utility to handle CDN URL conversion (see code below).

### 4.3 Update S3 URLs

Two approaches:

**Option A (Recommended)**: Update at runtime using the utility
**Option B**: Replace all S3 URLs in codebase (more work)

---

## Step 5: Testing

### 5.1 Verify CloudFront is Serving Content

```bash
# Test CloudFront URL
curl -I https://d1234abcd5678.cloudfront.net/next/icons/example.png

# Compare with S3 direct URL
curl -I https://art-chip.s3.ap-southeast-1.amazonaws.com/next/icons/example.png

# CloudFront should return faster TTFB
```

### 5.2 Test Performance

1. Open your website
2. Open DevTools → Network tab
3. Filter by images
4. Check load times - should be 50-90% faster
5. Verify cache headers are present

### 5.3 Verify Caching

```bash
# First request (cache miss)
curl -I https://d1234abcd5678.cloudfront.net/next/icons/example.png
# Should see: x-cache: Miss from cloudfront

# Second request (cache hit)
curl -I https://d1234abcd5678.cloudfront.net/next/icons/example.png
# Should see: x-cache: Hit from cloudfront
```

---

## Step 6: Update Workbox Configuration

After setting up CloudFront, update `next.config.mjs` to cache CloudFront URLs instead of direct S3 URLs.

---

## Cost Estimation

### CloudFront Pricing (as of 2024):

- **Data transfer out**:
  - First 10 TB/month: $0.085 per GB
  - Next 40 TB/month: $0.080 per GB
  - Next 100 TB/month: $0.060 per GB

- **HTTP/HTTPS requests**:
  - $0.0075 per 10,000 requests

### Savings:

- **Reduced S3 egress**: CloudFront transfer is cheaper than direct S3
- **Reduced requests**: Edge caching means fewer S3 requests
- **Estimated savings**: 20-40% compared to direct S3 access

---

## Troubleshooting

### Issue: 403 Forbidden from CloudFront

**Solution**:

- Check Origin Access Control (OAC) configuration
- Verify bucket policy allows CloudFront access
- Ensure OAC is attached to the origin

### Issue: CORS errors

**Solution**:

- Configure CORS on S3 bucket
- Create custom Response Headers Policy in CloudFront
- Add CORS headers: `Access-Control-Allow-Origin: *`

### Issue: Images not updating

**Solution**:

- Invalidate CloudFront cache: CloudFront → Invalidations → Create invalidation
- Add version query string to URLs (e.g., `?v=1.2.3`)
- Wait for cache TTL to expire

### Issue: Slow initial load

**Solution**:

- This is normal for first request (cache miss)
- Subsequent loads will be fast from edge cache
- Consider warming the cache for critical assets

---

## Next Steps

1. ✅ Complete CloudFront setup
2. ✅ Update codebase with CDN URLs
3. ✅ Test and verify performance
4. ✅ Monitor CloudFront metrics in AWS Console
5. ✅ Set up CloudWatch alarms for monitoring

---

## Quick Reference

### CloudFront Distribution Domain Format:

```
https://d1234abcd5678.cloudfront.net
```

### URL Mapping:

```
Before: https://art-chip.s3.ap-southeast-1.amazonaws.com/next/icons/logo.png
After:  https://d1234abcd5678.cloudfront.net/next/icons/logo.png
```

### Cache Invalidation:

```
CloudFront → Your Distribution → Invalidations → Create invalidation
Pattern: /next/icons/* (or specific file path)
```
