import type { KngfNote } from "@/lib/ai/schemas";

/**
 * Placeholder data for building the UI before notes are persisted.
 *
 * PRIVACY: notes are pseudonymous. We identify them by clinical topic + date,
 * never by a patient's full name (that is the whole AVG/GDPR value prop, and
 * patient management is deferred to v1.1). A clinician may type their own short
 * reference; we never store real names/DOB/BSN.
 */
export interface SampleNote {
  id: string;
  format: "kngf" | "soap";
  topic: string; // clinical subject — NOT a patient name
  snippet: string;
  when: string;
  durationMin: string;
  content: KngfNote;
}

const kneeContent: KngfNote = {
  subjectief:
    'Patiënt (54 jr) rapporteert aanhoudende pijn in de rechterknie sinds een week. Pijnscore 6/10 bij traplopen. Geen nachtelijke pijn. Ervaart een "strak gevoel" aan de achterzijde na een wandeling van >20 minuten.',
  objectief:
    "Lichte zwelling mediaal van de patella. ROM: flexie 130°, extensie 0°. Lichte instabiliteit bij valgusstress. Palpatie pijnlijk bij mediale gewrichtsspleet. Kracht m. quadriceps 4/5 t.o.v. links.",
  evaluatie:
    "Vermoeden van milde mediale meniscusirritatie en verminderde spierkracht na een periode van relatieve inactiviteit. Geen aanwijzingen voor acuut kruisbandletsel.",
  plan:
    "1. Oefentherapie gericht op versterking m. quadriceps en m. gluteus medius (3x/week). 2. Advies: wandeltijd inkorten naar max. 15 min per sessie. 3. Vervolgafspraak over een week.",
  behandeling_uitgevoerd: "Oefentherapie en uitleg over belasting/belastbaarheid.",
  vervolgafspraak: "Over 1 week.",
  rode_vlaggen: null,
  fysiotherapeutische_diagnose: null,
};

export const sampleNotes: SampleNote[] = [
  {
    id: "n_001",
    format: "kngf",
    topic: "Lage rugklachten",
    snippet:
      "Patiënt rapporteert verminderde pijn in de onderrug na de tractiebehandeling van vorige week. Mobiliteit lumbale wervelkolom verbeterd.",
    when: "Vandaag, 14:20",
    durationMin: "4:12 min",
    content: kneeContent,
  },
  {
    id: "n_002",
    format: "soap",
    topic: "Chronische schouderklachten",
    snippet:
      "Intakegesprek betreffende chronische schouderklachten. Sinds 3 maanden progressieve beperking in endorotatie. Geen uitstraling naar de vingers.",
    when: "Gisteren, 14:30",
    durationMin: "6:45 min",
    content: kneeContent,
  },
  {
    id: "n_003",
    format: "kngf",
    topic: "Post-operatieve knie",
    snippet:
      "Revalidatie na VKB-reconstructie. Krachtopbouw quadriceps verloopt volgens schema. Geen hydrops waargenomen na belasting.",
    when: "Gisteren, 09:15",
    durationMin: "3:20 min",
    content: kneeContent,
  },
  {
    id: "n_004",
    format: "kngf",
    topic: "Nekklachten / whiplash",
    snippet:
      "Controle na verkeersongeval. Bewegingsangst neemt af, ROM cervicaal verbetert. Huiswerkoefeningen worden goed uitgevoerd.",
    when: "24 okt, 13:10",
    durationMin: "5:02 min",
    content: kneeContent,
  },
];
