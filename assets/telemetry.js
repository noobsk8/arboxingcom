(function () {
  "use strict";

  const APP_ID = "989FD1F8-1036-48DD-991A-6BE578E1F6BE";
  const NAMESPACE = "com.rudeus";
  const INGEST_URL = `https://nom.telemetrydeck.com/v2/namespace/${NAMESPACE}/`;
  const SIGNAL_PREFIX = "ar_boxing_web.";
  const ATTRIBUTION_KEY = "ar_boxing_web_attribution_v1";
  const CLIENT_KEY = "ar_boxing_web_client_v1";
  const DEFAULT_APP_STORE_URL = "";
  const DEFAULT_APP_STORE_DESTINATION = "#pricing";

  const CAMPAIGNS = {
    "/tiktok": {
      source: "tiktok",
      medium: "organic_social",
      campaign: "launch",
      content: "founder_account",
      traffic_type: "organic_social",
      platform: "tiktok",
      creator_id: "",
      apple_campaign_key: "tiktok_organic",
      app_store_url: ""
    },
    "/instagram": {
      source: "instagram",
      medium: "organic_social",
      campaign: "launch",
      content: "founder_account",
      traffic_type: "organic_social",
      platform: "instagram",
      creator_id: "",
      apple_campaign_key: "instagram_organic",
      app_store_url: ""
    },
    "/youtube": {
      source: "youtube",
      medium: "organic_social",
      campaign: "launch",
      content: "founder_account",
      traffic_type: "organic_social",
      platform: "youtube",
      creator_id: "",
      apple_campaign_key: "youtube_organic",
      app_store_url: ""
    },
    "/mikeboxing": {
      source: "tiktok",
      medium: "ugc",
      campaign: "launch",
      content: "mikeboxing",
      traffic_type: "ugc",
      platform: "tiktok",
      creator_id: "mikeboxing",
      apple_campaign_key: "creator_mike",
      app_store_url: ""
    },
    "/combo": {
      source: "shortcut",
      medium: "direct",
      campaign: "launch",
      content: "combo",
      traffic_type: "direct",
      platform: "unknown",
      creator_id: "",
      apple_campaign_key: "shortcut_combo",
      app_store_url: ""
    },
    "/timer": {
      source: "shortcut",
      medium: "direct",
      campaign: "launch",
      content: "timer",
      traffic_type: "direct",
      platform: "unknown",
      creator_id: "",
      apple_campaign_key: "shortcut_timer",
      app_store_url: ""
    },
    "/workout": {
      source: "shortcut",
      medium: "direct",
      campaign: "launch",
      content: "workout",
      traffic_type: "direct",
      platform: "unknown",
      creator_id: "",
      apple_campaign_key: "shortcut_workout",
      app_store_url: ""
    }
  };

  const DEFAULT_ATTRIBUTION = {
    landing_path: "/",
    source: "direct",
    medium: "direct",
    campaign: "none",
    content: "none",
    traffic_type: "direct",
    platform: "direct",
    creator_id: "",
    apple_campaign_key: "none",
    app_store_url: ""
  };

  const SAFE_VALUE = /^[a-z0-9][a-z0-9_.-]{0,79}$/i;
  let activeAttribution = null;

  function normalizePath(path) {
    const cleanPath = typeof path === "string" && path ? path : "/";
    const trimmed = cleanPath.split("?")[0].split("#")[0].replace(/\/+$/, "");
    return trimmed || "/";
  }

  function cleanValue(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }

    const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_").slice(0, 80);
    return SAFE_VALUE.test(cleaned) ? cleaned : fallback;
  }

  function readParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams();
    }
  }

  function getReferrerDomain() {
    if (!document.referrer) {
      return "";
    }

    try {
      return new URL(document.referrer).hostname.replace(/^www\./, "").toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function isSameSiteReferrer(domain) {
    return Boolean(domain && domain === window.location.hostname.replace(/^www\./, "").toLowerCase());
  }

  function referrerAttribution(domain) {
    if (!domain || isSameSiteReferrer(domain)) {
      return null;
    }

    if (domain.includes("tiktok")) {
      return { source: "tiktok", medium: "organic_social", traffic_type: "organic_social", platform: "tiktok" };
    }
    if (domain.includes("instagram")) {
      return { source: "instagram", medium: "organic_social", traffic_type: "organic_social", platform: "instagram" };
    }
    if (domain.includes("youtube") || domain.includes("youtu.be")) {
      return { source: "youtube", medium: "organic_social", traffic_type: "organic_social", platform: "youtube" };
    }
    if (domain.includes("reddit")) {
      return { source: "reddit", medium: "organic_social", traffic_type: "organic_social", platform: "reddit" };
    }
    if (domain.includes("google")) {
      return { source: "google", medium: "organic_search", traffic_type: "search", platform: "google" };
    }
    if (domain.includes("facebook") || domain.includes("fb.") || domain.includes("messenger")) {
      return { source: "meta", medium: "organic_social", traffic_type: "organic_social", platform: "meta" };
    }

    return { source: "referral", medium: "referral", traffic_type: "referral", platform: "unknown" };
  }

  function campaignFromSlug(path) {
    const slug = path.replace(/^\//, "");
    if (!/^[a-z0-9][a-z0-9_-]{1,39}$/i.test(slug)) {
      return null;
    }

    return {
      source: "unknown",
      medium: "ugc",
      campaign: "launch",
      content: cleanValue(slug, "unknown_creator"),
      traffic_type: "ugc",
      platform: "unknown",
      creator_id: cleanValue(slug, ""),
      apple_campaign_key: "none",
      app_store_url: ""
    };
  }

  function hasUtm(params) {
    return Boolean(params.get("utm_source") || params.get("utm_medium") || params.get("utm_campaign") || params.get("utm_content"));
  }

  function attributionFromUtm(params) {
    const source = cleanValue(params.get("utm_source"), "unknown");
    const medium = cleanValue(params.get("utm_medium"), "unknown");
    let trafficType = "unknown";
    let platform = source;

    if (medium.includes("paid")) {
      trafficType = "paid_social";
    } else if (medium.includes("social")) {
      trafficType = "organic_social";
    } else if (medium.includes("search") || source === "google") {
      trafficType = "search";
    } else if (medium === "email" || medium === "newsletter") {
      trafficType = "referral";
    }

    if (!["tiktok", "instagram", "youtube", "reddit", "google", "meta", "apple_search_ads"].includes(platform)) {
      platform = "unknown";
    }

    return {
      source,
      medium,
      campaign: cleanValue(params.get("utm_campaign"), "none"),
      content: cleanValue(params.get("utm_content"), "none"),
      traffic_type: trafficType,
      platform,
      creator_id: "",
      apple_campaign_key: "none",
      app_store_url: ""
    };
  }

  function getDeviceType() {
    const ua = navigator.userAgent || "";
    const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    if (/ipad|tablet/i.test(ua) || (coarsePointer && Math.min(window.innerWidth, window.innerHeight) >= 768)) {
      return "tablet";
    }
    if (/iphone|ipod|android.*mobile|mobile/i.test(ua) || coarsePointer) {
      return "mobile";
    }
    return "desktop";
  }

  function readStoredAttribution() {
    try {
      return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function storeAttribution(attribution) {
    try {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    } catch (error) {
      // Analytics should never interfere with page behavior.
    }
  }

  function resolveAttribution() {
    if (activeAttribution) {
      return activeAttribution;
    }

    const params = readParams();
    const referrerDomain = getReferrerDomain();
    const currentPath = normalizePath(window.location.pathname);
    const landingPath = normalizePath(params.get("campaign_path") || currentPath);
    const stored = readStoredAttribution();
    let attribution = null;

    if (CAMPAIGNS[landingPath]) {
      attribution = CAMPAIGNS[landingPath];
    } else if (params.get("campaign_path")) {
      attribution = campaignFromSlug(landingPath);
    }

    if (!attribution && hasUtm(params)) {
      attribution = attributionFromUtm(params);
    }

    if (!attribution) {
      const referral = referrerAttribution(referrerDomain);
      if (referral) {
        attribution = {
          ...DEFAULT_ATTRIBUTION,
          ...referral,
          campaign: "none",
          content: "none"
        };
      }
    }

    if (!attribution && stored) {
      activeAttribution = {
        ...DEFAULT_ATTRIBUTION,
        ...stored,
        referrer_domain: !isSameSiteReferrer(referrerDomain) && referrerDomain ? referrerDomain : stored.referrer_domain || ""
      };
      return activeAttribution;
    }

    activeAttribution = {
      ...DEFAULT_ATTRIBUTION,
      ...(attribution || {}),
      landing_path: attribution ? landingPath : DEFAULT_ATTRIBUTION.landing_path,
      referrer_domain: !isSameSiteReferrer(referrerDomain) ? referrerDomain : ""
    };

    storeAttribution(activeAttribution);
    return activeAttribution;
  }

  function getClientState() {
    try {
      const stored = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || "null");
      if (stored && stored.clientUser && stored.sessionID) {
        return stored;
      }
    } catch (error) {
      // Fall through to a fresh session identifier.
    }

    const browserCrypto = window.crypto || window.msCrypto;
    const randomId = function (prefix) {
      if (browserCrypto && browserCrypto.randomUUID) {
        return browserCrypto.randomUUID();
      }
      return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    const fresh = {
      clientUser: randomId("web"),
      sessionID: randomId("session")
    };

    try {
      sessionStorage.setItem(CLIENT_KEY, JSON.stringify(fresh));
    } catch (error) {
      // Non-fatal: the event can still be sent for this page.
    }

    return fresh;
  }

  function commonPayload(extra) {
    const attribution = resolveAttribution();
    return {
      page: document.documentElement.dataset.page || "home",
      landing_path: attribution.landing_path,
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      content: attribution.content,
      traffic_type: attribution.traffic_type,
      platform: attribution.platform,
      referrer_domain: attribution.referrer_domain || "",
      device_type: getDeviceType(),
      ...extra
    };
  }

  function attributionPayload(extra) {
    const attribution = resolveAttribution();
    return {
      page: document.documentElement.dataset.page || "home",
      landing_path: attribution.landing_path,
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      content: attribution.content,
      traffic_type: attribution.traffic_type,
      platform: attribution.platform,
      creator_id: attribution.creator_id || "",
      referrer_domain: attribution.referrer_domain || "",
      device_type: getDeviceType(),
      ...extra
    };
  }

  function isLocalTestMode() {
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(window.location.hostname);
  }

  function sendSignal(name, payload) {
    const client = getClientState();
    const body = JSON.stringify([
      {
        appID: APP_ID,
        clientUser: client.clientUser,
        sessionID: client.sessionID,
        type: SIGNAL_PREFIX + name,
        isTestMode: isLocalTestMode(),
        payload
      }
    ]);

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(INGEST_URL, blob)) {
          return;
        }
      }

      fetch(INGEST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(function () {});
    } catch (error) {
      // Telemetry failure should never affect the site.
    }
  }

  function resolveAppStoreTarget() {
    const attribution = resolveAttribution();
    const campaignUrl = attribution.app_store_url || "";
    const url = campaignUrl || DEFAULT_APP_STORE_URL || DEFAULT_APP_STORE_DESTINATION;

    return {
      url,
      destination: url.startsWith("http") ? "app_store" : "app_store_pending",
      apple_campaign_key: attribution.apple_campaign_key || "none"
    };
  }

  function trackPageViewed() {
    sendSignal("page_viewed", commonPayload({}));
  }

  function setupEngagedVisit() {
    let fired = false;
    let timeoutId = null;

    function fire(trigger) {
      if (fired) {
        return;
      }

      fired = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("scroll", handleScroll);

      sendSignal(
        "engaged_visit",
        attributionPayload({
          engagement_trigger: trigger
        })
      );
    }

    function getScrollDepth() {
      const doc = document.documentElement;
      const body = document.body;
      const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
      const viewportHeight = window.innerHeight || doc.clientHeight || 0;
      const scrollHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        doc.clientHeight,
        doc.scrollHeight,
        doc.offsetHeight
      );

      if (scrollHeight <= viewportHeight) {
        return 0;
      }

      return (scrollTop + viewportHeight) / scrollHeight;
    }

    function handleScroll() {
      if (getScrollDepth() >= 0.5) {
        fire("scroll_50");
      }
    }

    timeoutId = window.setTimeout(function () {
      fire("time_15s");
    }, 15000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  function setupPricingViewed() {
    const pricing = document.getElementById("pricing");
    if (!pricing || !("IntersectionObserver" in window)) {
      return;
    }

    let fired = false;
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!fired && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            fired = true;
            observer.disconnect();
            sendSignal("pricing_viewed", commonPayload({}));
          }
        });
      },
      { threshold: [0.5] }
    );

    observer.observe(pricing);
  }

  function setupAppStoreCtas() {
    document.querySelectorAll("[data-app-store-cta]").forEach(function (cta) {
      cta.addEventListener("click", function (event) {
        const target = resolveAppStoreTarget();
        const ctaLocation = cleanValue(cta.getAttribute("data-cta-location"), "unknown");

        sendSignal(
          "app_store_clicked",
          commonPayload({
            cta_location: ctaLocation,
            destination: target.destination,
            creator_id: resolveAttribution().creator_id || "",
            apple_campaign_key: target.apple_campaign_key
          })
        );

        if (target.url !== cta.getAttribute("href")) {
          event.preventDefault();
          window.location.href = target.url;
        }
      });
    });
  }

  function setupWaitlistCtas() {
    document.querySelectorAll("[data-waitlist-cta]").forEach(function (cta) {
      cta.addEventListener("click", function () {
        sendSignal(
          "waitlist_cta_clicked",
          attributionPayload({
            waitlist_location: cleanValue(cta.getAttribute("data-waitlist-location"), "unknown"),
            destination: "waitlist_form"
          })
        );
      });
    });
  }

  function setupSeoLinks() {
    document.querySelectorAll("[data-seo-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        sendSignal(
          "seo_link_clicked",
          attributionPayload({
            link_location: cleanValue(link.getAttribute("data-seo-location"), "unknown"),
            link_target: cleanValue(link.getAttribute("data-seo-target"), "unknown")
          })
        );
      });
    });
  }

  function setupComboGeneratorEvents() {
    document.querySelectorAll("[data-combo-generator]").forEach(function (tool) {
      const generateButton = tool.querySelector("[data-generate-combo]");
      const lengthInput = tool.querySelector("[data-combo-length]");
      const focusInput = tool.querySelector("[data-combo-focus]");
      const defenseInput = tool.querySelector("[data-combo-defense]");

      if (!generateButton || !lengthInput || !focusInput || !defenseInput) {
        return;
      }

      generateButton.addEventListener("click", function () {
        sendSignal(
          "combo_generated",
          attributionPayload({
            combo_length: cleanValue(lengthInput.value, "unknown"),
            combo_focus: cleanValue(focusInput.value, "unknown"),
            includes_defense: defenseInput.checked ? "true" : "false"
          })
        );
      });
    });
  }

  function fillWaitlistAttribution(form) {
    const payload = attributionPayload({});
    form.querySelectorAll("[data-attribution-field]").forEach(function (field) {
      const key = field.getAttribute("data-attribution-field");
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        field.value = payload[key];
      }
    });
  }

  function setupWaitlistForms() {
    document.querySelectorAll("[data-waitlist-form]").forEach(function (form) {
      const status = form.querySelector("[data-waitlist-status]");
      const button = form.querySelector("button[type='submit']");

      fillWaitlistAttribution(form);

      form.addEventListener("submit", function (event) {
        if (!window.fetch || !window.FormData) {
          sendSignal(
            "waitlist_submitted",
            attributionPayload({
              waitlist_location: cleanValue(form.getAttribute("data-waitlist-location"), "unknown"),
              destination: "formspree"
            })
          );
          return;
        }

        event.preventDefault();
        fillWaitlistAttribution(form);

        if (button) {
          button.disabled = true;
          button.textContent = "Joining...";
        }
        if (status) {
          status.textContent = "Joining the waitlist...";
        }

        fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Waitlist submit failed");
            }

            sendSignal(
              "waitlist_submitted",
              attributionPayload({
                waitlist_location: cleanValue(form.getAttribute("data-waitlist-location"), "unknown"),
                destination: "formspree"
              })
            );

            form.reset();
            fillWaitlistAttribution(form);
            if (status) {
              status.textContent = "You're on the waitlist. I'll send launch updates when AR Boxing is ready.";
            }
          })
          .catch(function () {
            if (status) {
              status.textContent = "That did not go through. Please try again in a moment.";
            }
          })
          .finally(function () {
            if (button) {
              button.disabled = false;
              button.textContent = "Join Waitlist";
            }
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    resolveAttribution();
    trackPageViewed();
    setupEngagedVisit();
    setupPricingViewed();
    setupAppStoreCtas();
    setupWaitlistCtas();
    setupSeoLinks();
    setupComboGeneratorEvents();
    setupWaitlistForms();
  });
})();
