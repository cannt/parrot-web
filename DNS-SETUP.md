# GoDaddy DNS Configuration for ex0.es

## Quick Setup Guide

### Option 1: Simple Setup (Recommended)
**Frontend only on main domain**

**GoDaddy DNS Records:**
```
Type    Name    Value                    TTL
A       @       76.76.19.19             600
CNAME   www     cname.vercel-dns.com    600
```

**Result:**
- Frontend: `https://ex0.es` and `https://www.ex0.es`
- Backend: `https://your-app.railway.app` (Railway's URL)

### Option 2: Professional Setup
**Subdomain for API**

**GoDaddy DNS Records:**
```
Type    Name    Value                    TTL
A       @       76.76.19.19             600
CNAME   www     cname.vercel-dns.com    600
CNAME   api     your-app.railway.app    600
```

**Result:**
- Frontend: `https://ex0.es`
- Backend: `https://api.ex0.es`

## Step-by-Step Instructions

### 1. Access GoDaddy DNS
1. Login to GoDaddy
2. Go to "My Products"
3. Find "ex0.es" domain
4. Click "DNS" button

### 2. Add/Edit Records
1. Delete existing A records for @ and www (if any)
2. Add the records from your chosen option above
3. Save changes

### 3. Verify Setup
Wait 5-10 minutes, then test:
```bash
# Check if domain points to Vercel
dig ex0.es

# Check if subdomain points to Railway (Option 2 only)
dig api.ex0.es
```

### 4. SSL Certificates
Both Vercel and Railway automatically provide SSL certificates.
Your sites will be accessible via HTTPS immediately.

## Troubleshooting

### Domain not working?
- Wait up to 24 hours for DNS propagation
- Clear browser cache
- Try incognito/private browsing

### API calls failing?
- Check environment variables in Vercel
- Verify Railway app is running
- Check CORS settings in backend

### Need help?
Refer to the main DEPLOYMENT.md file for detailed instructions.