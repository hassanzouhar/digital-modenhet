# Produktkravdokument (PRD) - Digital Modenhet Selvevalueringsverktøy

## Dokumentinformasjon
- **Versjon:** 1.0
- **Dato:** 19.05.2025
- **Status:** Utkast

## 1. Produktoversikt
### 1.1 Formål
Digital Modenhet er et selvevalueringsverktøy designet for å hjelpe bedrifter med å vurdere og forbedre sin digitale modenhet. Verktøyet tilbyr en strukturert evaluering basert på fem kjerneområder, med påfølgende analyse og handlingsanbefalinger. Formålet er å gi bedrifter innsikt i hvor de står på sin digitaliseringsreise og gi konkrete anbefalinger om neste steg.

### 1.2 Målgruppe
- **Primær:** Norske bedrifter som ønsker å evaluere sin digitale modenhet
- **Sekundær:** Konsulenter og rådgivere som bistår bedrifter med digital transformasjon
- **Tertiær:** Utdanningsinstitusjoner og forskningsmiljøer innen digitalisering

### 1.3 Kjerneområder
Verktøyet evaluerer digital modenhet gjennom fem definerte kjerneområder:
1. **Datainnsamling:** Hvordan bedriften samler, organiserer og lagrer data
2. **Dataanalyse:** I hvilken grad bedriften bruker og analyserer data for innsikt
3. **Dataprosesser:** Hvordan bedriftens prosesser er digitalisert og automatisert
4. **Strategi:** Om bedriften har en klar digital strategi og visjon
5. **Organisasjon:** Organisasjonens kompetanse og kultur for digital endring

## 2. Nåværende Funksjonalitet
### 2.1 Evalueringssystem
#### 2.1.1 Spørsmålsbasert Evaluering
- **Strukturerte spørsmål:** Evalueringen består av en rekke spørsmål fordelt på de fem kjerneområdene
- **Fleksibelt oppsett:** Spørsmål og svaralternativer lagres i ekstern JSON-fil for enkel oppdatering
- **Svaralternativer:** Hvert spørsmål har 5 graderte svaralternativer samt "Ikke relevant / Vet ikke"-opsjon
- **Adaptiv evaluering:** Håndterer "Ikke relevant / Vet ikke"-svar ved å justere maksimal mulig poengsum

#### 2.1.2 Scoringsmekanisme
- **Vektet kategoriscore:** Systemet benytter konfigurerbar vekting av kategorier basert på følgende logikk:
  - Standard vekting: Datainnsamling (1.0), Dataanalyse (1.2), Dataprosesser (1.0), Strategi (1.5), Organisasjon (1.3)
  - Vektingen kan slås av/på via "enableCategoryWeighting"-parameter i konfigurasjonsfilen
  - Standardvekt for nye kategorier defineres via "defaultCategoryWeight"
- **Total modenhetsscore:** Beregner en totalskår basert på vektede kategoriscorer
- **Justeringsmekanismer:** Ved "Ikke relevant / Vet ikke"-svar justeres maksimal mulig poengsum for å unngå skjevheter

### 2.2 Visualiseringer
- **Trappetrinnsmodell:** Visuell fremstilling av bedriftens modenhetsnivå (5 nivåer)
- **Spindeldiagram (Radar Chart):** Viser score per kjerneområde for detaljert profil
- **Dynamiske nivåbeskrivelser:** Personlig tilpasset beskrivelse av oppnådd nivå
- **Modenhetsprofiler:** Identifiserer typiske modenhetsprofiler basert på scoremønstre, inkludert:
  - "Silo-spesialisten"
  - "Den forsiktige planleggeren"
  - "Teknologi-optimisten"
  - "Den velbalanserte utvikleren"

### 2.3 Analyse og Anbefalinger
- **Gap-analyse:** Identifiserer misforhold mellom nåværende tilstand og ønsket nivå
- **Skreddersydde anbefalinger:** Prioriterer og presenterer anbefalte neste steg basert på identifiserte gap
- **Profilbaserte styrker og svakheter:** Gir innsikt basert på identifisert modenhetsprofil
- **Visuell fremheving:** Bruker ikoner for å tydeliggjøre gap og anbefalinger

