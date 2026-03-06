(function () {
  'use strict';

  var config = window.insertabotConfig || {};
  var tokenEndpoint = config.tokenEndpoint;
  var apiBase = config.apiBase;

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Validate the base URL received from the WordPress option.
   * Returns the normalised origin (https://...) or null on failure.
   */
  function validateApiBase(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      var url = new URL(raw);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
      return url.origin; // strip any path/query that may have crept in
    } catch (e) {
      return null;
    }
  }

  /**
   * Basic sanity-check for the worker session token format.
   * The worker issues tokens as:  wt_<48 hex chars>
   */
  function validateSessionToken(tok) {
    return typeof tok === 'string' && /^wt_[0-9a-f]{48}$/.test(tok);
  }

  /**
   * Abort-controller-aware fetch with a hard timeout.
   *
   * @param {string}   url
   * @param {object}   options  - standard fetch options
   * @param {number}   ms       - timeout in milliseconds
   * @returns {Promise<Response>}
   */
  function fetchWithTimeout(url, options, ms) {
    // Validate URL to prevent SSRF
    var validatedUrl;
    try {
      var parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
        throw new Error('Invalid URL protocol');
      }
      validatedUrl = parsedUrl.href;
    } catch (e) {
      return Promise.reject(new Error('Invalid URL: ' + e.message));
    }

    var controller = null;
    var tid        = null;
    var opts       = options || {};

    if (typeof AbortController !== 'undefined') {
      try {
        controller  = new AbortController();
        opts.signal = controller.signal;
        tid = setTimeout(function () {
          controller.abort();
        }, ms);
      } catch (e) {
        // AbortController unavailable — continue without timeout signal
      }
    }

    return fetch(validatedUrl, opts).then(function (res) {
      if (tid) clearTimeout(tid);
      return res;
    }, function (err) {
      if (tid) clearTimeout(tid);
      throw err;
    });
  }

  /**
   * Dynamically inject the remote widget script, passing the session token
   * via data-session-token (NOT data-api-key — the raw key is never exposed).
   */
  function loadWidget(sessionToken, baseUrl) {
    if (!validateSessionToken(sessionToken)) {
      console.error('[Insertabot] Session token validation failed; widget will not load.');
      return;
    }

    var s = document.createElement('script');
    s.async = true;
    s.src   = baseUrl + '/widget.js';
    s.setAttribute('data-session-token', sessionToken);
    s.setAttribute('data-api-base', baseUrl);

    s.onerror = function () {
      console.error('[Insertabot] Failed to load widget script from: ' + s.src);
    };

    document.head.appendChild(s);
  }

  // ── Guard: required attributes must be present ────────────────────────────

  if (!tokenEndpoint) {
    console.error('[Insertabot] Missing tokenEndpoint in config.');
    return;
  }

  var baseUrl = validateApiBase(apiBase);
  if (!baseUrl) {
    console.error('[Insertabot] Missing or invalid apiBase in config.');
    return;
  }

  // ── Step 1: fetch the ephemeral HMAC token from WordPress ─────────────────
  //
  // WordPress signs the token server-side using the customer's api_key as the
  // HMAC secret. The raw api_key is never sent to the browser.

  // Append a timestamp so browsers and CDN/proxy caches never serve a stale
  // token to a second visitor — each token contains a single-use nonce.
  var bustUrl = tokenEndpoint + (tokenEndpoint.indexOf('?') === -1 ? '?' : '&') + '_t=' + Date.now();
  fetchWithTimeout(bustUrl, { credentials: 'same-origin' }, 5000)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('WP token request failed: ' + res.status);
      }
      return res.json();
    })
    .then(function (json) {
      if (!json || typeof json.token !== 'string' || !json.token) {
        throw new Error('No token in WP response');
      }

      var ephemeralToken = json.token;

      // ── Step 2: exchange the ephemeral token with the Cloudflare Worker ──
      //
      // The Worker verifies the HMAC, consumes the nonce (replay protection),
      // and returns a short-lived session_token stored in KV.
      // This exchange happens entirely server-side (Worker); the raw api_key
      // is never visible to the browser at any point.

      return fetchWithTimeout(
        baseUrl + '/v1/widget-token/exchange',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token: ephemeralToken })
        },
        8000
      );
    })
    .then(function (res) {
      if (!res.ok) {
        throw new Error('Worker token exchange failed: ' + res.status);
      }
      return res.json();
    })
    .then(function (json) {
      if (!json || !json.session_token) {
        throw new Error('No session_token in exchange response');
      }

      // ── Step 3: load the widget with the session token ───────────────────
      loadWidget(json.session_token, baseUrl);
    })
    .catch(function (err) {
      var msg = (err && err.name === 'AbortError')
        ? 'Request timed out'
        : (err && err.message ? err.message : 'Unknown error');
      console.error('[Insertabot] Token exchange failed:', msg);
      console.error('[Insertabot] Debug info:', {
        tokenEndpoint: tokenEndpoint,
        apiBase: baseUrl,
        error: err
      });
    });
})();
