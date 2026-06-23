/* =========================================================================
   Plumbline v1.0 — Shared site JS
   Vanilla, no framework. Three small responsibilities:
     1) Mobile menu drawer (toggle .nav-open on body)
     2) Clerk modal trigger (open state at #?auth=open or via [data-open-auth])
     3) Pulse signal legend filter (Decisions 15 + 16)
   ========================================================================= */
(function () {
  'use strict';

  /* --- 1) Mobile menu drawer ----------------------------------------- */
  function setupMobileMenu() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var drawer = document.querySelector('[data-nav-drawer]');
    var scrim = document.querySelector('[data-nav-scrim]');
    var close = document.querySelector('[data-nav-close]');
    if (!toggle || !drawer) return;

    function open() { document.body.classList.add('nav-open'); drawer.setAttribute('aria-hidden', 'false'); }
    function shut() { document.body.classList.remove('nav-open'); drawer.setAttribute('aria-hidden', 'true'); }

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    if (scrim) scrim.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) shut();
    });
  }

  /* --- 2) Clerk modal trigger ---------------------------------------- */
  // Absolute constant path to the static HTML state that renders the auth modal.
  // v1.0 ships a static preview; Phase 4 swaps in real Clerk. The constant is
  // an absolute path under the project subdomain so it resolves correctly on
  // GitHub Pages (where root-relative paths would 404 to the host root).
  var AUTH_MODAL_URL = '/plumbline-demo/states/landing-clerk-modal.html';

  function setupAuthModal() {
    var trigger = document.querySelectorAll('[data-open-auth]');
    if (!trigger.length) return;

    trigger.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        // Static HTML state for v1.0 marketing — Phase 4 swaps in real Clerk.
        var params = window.location.search ? window.location.search : '';
        window.location.href = AUTH_MODAL_URL + params;
      });
    });
  }

  /* --- 3) Pulse signal legend + filter (Decisions 15 + 16) ----------- */
  function setupPulseFilter() {
    var root = document.querySelector('[data-pulse-filter]');
    var legend = document.querySelector('[data-pulse-legend]');
    if (!root || !legend) return;

    var pills = root.querySelectorAll('[data-axis] .pill');
    var factors = legend.querySelectorAll('.factor');
    var reset = root.querySelector('[data-reset]');

    // Parse initial state from URL query params (?strength=4-5&type=valuation)
    var params = new URLSearchParams(window.location.search);
    var state = {
      strength: params.get('strength') || 'all',
      type: params.get('type') || 'all'
    };

    function applyFilter() {
      // Active pill state
      pills.forEach(function (pill) {
        var axis = pill.getAttribute('data-axis-name');
        var value = pill.getAttribute('data-value');
        var pressed = (axis === 'strength' && state.strength === value)
                   || (axis === 'type' && state.type === value);
        pill.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });

      // Factor visibility
      factors.forEach(function (factor) {
        var factorStrength = factor.getAttribute('data-strength'); // "5","4","3","2","1"
        var factorType = factor.getAttribute('data-type');         // "valuation", "momentum", ...
        var visible = true;

        if (state.strength !== 'all') {
          var wanted = state.strength.split('-'); // e.g. "4-5" -> [4,5]
          if (wanted.length === 1) {
            visible = visible && factorStrength === wanted[0];
          } else {
            visible = visible && parseInt(factorStrength, 10) >= parseInt(wanted[0], 10)
                                && parseInt(factorStrength, 10) <= parseInt(wanted[1], 10);
          }
        }
        if (state.type !== 'all') {
          visible = visible && factorType === state.type;
        }
        // Use a class toggle for filter visibility. The matching CSS rule
        // (.pulse-legend .factor.is-filtered-out) hides the element entirely.
        factor.classList.toggle('is-filtered-out', !visible);
      });

      // Sync URL (replaceState, no scroll jump)
      var newParams = new URLSearchParams();
      if (state.strength !== 'all') newParams.set('strength', state.strength);
      if (state.type !== 'all') newParams.set('type', state.type);
      var newQs = newParams.toString();
      var newUrl = window.location.pathname + (newQs ? '?' + newQs : '') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var axis = pill.getAttribute('data-axis-name');
        var value = pill.getAttribute('data-value');
        state[axis] = value;
        applyFilter();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        state.strength = 'all';
        state.type = 'all';
        applyFilter();
      });
    }

    applyFilter();
  }

  /* --- Boot ---------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupMobileMenu();
      setupAuthModal();
      setupPulseFilter();
    });
  } else {
    setupMobileMenu();
    setupAuthModal();
    setupPulseFilter();
  }
})();