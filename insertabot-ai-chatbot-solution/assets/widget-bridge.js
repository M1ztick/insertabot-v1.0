(function () {
  'use strict';

  var script = document.currentScript;
  var tokenEndpoint = script && script.getAttribute('data-token-endpoint');
  var apiBase = script && script.getAttribute('data-api-base');

  /**
   * Validate API key format to prevent XSS
   */
  function validateApiKey(key) {
    if (!key || typeof key !== 'string') {
      return null;
    }
    // Insertabot keys start with ib_sk_ followed by hex characters
    if (!/^ib_sk_[a-zA-Z0-9_-]+$/.test(key)) {
      console.error('[Insertabot] Invalid API key format');
      return null;
    }
    return key;
  }

  /**
   * Load remote widget script with the API key passed as data-api-key
   */
  function loadRemote(apiKey) {
    try {
      var s = document.createElement('script');
      s.async = true;

      // Validate and construct the widget script URL
      var baseUrl = '';
      if (apiBase && typeof apiBase === 'string') {
        try {
          var url = new URL(apiBase);
          if (url.protocol === 'https:' || url.protocol === 'http:') {
            baseUrl = url.origin;
          }
        } catch (e) {
          console.error('[Insertabot] Invalid API base URL');
          return;
        }
      }

      if (!baseUrl) {
        console.error('[Insertabot] No valid API base URL');
        return;
      }

      s.src = baseUrl + '/widget.js';

      // Pass the API key as data-api-key so widget.js can authenticate
      if (apiKey) {
        var validKey = validateApiKey(apiKey);
        if (validKey) {
          s.setAttribute('data-api-key', validKey);
        } else {
          console.error('[Insertabot] API key validation failed, widget will not load');
          return;
        }
      } else {
        console.error('[Insertabot] No API key available, widget will not load');
        return;
      }

      s.onerror = function () {
        console.error('[Insertabot] Failed to load widget script from: ' + s.src);
      };

      document.head.appendChild(s);
    } catch (error) {
      console.error('[Insertabot] Error loading remote widget:', error);
    }
  }

  if (!tokenEndpoint) {
    console.error('[Insertabot] No token endpoint configured');
    return;
  }

  // Fetch the API key from the WordPress REST endpoint
  var fetchOptions = { credentials: 'same-origin' };
  var controller = null;
  var timeoutId = null;

  if (typeof AbortController !== 'undefined') {
    try {
      controller = new AbortController();
      fetchOptions.signal = controller.signal;
      timeoutId = setTimeout(function () {
        controller.abort();
        console.error('[Insertabot] Token request timed out');
      }, 5000);
    } catch (e) {
      // AbortController not supported, continue without timeout
    }
  }

  fetch(tokenEndpoint, fetchOptions)
    .then(function (res) {
      if (timeoutId) clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error('Token request failed with status: ' + res.status);
      }
      return res.json();
    })
    .then(function (json) {
      if (json && json.api_key) {
        loadRemote(json.api_key);
      } else {
        console.error('[Insertabot] No API key in response');
      }
    })
    .catch(function (error) {
      if (timeoutId) clearTimeout(timeoutId);
      if (error && error.name === 'AbortError') {
        console.error('[Insertabot] Token request timed out');
      } else {
        console.error('[Insertabot] Token request failed:', error && error.message ? error.message : 'Unknown error');
      }
    });
})();