## 3. Tekniske Spesifikasjoner
### 3.1 Arkitektur
- **Frontend:**
  - HTML5 for struktur
  - CSS3 for design og responsivitet
  - Vanilla JavaScript for logikk og interaktivitet
- **Visualisering:**
  - Chart.js (via CDN) for spindeldiagram og andre visualiseringer
- **Datastruktur:**
  - JSON for eksternalisering av spørsmål, nivåer og konfigurasjon

### 3.2 Systemkrav
- **Nettleserstøtte:**
  - Chrome (nyeste og -1)
  - Firefox (nyeste og -1)
  - Edge (nyeste og -1)
  - Safari (nyeste og -1)
- **Responsivt design:**
  - Mobiltelefoner (min. 320px bredde)
  - Nettbrett (min. 768px bredde)
  - Desktop (min. 1024px bredde)
- **Kjøring:**
  - Kan kjøres lokalt uten server
  - Alternativt: Enkel lokal webserver ved utvikling (f.eks. VS Code Live Server)

### 3.3 Datahåndtering
- **JSON-konfigurasjon:**
  - Spørsmål og svaralternativer (questions_no.json)
  - Nivådefinisjoner og anbefalinger (levels_no.json)
  - Generell konfigurasjon, vekter, profiler (config_no.json)
- **Dynamisk lastning:**
  - Konfigurasjonsfiler lastes dynamisk ved oppstart
  - Ingen serverside dataprosessering nødvendig
- **Modularitet:**
  - Konfigurasjonsfilene kan oppdateres uavhengig av hovedkoden

## 4. Fremtidige Krav (Fase 3)
### 4.1 Funksjonelle Krav
- **Pilottesting og ekspertvalidering:**
  - Funksjonalitet for å sammenligne selvevaluering med ekspertvurdering
  - Kalibrering av modellen basert på faktiske brukerdata
  - Tilbakemeldingsmekanisme for kontinuerlig forbedring
- **Utvidet spørsmålsbank:**
  - Flere og mer spesifikke spørsmål innen hvert kjerneområde
  - Bransjespesifikke spørsmålssett
  - Mulighet for å velge detaljnivå på evalueringen
- **Forbedret UI for modenhetsprofiler:**
  - Visuell fremstilling av profiler på resultatsiden
  - Detaljert beskrivelse av hver profiltype
  - Sammenligning med andre typiske profiler
- **Avansert vektingssystem:**
  - Dynamisk vekting basert på bransje og bedriftsstørrelse
  - Mulighet for brukerdefinert vekting
  - Historisk sammenligning av vektingseffekter

### 4.2 Backend-integrasjon
- **Brukerautentisering og datalagring:**
  - Brukerkontoer med unike profiler
  - Sikker lagring av evalueringsresultater
  - Historikk for å spore forbedring over tid
- **Bransjesammenligning og benchmarking:**
  - Anonymisert sammenligning med lignende bedrifter
  - Bransjespesifikke benchmarks
  - Trendanalyse innen ulike sektorer
- **PDF-rapportgenerering:**
  - Eksport av resultater til profesjonell PDF-rapport
  - Konfigurerbare rapportmaler
  - Mulighet for å inkludere/ekskludere seksjoner

## 5. Ikke-funksjonelle Krav
### 5.1 Ytelse
- **Lastetid:**
  - Initial lastning av applikasjon < 3 sekunder på standard bredbånd
  - Spørsmålsnavigering < 0,5 sekunder responstid
  - Resultatgenerering < 2 sekunder
- **Responsivitet:**
  - Brukergrensesnitt uten merkbar forsinkelse
  - Smooth transitions mellom skjermbilder
  - Optimalisert for touch-enheter
- **Dataeffektivitet:**
  - Optimalisert JSON-struktur for rask parsing
  - Lazy loading av ressurser når relevant
  - Minimerte HTTP-requests

