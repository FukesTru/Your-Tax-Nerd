# Build a complete law-firm website from the attached client CSV

You are building one finished client website for Local Cascade. The working directory is the
Local Cascade site template (it contains `CLAUDE.md`, `BRIEF.md`, `site.json`, `public/` and
`tools/check.mjs`). If those files are not in the working directory, stop and say so.
The client's details are in the attached client CSV: an onboarding form export with a header
row and one row per client (use the last filled row). Map its columns as follows; if a column is
missing, renamed or extra, work out its meaning from its name and contents and map it the same way.

| CSV column | Goes to |
|---|---|
| Legal Business Name | `business.legal_name` (footer copyright, terms, privacy) |
| DBA / Brand Name (if different) | `business.name` and `known_as`; if blank, use the legal name minus "PLLC/LLC/Inc" |
| Owner / Contact Name | the lead attorney's name (About page, hero, schema) |
| Business Phone Number (Used for Website) | `business.phone`, formatted (XXX) XXX-XXXX |
| Cell Phone Number (Used For Lead Notifications) | NOT published. Show a "Text us" link only if the website phone itself is stated to accept texts |
| Business Email Address (Used for website) | `business.email` |
| Business Address | split into street, city, state, postal_code |
| Website Domain You Want to Use | `domain` as `www.` lower case; Cloudflare project name = domain without www and TLD, dots to hyphens; `preview_url` = `https://<project>.pages.dev` |
| Existing Website URL | `business.website_current` (facts only, never copy its wording) |
| Google Business Profile Link, Facebook Page URL, Instagram Handle, Any Other Social Media | `online.*` and footer social links (only real profile URLs; skip long search-result links) |
| All Services You Offer | `services` = practice areas, one page each |
| ALL Cities & Towns You Serve | `areas_served`, one page each (fix obvious misspellings, note them in VERIFY.md) |
| Primary City & State | the city named in the hero, titles and schema; also `business.timezone` |
| Business Logo Format, Brand Colors, Brand Fonts | `brand` (turn colour words into hex values and say which); `brand.notes` |
| Photo/Video Content, Google Drive link for other Assets | record in `site.json`; use only image files actually present in this folder |
| Any special requests ... notes | follow them unless they break the rules below; `must_keep` |
| Timestamp, EIN, Domain Provider Login, Driver's License, Google Business Profile Status | IGNORE. Never copy logins, passwords, ID numbers or licence photos into any file or reply |

Facts the form does not ask for (hours, attorney bio, bar admissions, years licensed, fee terms,
reviews, results, state disclaimer, form or chat embed code) come only from extra CSV columns or
image files in this folder. If absent: hours become "Call us any time to set up a consultation",
the bio stays short and factual, fees describe only the free consultation if stated, reviews and
results sections are left out, and the built-in form and chat are used. List each gap in VERIFY.md.
Work through every step below without stopping to ask questions.

## 0. Read first
1. Read the CSV, `BRIEF.md`, `CLAUDE.md`, `site.json` and `tools/check.mjs` in full.
2. These overrides beat `CLAUDE.md`: hosting is **Cloudflare Pages**, not Vercel. Do not create
   branches, commit, push, open pull requests or deploy. Build the files only.
3. Never invent a fact: no names, credentials, years, numbers, awards, reviews, results, prices
   or addresses that are not in the CSV. Where the page truly needs a missing fact, write the
   neutral version without it and add a line to `VERIFY.md`.

## 1. Fill `site.json`
Map the CSV into `site.json` as in the table above. Brand defaults if blank: main `#14213D`, accent
`#B8875A`, others `#F7F3EC; #3E5C58`, fonts Source Serif 4 (headings) + Inter (body). Leave
`vercel_project` and `crm_location_id` empty. Copy any logo or photo files present in this folder into
`public/images/` with lower-case hyphenated names and list them in `site.json` `images` with an
honest note of what each shows.

## 2. Pages to build (every page is `public/<path>/index.html`, links end in `/`)
- `/` home: hero (h1 with practice + city, phone and contact buttons, the attorney photo or the
  logo-led design if no photo), practice-area cards, "what happens after you call", why this
  attorney, situations we see most, testimonials (only if the CSV supplies real reviews approved for use), areas served,
  FAQ, closing call to action with the contact form.
- `/about/`: each attorney from the CSV (bio, bar admissions, education, years only as given),
  how the firm works, call to action.
- `/fees/`: how payment works, using only fee terms the CSV states. If none, explain the consultation
  and say fees are discussed up front; add to `VERIFY.md`.
- `/contact/`: phone, text, email, address with a Google Maps link (no API key), hours, towns
  served, the contact form.
