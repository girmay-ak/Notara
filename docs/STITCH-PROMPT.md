# Stitch AI — UX Design Prompt for Notara v1

Copy-paste prompts for **Stitch** (stitch.withgoogle.com) to design Notara's v1
UX. Built from `docs/V1-REQUIREMENTS.md` (v1.0 scope: notes-only history, **no
patients yet**, card-free 14-day trial). NL is the primary UI language — Dutch
labels are given; keep them as-is.

> **How to use:** paste the **App context** + **Style** blocks first, then
> generate each screen with its block. Notara is **responsive web, mobile-first** —
> ask Stitch for mobile and desktop frames of each screen.

---

## App context (paste first)

> Design **Notara**, a mobile-first responsive web app that lets European
> physiotherapists turn a 60–90 second spoken voice memo into a structured,
> ready-to-paste clinical note (Dutch "KNGF/SOEP" or English "SOAP" format). The
> user records audio, AI transcribes and structures it, and the user copies the
> result into their existing electronic patient record (EPD). The core value is
> **speed and trust**: less evening typing, a note they can trust at a glance.
> Audience: busy solo allied-health clinicians, ages 25–60, on phone and laptop.
> Tone: calm, clinical, trustworthy, modern, uncluttered. Primary UI language is
> **Dutch**. Privacy matters — surface "EU-hosted, audio deleted after
> transcription" as trust signals.

## Style (paste second)

> **Brand:** forest green primary `#1F4D3D` (buttons, logo, active states); a
> lighter green `#2E7D58` for accents; warm amber `#D9A441` for trial/upgrade
> highlights; neutral grays for text and borders; white/very-light-green
> surfaces. Support a dark mode.
> **Type:** Inter for all UI; a serif (Source Serif) only for big marketing
> headlines. Body text 16px, note content 18px for readability.
> **Shape & feel:** rounded corners (12–16px), soft shadows, generous spacing,
> clear card-based layout. Lucide-style line icons. Big touch targets (≥44px).
> The recording microphone button is the visual hero: a large circular green
> button (96px on mobile).
> **Layout:** mobile = single column with a bottom tab bar (Dashboard, Opnemen,
> Notities, Instellingen). Desktop = left sidebar (240px) + main content.

---

## Screens

### 1. Landing page (marketing, public)
> A marketing landing page for Notara. Hero: serif headline **"Klaar met avonden
> typen?"**, subtext **"Notara verandert een voicememo van 60 seconden in een
> KNGF-conforme behandelnotitie. Plak hem in je EPD en je bent klaar."**, primary
> button **"Begin gratis — geen creditcard"**, secondary "Bekijk demo". A calm
> hero illustration of voice → document. Then a 3-step "Hoe werkt het?" section
> (1. Spreek 60s in · 2. AI maakt je SOEP-notitie · 3. Kopieer naar je EPD), each
> with an icon. A "Veilig & AVG-proof" trust section (EU-hosting, audio binnen 60s
> gewist, verwerkersovereenkomst). A pricing section: one card **"€29/maand of
> €249/jaar"** with feature bullets and a CTA. A short FAQ accordion. Footer with
> links (Privacy, Voorwaarden, Verwerkersovereenkomst). Clean, lots of whitespace.

### 2. Sign up
> A centered signup card. Fields: **E-mailadres**, **Wachtwoord** (helper: "min.
> 10 tekens"), **Beroep** (dropdown: Fysiotherapeut, Psycholoog, Huisarts, Coach,
> Anders), **Voorkeurstaal** (Nederlands/English). Primary button **"Account
> aanmaken"**. Below: "Al een account? Inloggen". A small reassurance line: "14
> dagen gratis · geen creditcard nodig". Minimal, trustworthy.

### 3. Log in
> A centered login card. Fields **E-mailadres**, **Wachtwoord**. Primary button
> **"Inloggen"**. Links: "Wachtwoord vergeten?" and "Nog geen account?
> Registreren". Optional "Stuur een magische link" secondary option.

### 4. Email verification notice
> A simple centered confirmation screen after signup: a mail icon, heading **"Check
> je e-mail"**, text "We hebben een bevestigingslink gestuurd naar je e-mailadres.
> Klik erop om je account te activeren." and a "Mail opnieuw versturen" link.

### 5. Dashboard (app home)
> The logged-in home. Top: a time-based greeting **"Goedemiddag, {voornaam}"** and
> a small amber **trial badge** ("Nog 11 dagen in je proefperiode"). A prominent
> primary card/CTA **"Nieuwe notitie opnemen"** with a mic icon. Below: a "Recente
> notities" list (last 5) — each row shows note format tag (SOEP/SOAP), a snippet,
> date/time, and a copy icon. Mobile shows the bottom tab bar; desktop shows the
> sidebar. Calm, focused.

