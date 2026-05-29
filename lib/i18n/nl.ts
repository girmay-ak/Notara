/**
 * Dutch UI copy (primary language). All user-facing strings live here — never
 * hardcode copy in components. An `en.ts` mirror follows when EN ships.
 */
export const nl = {
  brand: { name: "Notara", tagline: "Clinical Assistant" },

  nav: {
    dashboard: "Dashboard",
    record: "Opnemen",
    notes: "Notities",
    settings: "Instellingen",
    newNote: "Nieuwe notitie",
  },

  marketing: {
    nav: { how: "Hoe werkt het?", security: "Veiligheid", pricing: "Tarieven", start: "Start gratis" },
    hero: {
      title: "Klaar met avonden typen?",
      subtitle:
        "Notara verandert een voicememo van 60 seconden in een KNGF-conforme behandelnotitie. Plak hem in je EPD en je bent klaar.",
      ctaPrimary: "Begin gratis — geen creditcard",
      ctaSecondary: "Bekijk demo",
    },
    how: {
      title: "Hoe werkt het?",
      subtitle: "In drie eenvoudige stappen van je stem naar verslag.",
      steps: [
        { title: "1. Spreek 60s in", body: "Vertel na de behandeling kort je belangrijkste bevindingen. Notara luistert mee." },
        { title: "2. AI maakt je SOEP", body: "Onze AI structureert je verhaal direct naar een professionele SOEP-notitie." },
        { title: "3. Kopieer & klaar", body: "Klik op kopiëren en plak de tekst direct in je EPD-systeem." },
      ],
    },
    security: {
      title: "Veilig & AVG-proof",
      items: [
        { title: "EU-hosting", body: "Al je gegevens blijven binnen de Europese Unie." },
        { title: "Audio direct gewist", body: "Audio-opnames worden direct na transcriptie permanent verwijderd." },
        { title: "Verwerkersovereenkomst", body: "Standaard klaar om te tekenen aan als je je praktijk aansluit." },
      ],
    },
    pricing: {
      title: "Eén simpel tarief",
      subtitle: "Geen vage bundels, gewoon onbeperkt gemak.",
      badge: "Meest gekozen",
      price: "€249",
      period: "/jaar",
      alt: "Of €29 per maand",
      features: ["Onbeperkt notities maken", "KNGF / SOEP & SOAP", "Veilig & AVG-proof", "Geen verborgen kosten"],
      cta: "Start gratis proefperiode",
      footnote: "14 dagen gratis, daarna pas betalen.",
    },
    faq: {
      title: "Veelgestelde vragen",
      items: [
        { q: "Is mijn data veilig?", a: "Ja. Al je gegevens worden binnen de EU verwerkt en audio wordt direct na transcriptie verwijderd." },
        { q: "Werkt het met mijn EPD?", a: "Notara werkt met elk EPD: je kopieert de notitie en plakt hem in je eigen systeem." },
        { q: "Moet ik een contract tekenen?", a: "Nee. Je proeft 14 dagen gratis en kunt maandelijks opzeggen." },
      ],
    },
    footer: {
      tagline: "De slimme assistent voor zorgprofessionals.",
      links: { privacy: "Privacy", terms: "Voorwaarden", dpa: "Verwerkersovereenkomst" },
    },
  },

  dashboard: {
    greetingMorning: "Goedemorgen",
    greetingAfternoon: "Goedemiddag",
    greetingEvening: "Goedenavond",
    greetingLate: "Nog laat aan het werk",
    welcome: "Welkom terug bij je klinisch dashboard.",
    quickStart: "Snel starten",
    quickTitle: "Klaar voor een nieuwe sessie?",
    quickBody: "Notara luistert mee en zet je gesproken samenvatting direct om in een gestructureerde SOEP-notitie.",
    quickCta: "Begin nu",
    thisWeek: "Deze week",
    notesUnit: "notities",
    recent: "Recente notities",
    viewAll: "Bekijk alle",
    trialStatus: "Proefperiode",
    trialDaysLeft: (n: number) => `Nog ${n} dagen`,
  },

  record: {
    title: "Spreek je notitie in",
    subtitle: "Tik op de knop. Spreek 60–90 seconden. We doen de rest.",
    format: "Formaat",
    language: "Taal",
    privacy: "Privacy: audio wordt direct na transcriptie gewist",
    start: "Start opname",
    stop: "Stop",
    cancel: "Annuleren",
  },

  notes: {
    title: "Notities",
    subtitle: "Beheer en bekijk al je eerdere verslagen.",
    search: "Zoek op trefwoord…",
    filterAll: "Alle notities",
    filterDate: "Datum",
    sortNewest: "Nieuwste eerst",
    empty: "Nog geen notities",
    emptyBody: "Maak je eerste notitie om hem hier terug te zien.",
    emptyCta: "Nieuwe notitie",
  },

  note: {
    verifyBanner:
      "Controleer de notitie voordat je hem in je EPD plakt. AI kan fouten maken.",
    copyAll: "Kopieer alles",
    copy: "Kopieer",
    copied: "Gekopieerd",
    copiedAll: "Gekopieerd naar klembord",
    reRecord: "Opnieuw opnemen",
    save: "Opslaan",
  },

  common: {
    relativeHoursAgo: (n: number) => `${n} uur geleden`,
    yesterday: "Gisteren",
    today: "Vandaag",
  },
} as const;

export type Nl = typeof nl;