### 5.2 Sikkerhet
- **Databehandling:**
  - Lokal databehandling uten ekstern lagring i nåværende versjon
  - Ingen personidentifiserbare data lagres
  - Transparens rundt databruk
- **GDPR-kompatibilitet:**
  - Tydelig informasjon om databehandling
  - Designet for samsvar med personvernforordningen
  - Dataminimering som prinsipp
- **Dataeksport:**
  - Sikker nedlasting av resultater
  - Kryptering av data ved fremtidig backend-integrasjon
  - Kontrollert tilgang til benchmarkdata

### 5.3 Vedlikehold
- **Dokumentasjon:**
  - Fullstendig teknisk dokumentasjon av kodebase
  - Oppdatert README med installasjon- og kjøringsinstruksjoner
  - JSDoc-kommentarer i koden
- **Modularitet:**
  - Klar separasjon mellom presentasjonslag og logikk
  - Konfigurasjon adskilt fra applikasjonskode
  - Gjenbrukbare komponenter
- **Versjonering:**
  - Semantisk versjonering (MAJOR.MINOR.PATCH)
  - Changelog for alle endringer
  - Git-basert versjoneringsstrategi

### 5.4 Tilgjengelighet
- **Standarder:**
  - WCAG 2.1 AA-kompatibilitet
  - Skjermleseradaptert UI
  - Tastaturnavigasjon
- **Språk:**
  - Norsk bokmål som standardspråk
  - Tilrettelagt for fremtidig flerspråksstøtte
  - Konsistent terminologi

## 6. Suksesskriterier
### 6.1 KPIer
- **Bruksstatistikk:**
  - Minst 100 gjennomførte evalueringer innen 3 måneder etter lansering
  - Gjennomføringsgrad > 90% (andel som fullfører hele evalueringen)
  - Gjennomsnittlig tid brukt på evaluering < 20 minutter
- **Brukertilfredshet:**
  - NPS (Net Promoter Score) > 30
  - Tilfredshetsscore > 4/5 i brukerundersøkelser
  - Kvalitative tilbakemeldinger som bekrefter verdi
- **Forretningsverdi:**
  - Konverteringsrate til betalende kunder ved fremtidig kommersialisering
  - Antall tilbakevendende brukere
  - Inngåtte samarbeidsavtaler med konsulentselskaper

### 6.2 Valideringskriterier
- **Nøyaktighet:**
  - > 80% samsvar mellom selvevaluering og ekspertvurdering
  - Konsistente resultater ved gjentatte evalueringer
  - Lave avvik i test-retest-scenarioer
- **Anbefalingskvalitet:**
  - Relevans av anbefalinger bekreftet av eksperter
  - Implementerbarhet av anbefalte tiltak
  - Målbar forbedring hos bedrifter som følger anbefalingene
- **Bransjerelevans:**
  - Positive evalueringer fra ulike bransjer
  - Dekning av bransjespesifikke utfordringer
  - Skalerbarhet fra små til store bedrifter

## 7. Vedlegg
### 7.1 Tekniske Diagrammer
- **Arkitekturdiagram:** Viser samspill mellom frontend-komponenter
- **Dataflytdiagram:** Illustrerer hvordan data beveger seg gjennom systemet
- **UI-komponentbibliotek:** Dokumentasjon av alle UI-komponenter og tilstander

### 7.2 Konfigurasjonsspesifikasjoner
- **JSON-strukturer:** Detaljert dokumentasjon av alle konfigurasjonsfiler
- **Vektingsregler:** Matematiske formler og logikk for scoringsberegning
- **Profildefinisjoner:** Kriterier for hver modenhetsprofil og beslutningslogikk

### 7.3 Utviklingsplan
- **Prioritert backlog:** Rangerte fremtidige funksjoner
- **Milepæler:** Tidslinje for fase 3-implementasjon
- **Ressurskrav:** Estimert utvikling- og testinnsats