### 6. Record — idle
> The recording screen, idle state. Centered: heading **"Spreek je notitie in"**,
> subtext "Tik op de knop. Spreek 60–90 seconden. We doen de rest." A large green
> circular microphone button in the center. Above it, two small toggles: note
> format (**SOEP** ↔ **SOAP**) and language (**NL** ↔ **EN**). A subtle hint about
> speaking clearly. Minimal — the mic button dominates.

### 7. Record — recording
> The active recording state. The mic button is now a pulsing red/green recording
> indicator with a **live audio waveform** animation, a running timer **"00:42"**,
> and a **"Stop"** button. A small "Annuleren" option. Reassuring, focused, no
> clutter.

### 8. Record — processing
> The processing state after stopping. A 4-step progress indicator showing:
> **Uploaden → Transcriberen → Notitie schrijven → Klaar**, with the current step
> highlighted and a calm loading animation. Text: "Een momentje, je notitie wordt
> gemaakt…". No way to interact except wait.

### 9. Result — the generated note (most important screen)
> The result screen showing a finished structured note. Header: **"SOEP-notitie ·
> 29 mei 14:30"**. A prominent but friendly **amber info banner**: "Controleer de
> notitie voordat je hem in je EPD opslaat." A big primary button **"Kopieer alles"**
> at the top. Then the note as a stack of labeled section cards — for SOEP:
> **Subjectief, Objectief, Evaluatie, Plan, Behandeling uitgevoerd, Vervolgafspraak,
> Rode vlaggen, Fysiotherapeutische diagnose** — each card has the text, is
> **editable in place**, and has a small per-section **"Kopieer"** icon. Empty
> fields are hidden. Bottom actions: **"Opnieuw opnemen"** and **"Opslaan"**.
> Readable 18px text. This screen must feel clean and skimmable.

### 10. Notes list (history)
> A list of all the user's notes. Top: a search field and filter chips (by date,
> by format SOEP/SOAP). Each list item: format tag, first-line snippet, relative
> date ("2 uur geleden"), and a copy icon. Pagination or infinite scroll. Include
> an **empty state**: a friendly line-art illustration with "Nog geen notities —
> Maak je eerste notitie" and a CTA.

### 11. Note detail
> A single saved note, read view, same section-card layout as the result screen,
> with "Kopieer alles" and per-section copy. A small note that notes become
> read-only 24h after creation. Back button to the list.

### 12. Settings — profile & preferences
> A settings screen with sections: **Profiel** (Naam, Beroep, Praktijknaam),
> **Voorkeuren** (Voorkeurstaal NL/EN, Standaard notitieformaat SOEP/SOAP, Donkere
> modus toggle), and **Account** (Wachtwoord wijzigen). Simple form rows with save.

### 13. Settings — billing
> A billing screen. Shows current status card: **"Proefperiode — nog 11 dagen"**
> (amber) OR **"Actief abonnement"** (green). A pricing toggle Maandelijks (€29) /
> Jaarlijks (€249, "bespaar €99") with an **"Upgrade nu"** primary button. For
> active users: "Beheer abonnement" (opens billing portal) and invoice history.

### 14. Settings — data & privacy
> A data/privacy screen (GDPR). Buttons: **"Exporteer mijn gegevens"** (downloads a
> ZIP) and a danger-zone **"Verwijder account"** (red) with a warning that all data
> is deleted within 30 days. A short privacy reassurance paragraph.

### 15. Trial-ended / upgrade gate
> A full-screen upgrade prompt shown when the trial expired. Friendly heading **"Je
> proefperiode is voorbij"**, subtext "Upgrade om door te gaan met notities maken.
> Je bestaande notities blijven beschikbaar." The pricing card and **"Upgrade nu"**
> button. Not aggressive — calm and respectful.

### 16. Error states (set)
> Design a few inline error states as cards/alerts with a red icon, a clear title,
> a human message, and a "Probeer opnieuw" button. Examples: microphone denied
> ("Microfoontoegang geweigerd — sta hem toe in je browser-instellingen"),
> transcription failed ("Transcriberen mislukt"), and offline ("Geen
> internetverbinding"). Calm, not alarming.

---

## Notes for the designer (constraints that shape UX)
- **The copy-to-clipboard action is the product's core** — make copy buttons
  obvious and satisfying (with a "Gekopieerd" confirmation toast).
- **No patient management in v1** — do not design patient lists/profiles.
- **Trust is a feature** — keep EU/privacy reassurance visible but not noisy.
- **Mobile-first** — the record + result flow must be excellent one-handed on a
  phone; desktop is the comfortable second.
- Keep everything in **Dutch**; an EN mirror exists but design in NL.
