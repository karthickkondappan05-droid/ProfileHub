import { Profile } from "../types";

export interface SEOConfig {
  title?: string;
  description?: string;
  url?: string;
  canonicalUrl?: string;
  image?: string;
  ogImage?: string;
  noindex?: boolean;
  type?: string;
  profile?: Partial<Profile>;
}

export function updateMetaTags(config: SEOConfig) {
  const {
    title = "ProfileHub — Your Identity. Your Profile. Your Presence.",
    description = "Create a professional public profile, share your story, and make your digital identity easier to discover.",
    url,
    canonicalUrl = url || window.location.href,
    image,
    ogImage = image || "https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=1200&auto=format&fit=crop&q=80",
    noindex = false,
    type = "website",
    profile,
  } = config;

  // Title
  document.title = title;

  // Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement("meta");
    metaDesc.setAttribute("name", "description");
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);

  // Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement("meta");
    metaRobots.setAttribute("name", "robots");
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");

  // Canonical
  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute("href", canonicalUrl);

  // OpenGraph
  setOrCreateMeta("og:title", title, "property");
  setOrCreateMeta("og:description", description, "property");
  setOrCreateMeta("og:url", canonicalUrl, "property");
  setOrCreateMeta("og:type", profile ? "profile" : type, "property");
  setOrCreateMeta("og:image", ogImage, "property");

  // Twitter Card
  setOrCreateMeta("twitter:card", "summary_large_image", "name");
  setOrCreateMeta("twitter:title", title, "name");
  setOrCreateMeta("twitter:description", description, "name");
  setOrCreateMeta("twitter:image", ogImage, "name");
}

export const updateSeoMeta = updateMetaTags;

export function generatePersonSchema(profile: Partial<Profile>, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${canonicalUrl}#person`,
    name: profile.fullName || profile.displayName || profile.username,
    jobTitle: profile.headline || profile.profession,
    description: profile.bio,
    image: profile.avatarUrl,
    knowsAbout: profile.skills || [],
    address: profile.location
      ? {
          "@type": "PostalAddress",
          "addressLocality": profile.location,
          "addressCountry": profile.country,
        }
      : undefined,
    sameAs: Object.values(profile.socialLinks || {}).filter(Boolean),
  };
}

export function generateProfilePageSchema(profile: Partial<Profile>, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": canonicalUrl,
    url: canonicalUrl,
    name: `${profile.fullName || profile.username} | ProfileHub`,
    mainEntity: generatePersonSchema(profile, canonicalUrl),
  };
}

export function injectJsonLd(schemas: any | any[]) {
  let jsonLdScript = document.getElementById("profilehub-jsonld") as HTMLScriptElement | null;
  if (!jsonLdScript) {
    jsonLdScript = document.createElement("script");
    jsonLdScript.id = "profilehub-jsonld";
    jsonLdScript.type = "application/ld+json";
    document.head.appendChild(jsonLdScript);
  }

  const payload = Array.isArray(schemas)
    ? {
        "@context": "https://schema.org",
        "@graph": schemas,
      }
    : schemas;

  jsonLdScript.text = JSON.stringify(payload);
}

function setOrCreateMeta(key: string, value: string, attr: "name" | "property") {
  let meta = document.querySelector(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", value);
}
