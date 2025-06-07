# Selvevaluering - Digital Modenhet

Dette prosjektet er en web-applikasjon designet for å hjelpe bedrifter med å evaluere sin digitale modenhet. Basert på en serie spørsmål, gir applikasjonen en vurdering av bedriftens nåværende modenhetsnivå, en visuell fremstilling av deres profil, identifiserte forbedringsområder (gap), og skreddersydde anbefalinger for videre utvikling.

## Funksjonalitet

*   **Spørsmålsbasert Evaluering:** Brukeren svarer på en rekke spørsmål fordelt på fem kjerneområder:
    1.  Datainnsamling
    2.  Dataanalyse
    3.  Dataprosesser
    4.  Strategi
    5.  Organisasjon
*   **Dynamisk Scoring:**
    *   Beregner en totalscore basert på svaralternativer.
    *   Håndterer "Ikke relevant / Vet ikke"-svar ved å justere maksimal mulig poengsum.
    *   Intern logikk kan benytte vektede kategoriscorer for dypere analyse.
*   **Resultatvisning:**
    *   **Modenhetsnivå:** Klassifiserer bedriften i ett av fem definerte modenhetsnivåer.
    *   **Visuell Trappetrinnsmodell:** Viser bedriftens nivå grafisk.
    *   **Spindeldiagram (Radar Chart):** Viser score per kjerneområde for en detaljert profil.
    *   **Dynamiske Nivåbeskrivelser:** Gir en personlig tilpasset beskrivelse av nivået, som fremhever styrker og svakheter.
    *   **Modenhetsprofiler:** Identifiserer typiske modenhetsprofiler basert på score-mønstre (f.eks. "Silo-spesialisten", "Den forsiktige planleggeren"). *Denne funksjonen vises foreløpig i utviklerkonsollen og i en egen div på resultatsiden for testing.*
    *   **Detaljerte Kjennetegn:** Mulighet for å vise/skjule detaljerte kjennetegn for det oppnådde modenhetsnivået.
    *   **Identifiserte Forbedringsområder (Gap):** Analyserer svar for å peke på spesifikke områder hvor det er et misforhold eller forbedringspotensial.
    *   **Skreddersydde Anbefalinger:** Prioriterer og presenterer anbefalte neste steg basert på identifiserte gap og de svakeste kategoriene.
*   **Responsivt Design:** Tilpasser seg ulike skjermstørrelser.
*   **Eksternalisert Konfigurasjon:** Spørsmål, nivådefinisjoner, og annen konfigurasjon lastes fra eksterne JSON-filer for enklere vedlikehold og oppdatering.

## Teknologioversikt

*   **Frontend:** HTML, CSS, Vanilla JavaScript
*   **Diagrammer:** Chart.js (via CDN) for spindeldiagram og potensielt andre visualiseringer.
*   **Datastruktur:** JSON for eksternalisering av spørsmål, nivåer og konfigurasjon.

## Prosjektstruktur
├── index2.html // Hoved HTML-filen
├── style.css // All CSS-styling
├── script.js // All JavaScript-logikk
├── questions_no.json // Spørsmål og svaralternativer
├── levels_no.json // Definisjoner av modenhetsnivåer og anbefalinger
└── config_no.json // Generell konfigurasjon, vekter, profiler, SVG-ikoner

## Oppsett og Kjøring

1.  **Last ned filene:** Klon eller last ned alle filene i prosjektstrukturen over til en lokal mappe.
2.  **Åpne `index2.html`:** Åpne `index2.html`-filen i en moderne nettleser (Chrome, Firefox, Edge, Safari).
3.  **Ingen server nødvendig for grunnleggende funksjonalitet:** Siden applikasjonen bruker `fetch` for å laste lokale JSON-filer, kan det hende at noen nettlesere har sikkerhetsrestriksjoner (CORS policy) som forhindrer dette når man åpner `index2.html` direkte fra filsystemet (`file:///`).
    *   **Anbefalt løsning for utvikling:** Bruk en enkel lokal webserver. Mange kodeeditorer (som VS Code med "Live Server"-utvidelsen) har innebygd funksjonalitet for dette. Alternativt kan du bruke Python's `http.server` (Python 3: `python -m http.server`) eller Node.js-baserte servere som `http-server`.
    *   Start serveren i rotmappen til prosjektet og åpne den oppgitte adressen (f.eks. `http://localhost:8000`) i nettleseren.
4.  **Valgfri Node-backend:** Kjør `node server.js` for å starte en enkel server som også lagrer innsendte resultater og serverer JSON-data på `/api/*` endepunkter.
5.  **NPM-skript:** Kjør `npm install` for å installere eventuelle avhengigheter (det er ingen per nå). Start serveren med `npm start` og kjør testene med `npm test`.

## Fremtidig Utvikling (Fase 3 og utover)

Planen for videre utvikling inkluderer:

*   **Pilot-testing og Ekspertvalidering:**
    *   Teste applikasjonen med reelle bedrifter og sammenligne med ekspertvurderinger for å validere og forbedre modellen.
*   **Forbedret UI for Modenhetsprofiler:** Designe og implementere en mer brukervennlig visning av identifiserte modenhetsprofiler direkte på resultatsiden.
*   **Avansert Vekting:** Potensielt justere hvordan vektede scorer påvirker den endelige nivåklassifiseringen, etter grundig analyse og validering.
*   **Utvidet Spørsmålsbank:** Legge til flere spørsmål eller kategorier for enda dypere innsikt, basert på tilbakemeldinger.
*   **Lagring og Sammenligning (Krever Backend):**
    *   Mulighet for brukere å lagre resultatene sine (anonymt eller med bruker).
    *   Mulighet for benchmarking mot bransje eller andre bedrifter (krever datainnsamling og backend).
---
*   **Rapportering:** Generere en nedlastbar PDF-rapport av resultatene.

## Bidrag

Forslag til forbedringer og bidrag er velkomne. Vennligst opprett en "issue" for å diskutere endringer eller rapportere feil.