- `/practice-areas/` overview + one page per practice area.
- `/areas-we-serve/` overview + one page per town in the CSV's served-towns list.
- `/privacy/`, `/terms/`, and `404.html`, written for this firm and its state.
Each practice-area page: hero h1, what to do first, how the firm helps, case types within it,
how the state's law works for it (statute of limitations, fault/no-fault, etc. stated
cautiously, add each legal figure to `VERIFY.md` for attorney review), fees, 4-6 FAQs,
links to related practice areas, call to action.
Each town page: hero h1 naming the town, cases handled there, real local context (main roads,
courthouse/county, distance or drive to the office, how meetings work for that town), FAQs,
nearby towns linking to their pages, call to action. Every practice-area and town page must be
genuinely different: different facts, examples, headings and order of emphasis. No spun copy;
if two pages would read alike, rewrite one. Do not invent local statistics or crash numbers.

## 3. Site-wide parts (identical on every page, between the template's markers)
- Header: logo (SVG or PNG with transparent background; if none supplied, build a clean
  typographic wordmark in HTML/CSS or a simple SVG mark in the brand colours), menu with
  Practice areas and Areas we serve dropdowns listing every page, About, Fees, Contact, phone.
  Mobile menu holds the same links plus phone and Contact us at the bottom.
- Footer: firm name, address, phone, email, text link if given, every town, every practice
  area, firm links, social links given in the CSV, copyright with legal_name, Privacy and
  Terms, and the disclaimer (section 4).
- Mobile: three equal round icon buttons fixed at the bottom (call left, contact middle, chat
  right) over a soft blur, never covering content. Desktop: phone always visible in the header.
- Chat: if the CSV supplies chat widget code, load it once per page exactly as given. Otherwise a built-in
  chat pop-up (firm name, hours line, Call and Contact buttons). It sends nothing anywhere.
- Contact form: the CSV's form embed code if given, otherwise the built-in form (name, phone, email, what
  happened, consent line, "not legal advice / no attorney-client relationship" note). Never a
  booking calendar, date picker or payment.
- Favicon `public/favicon.png` 512x512 and `public/apple-touch-icon.png` 180x180 from the logo
  icon; `public/og-image.png` 1200x630 in the brand style. Link all from every head.
- Each page: unique title (max 60 chars), meta description, canonical, Open Graph tags,
  exactly one h1, LegalService/Attorney JSON-LD with only CSV facts, FAQPage JSON-LD where
  there are FAQs.
- `public/_headers` with `/*` -> `X-Robots-Tag: noindex, nofollow`; `robots.txt` disallowing all
  until launch; `sitemap.xml` listing every page. Canonicals use `https://<domain>/` if domain
  is set, else the pages.dev preview URL.

## 4. Attorney advertising rules (hard)
- Never "expert", "specialist", "specialized" or "certified" unless the CSV names a real certification.
- No guarantees or implied outcomes ("we will win", "maximum compensation", "get you paid").
- No reviews, testimonials, results, ratings, awards or "years of experience" unless in the CSV.
  If the CSV does not supply real reviews or results approved for use, leave those sections out entirely; do not
  write placeholder reviews. Any results shown carry "Prior results do not guarantee a similar
  outcome." Reviews are shown word for word with the name as given.
- Footer on every page: "Attorney advertising." + any state disclaimer the CSV gives, otherwise "This
  website is for general information and is not legal advice. Contacting us does not create an
  attorney-client relationship. Prior results do not guarantee a similar outcome." Name the
  lead attorney (Owner / Contact Name) as responsible for the content.
- No fake urgency, no client photos or names that are not real, no stock photo presented as the
  attorney or office.

## 5. Finished look
Match the template's `BRIEF.md` standard: calm, premium, plenty of white space, design system
in CSS variables, mobile-first, varied section layouts so pages do not look templated, subtle
scroll motion that respects reduced motion. Plain HTML/CSS/JS in `public/assets/` only, no
framework, no build step, no npm packages. It must look like a real live firm site: no "demo",
"lorem", "sample", "[VERIFY]", "TBD" or placeholder boxes anywhere in `public/`. Where a photo is
missing, design the section without one (colour bands, typography, icons); never a grey box.
Accessibility: semantic landmarks, skip link, alt text on every image, visible focus, 4.5:1
contrast, labelled form fields, menus usable by keyboard. No em or en dashes anywhere.

## 6. Check and finish
1. Run `node tools/check.mjs`; fix every FAIL and rerun until it reports 0 to fix. The only
   acceptable WARNs are empty CRM integrations.
2. Search `public/` for: demo, lorem, placeholder, VERIFY, TODO, expert, specialist,
   guarantee, —, –. Fix every hit that breaks the rules above.
3. Check every internal link and image path resolves to a file in `public/`.
4. Write `VERIFY.md`: a short, plain checklist with two parts: (a) needed info the CSV did not
   give (e.g. bar admissions, hours, fee terms, photos, logo) and (b) every fact the client must
   confirm (anything inferred, any CSV column you were unsure how to map, every legal figure, local claims, hours, bios), grouped by page, written so it can
   be emailed to the client as is.
5. Reply with a summary: pages built (count and list), what came from the CSV vs. defaults,
   sections left out and why, check results, and the `VERIFY.md` item count.
