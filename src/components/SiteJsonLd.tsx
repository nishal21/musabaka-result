import { SITE, siteUrl } from "@/lib/site";

/** JSON-LD for search + answer engines (AEO). */
export function SiteJsonLd() {
  const url = siteUrl();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE.name,
        alternateName: ["SKJMCC MUSABAQA", "مسابقة", "Musabaqa Results"],
        description: SITE.description,
        inLanguage: ["en", "ar", "ml"],
        publisher: { "@id": `${url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/results`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: SITE.org,
        alternateName: "SKJMCC",
        url,
        logo: `${url}/logo.png`,
        image: `${url}${SITE.ogImage.path}`,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Kerala",
          containedInPlace: { "@type": "Country", name: "India" },
        },
        sameAs: [SITE.author.url],
      },
      {
        "@type": "WebApplication",
        "@id": `${url}/#app`,
        name: SITE.name,
        url,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description: SITE.description,
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        author: {
          "@type": "Person",
          name: SITE.author.name,
          url: SITE.author.url,
        },
        screenshot: `${url}${SITE.ogImage.path}`,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is SKJMCC Musabaqa?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "SKJMCC Musabaqa is the Islamic arts and literature festival of Samastha Kerala Jam'iyyathul Muallimeen Central Council. This site is the judging and official results portal for competition items.",
            },
          },
          {
            "@type": "Question",
            name: "Where can I see Musabaqa results?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Published placements are listed at ${url}/results. Open an item to see who placed; marks stay private.`,
            },
          },
          {
            "@type": "Question",
            name: "Who built this Musabaqa results site?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Built by ${SITE.author.name}. Source and profile: ${SITE.author.url}.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
