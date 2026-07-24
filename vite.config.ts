/// <reference types="vitest/config" />
import { defineConfig, type Plugin, type HtmlTagDescriptor } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import seo from "./seo.config.json";

/**
 * Injects every SEO tag from `seo.config.json` into the built index.html.
 * Change that file — not the HTML — to customise titles, Open Graph cards,
 * canonical URL, robots, and so on.
 */
function seoPlugin(): Plugin {
  return {
    name: "seo-inject",
    transformIndexHtml(html) {
      const canonical = seo.url.replace(/\/$/, "");
      const image = seo.image.startsWith("http")
        ? seo.image
        : `${canonical}${seo.image}`;

      const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({
        tag: "meta",
        attrs,
        injectTo: "head",
      });

      const tags: HtmlTagDescriptor[] = [
        { tag: "title", children: seo.title, injectTo: "head" },
        meta({ name: "description", content: seo.description }),
        meta({ name: "keywords", content: seo.keywords.join(", ") }),
        meta({ name: "author", content: seo.author }),
        meta({ name: "robots", content: seo.robots }),
        meta({ name: "theme-color", content: seo.themeColor }),
        {
          tag: "link",
          attrs: { rel: "canonical", href: canonical },
          injectTo: "head",
        },
        meta({ property: "og:type", content: "website" }),
        meta({ property: "og:site_name", content: seo.siteName }),
        meta({ property: "og:title", content: seo.title }),
        meta({ property: "og:description", content: seo.description }),
        meta({ property: "og:url", content: canonical }),
        meta({ property: "og:image", content: image }),
        meta({ property: "og:locale", content: seo.locale }),
        meta({ name: "twitter:card", content: seo.twitterCard }),
        meta({ name: "twitter:title", content: seo.title }),
        meta({ name: "twitter:description", content: seo.description }),
        meta({ name: "twitter:image", content: image }),
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: seo.siteName,
            url: canonical,
            description: seo.description,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0" },
          }),
          injectTo: "head",
        },
      ];

      return { html, tags };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: false,
    server: {
      deps: {
        // Process these through Vite so their CSS imports resolve in jsdom.
        inline: ["@xyflow/react", "@tabularis/explain"],
      },
    },
  },
});
