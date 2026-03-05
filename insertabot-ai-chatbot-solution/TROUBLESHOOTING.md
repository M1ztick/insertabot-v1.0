# Insertabot Widget Not Loading - Troubleshooting Guide

## Quick Diagnostics

1. **Add `?insertabot_debug=1` to any page URL** (admin only)
   - Shows API key status, customer ID, and configuration
   
2. **Open browser console** (F12)
   - Look for `[Insertabot]` error messages

## Common Issues

### Issue 1: Widget doesn't appear at all

**Symptoms:**
- No chat bubble on the page
- No errors in console

**Causes:**
- Plugin not enabled
- API key not set
- API key stored but encrypted value is empty

**Fix:**
1. Go to Settings → Insertabot
2. Verify "Enable Chatbot" is ON
3. Re-enter your API key and save
4. Check diagnostics with `?insertabot_debug=1`

---

### Issue 2: "Token exchange failed" in console

**Symptoms:**
```
[Insertabot] Token exchange failed: Worker token exchange failed: 401
```

**Causes:**
- API Base URL is wrong
- Customer ID not cached (using slow v1 tokens)
- HMAC signature mismatch
- API key changed but WordPress still has old encrypted value

**Fix:**
1. Verify API Base URL in Settings → Insertabot
   - Should be: `https://insertabot.io`
   - NO trailing slash
   
2. Re-save your API key:
   - Copy API key from dashboard
   - Paste in Settings → Insertabot
   - Click "Save Settings"
   - Look for success message: "API key validated and customer ID cached successfully"
   
3. If you see warning: "could not resolve customer ID"
   - Check API Base URL is correct
   - Check your Cloudflare Worker is deployed
   - Check Worker has the `/api/auth/key-info` endpoint

---

### Issue 3: "WP token request failed" in console

**Symptoms:**
```
[Insertabot] Token exchange failed: WP token request failed: 403
```

**Causes:**
- WordPress REST API is disabled
- Security plugin blocking REST API
- Nonce validation failing

**Fix:**
1. Check if REST API is accessible:
   ```
   curl https://yoursite.com/wp-json/
   ```
   
2. Temporarily disable security plugins

3. Add to wp-config.php if needed:
   ```php
   define('REST_API_ENABLED', true);
   ```

---

### Issue 4: "Origin not allowed" error

**Symptoms:**
- Widget loads but chat requests fail
- Console shows CORS errors

**Causes:**
- Domain not in allowed domains list

**Fix:**
1. Go to Insertabot Dashboard
2. Settings → Allowed Domains
3. Add your domain: `yoursite.com`
4. Or use wildcard: `*.yoursite.com`
5. Or leave blank to allow all domains

---

### Issue 5: Customer ID not cached (slow tokens)

**Symptoms:**
- Widget works but is slow
- Diagnostics shows: "⚠️ Not cached (will use slow v1 tokens)"

**Causes:**
- `/api/auth/key-info` endpoint not responding
- Network error during key save
- API Base URL incorrect

**Fix:**
1. Verify Worker is deployed and accessible:
   ```bash
   curl -X POST https://insertabot.io/api/auth/key-info \
     -H "Content-Type: application/json" \
     -d '{"api_key":"YOUR_API_KEY"}'
   ```
   
2. Should return:
   ```json
   {"customer_id":"cust_abc123..."}
   ```
   
3. If it fails, check:
   - Worker deployment status
   - API Base URL in WordPress settings
   - Cloudflare DNS/routing

4. Once fixed, re-save API key in WordPress

---

## Security Features Working Correctly

✅ **API key is NEVER exposed in:**
- HTML source code
- JavaScript files
- Browser console
- Network requests visible to users

✅ **Token flow:**
1. WordPress generates ephemeral HMAC token (server-side)
2. Bridge script fetches token via REST API
3. Token exchanged with Worker for session token
4. Session token used to load widget
5. All tokens expire in 5 minutes

---

## Still Not Working?

1. **Check Worker logs** in Cloudflare dashboard
2. **Enable WordPress debug mode:**
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```
3. **Check `/wp-content/debug.log`** for PHP errors
4. **Test with default WordPress theme** (Twenty Twenty-Four)
5. **Disable all other plugins** temporarily

---

## Contact Support

If none of these fixes work:

1. Visit https://insertabot.io
2. Use the chat widget (yes, we use our own product!)
3. Provide:
   - WordPress version
   - PHP version
   - Browser console errors
   - Diagnostic output from `?insertabot_debug=1`
