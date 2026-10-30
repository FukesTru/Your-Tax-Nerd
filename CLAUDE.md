# CLAUDE.md: how to work on this client's website

This repo is ONE client website built by Local Cascade. You are working with the operator, the
person who builds and edits it by asking you. Assume they are not a developer: explain in plain
words, keep replies short, and never hand them a command to run when you can run it yourself.

## What this repo is

- `public/` is the website. Vercel serves it exactly as it is. No build step, no npm, no
  framework: plain HTML, CSS and a little JavaScript. Keep it that way. `vercel.json` tells Vercel
  this (output directory `public`, no build or install command) and sets the response headers.
- `site.json` holds the business details and the site's addresses. Fill in the `business` block
  and the address fields at the start of the project. Read it first, every session.
- `BRIEF.md` is the website brief: what a site from this agency must contain, look like and never
  do. Read all of it before a first build, and re-read the relevant section before any big change.
- `tools/check.mjs` checks the site against the rules a machine can see. Run it before every ship.
- `tools/golive-check.sh` checks a live domain at go-live.

## Where the site can be seen

| Address | What shows there |
|---|---|
| `site.json` `preview_url`, e.g. `https://<project>.vercel.app` | Whatever is on `main` (the Vercel production deployment). This is the review address the agency and the client use while building |
| The Vercel preview link on a pull request, e.g. `https://<project>-git-<branch>-<team>.vercel.app` | A branch, before it is shipped. Only for the operator and the agency |
| The client's own domain | Only after go-live, below |

Every `*.vercel.app` address carries a noindex header (set in `vercel.json`), so Google never
indexes them and they never compete with the client's real domain.

## How every change works

1. Work on a branch, never directly on `main`. If your environment names the branch for you
   (Claude Code on the web uses `claude/...`), keep that name; otherwise name it for the change:
   `first-build`, `fix-header-phone`.
2. Make the change. Run `node tools/check.mjs`. Fix everything it reports as FAIL.
3. Commit and push the branch, and open a pull request into `main` titled in plain words ("First
   build: home page and design system"). Vercel builds a preview deployment for the branch and the
   Vercel bot posts its link as a comment on the pull request, usually within a minute. Give the
   operator that link. If you cannot read the comment, find the preview in the Vercel project's
   deployments list (or with the Vercel tools, if you have them); the branch address follows the
   pattern `https://<project>-git-<branch>-<team>.vercel.app`, where `<project>` is `site.json`
   `vercel_project` and `<branch>` is the branch name in lower case with every character that is
   not a letter or digit turned into `-`. Open it yourself before sending it. Tell the operator
   what changed in one or two lines and what to check, on a phone as well as a desktop.
4. When the operator says ship it (or "push it live", "merge it", "looks good, go"), merge the pull
   request into `main`. Vercel then builds the production deployment. If your environment does not
   let you merge, say so in one line and tell the operator to press the green **Merge pull
   request** button on the pull request page, then **Confirm merge**. Then open the `preview_url`
   (or the live domain after go-live) and confirm the change is actually showing before you say it
   is live. If it is not showing after three minutes, check the deployment status in Vercel and say
   so; do not say it is live.
5. Small fixes still go through a branch. It costs a minute and it is the only review step.

Never force-push `main`. Never rewrite history on `main`. If something on `main` is wrong, fix it
forward or revert the commit (`git revert`), which keeps the undo itself undoable. A bad
production deployment can also be rolled back instantly in Vercel while you fix it.

## Before the first build: gather everything

You may not be able to open the agency's CRM or project tracker. The operator can, so ask them for
what is missing, all in ONE message, naming exactly where each thing lives. Record everything in
`site.json` as it arrives. `site.json` is the CLIENT INFORMATION list from `BRIEF.md`: one place for
every fact the site uses.

1. **The three CRM pieces. Do not start building without all three.** Each is set up in your CRM
   (for example GoHighLevel) before the website is built, usually as its own task in your project
   tracker:
   - the **website form embed code**, into `integrations.form_embed`;
   - the **chat widget code** (the widget's embed script), into `integrations.chat_widget`;
   - the **review link** (the page that asks customers for a review), into
     `integrations.review_link`.

   If any of the three is missing, stop and tell the operator that piece has to be set up first.
2. **The client's onboarding answers.** If the client filled in your onboarding form, ask the
   operator for the answers (or an export) and copy them into `site.json`: `online`, `services`,
   `areas_served`, `brand.notes`, `business.website_current` and anything else that matches.
   - Answers like "na" or left blank are yours to research.
   - If the client has not filled in the form yet, tell the operator, and carry on researching
     meanwhile.
   - If an answer disagrees with another source (a different business name in the CRM or on their
     Google profile, say), put [VERIFY] on the page and name the mismatch to the operator. Never
     pick one silently.
   - `brand.notes` is the client's own words about colours and fonts ("purple, gold, white,
     grey"). Turn it into hex values for `brand` and say which you chose.
3. **Their logos and photos.** The operator adds them to the chat or uploads them (from the
   onboarding form, a shared drive link, or photos the client sends later). Pick what belongs on
   the site and copy it into `public/images/`. Keep anything that should not be published outside
   `public/`.
   - Rename each one lower case with hyphens, named for what it shows: `logo-primary.png`,
     `logo-icon.png`, `photo-front-desk.jpg`.
   - Record each one in `site.json` `images` as `{ "file": "...", "note": "..." }`. The note
     decides where the picture ends up, so make it useful: "navy blue logo on a white background",
     never "logo 2".
   - **A logo needs a transparent background.** If a logo has a white or coloured box behind it,
     remove the background before using it. If you cannot do that cleanly, tell the operator which
     file needs it. A logo with a box around it looks wrong on every coloured band of the site.
4. **How they book now.** If their current site books appointments through an outside system,
   write which one in `booking_system_current` and tell the operator to raise it with the agency
   owner. The new site never books. Whether that outside system gets a link is the agency owner's
   decision, not yours or the operator's.

Then research everything still blank (`BRIEF.md`, "First, research the business properly"). Fill
what you find into `site.json`. Anything you still cannot find stays blank in `site.json` and
appears on the page as [VERIFY]. Never guess.

## Building the site

- First build: follow `BRIEF.md` start to finish. Then build the design system, header, footer,
  mobile buttons and the whole home page first, ship that for review, and only then the other
  pages.
- **The bar: at least as good as these reference sites, ideally better.** Study them before the
  first build, on a phone and on a desktop, and hold the new site against them:
  - https://washingtonpachiro.com/ (completeness, where the call and contact buttons sit)
  - https://sparksfamilychiropractic.com/ (the look, the photography, the layout)
  - https://divine-home-care-2.vibepreview.app/ (a home care site at the standard we want)
  - https://freedom-home-care.vibepreview.app/ (a home care site at the standard we want)
  - https://www.apple.com/ (polish, white space, movement as you scroll)

  The two vibepreview sites draw their pages with JavaScript, so a plain fetch of the page shows
  almost nothing: view them in a real browser if you have one, and otherwise read their scripts
  for the copy and structure. Then open the client's current home page next to the new one: the new one must be
  plainly the better website at first sight. Take structure, standard and feel from these sites,
  never their words.
- Placeholders for a missing photo or video are marked `data-placeholder="what shot is needed"` on
  the element, so `node tools/check.mjs --missing` can list them. Never in the hero. Never a stock
  photo in its place.
- Every page gets its own title, description, canonical and Open Graph tags, written by you
  (`BRIEF.md` section 10).
- The favicon is made from the logo icon (`logo-icon.png`, or the logo if there is no icon):
  `public/favicon.png` at 512x512 and `public/apple-touch-icon.png` at 180x180, linked from every
  page's head.
- Every page is a folder with an `index.html` (`public/services/back-pain/index.html` is served at
  `/services/back-pain/`). Short lower case addresses with hyphens. `vercel.json` sets
  `trailingSlash: true`, so `/services/back-pain` redirects to `/services/back-pain/`; write every
  link and canonical with the trailing slash.
- The header and the footer are copied into every page. They sit between the markers
  `<!-- site-header:start -->` / `<!-- site-header:end -->` and
  `<!-- site-footer:start -->` / `<!-- site-footer:end -->` and must be identical on every page.
  When you change one, change all of them. `tools/check.mjs` fails if they differ.
- Shared styles in `public/assets/site.css`, shared script in `public/assets/site.js`.
- The client's photos and logos go in `public/images/`, renamed lower case with hyphens and named
  for what they show (`logo-primary.png`, `photo-front-desk.jpg`). Resize photos to at most 2000px
  wide and compress them before committing; a 6MB phone photo makes the site slow.
- The three CRM pieces in `site.json` `integrations` are used exactly as given, character for
  character. The form is the only form on the site. The chat widget loads once, site-wide. Every
  "leave us a review" link goes to the review link.
- `public/sitemap.xml` and `public/robots.txt` are kept up to date with the page list. Until
  go-live, use the `preview_url` as the base address; at go-live, switch every canonical, Open Graph
  and sitemap address to the client's `https://www.` domain.

## With every preview link: what the operator checks

You cannot see the site on a real phone. The operator can, and most of the client's customers will
only ever see the phone version. So every time you hand over a link, add the checks that apply to
what changed, as a short list. For a first build or a big change, all of them:

**On a desktop**
- The business name, address and phone number are identical on every page and match the client's
  onboarding info.
- Every picture is the client's own, never a stock photo.
- Nothing is generic. A sentence that could belong to any business in the world still needs
  changing.
- No leftover instructions or half-written sentences. Placeholders and [VERIFY] are deliberate:
  leave them.

**On a phone**
- Nothing slides sideways. Text reads without pinching. Buttons are big enough for a thumb.
- Open the menu: the phone number and the Contact us button are at the bottom of it, and the chat
  button and its pop-up message do not cover them.
- Three round buttons in one even row at the bottom: call on the left, contact in the middle, chat
  on the right. Same size, icons only, no text, no border.
- Behind those buttons the page goes softly blurred, with no hard line where the blur starts.
- The buttons never cover the last line of the page.
- Every Contact us button lands with the whole form in the middle of the screen, nothing cut off.

**Both**
- Press every button, menu item, footer link, phone number and text link. Each goes where it says.
  Anything saying Book or Schedule lands on the form or opens the phone dialler.

When the operator reports a problem, fix it on the branch, then send the new link and only the
checks that apply to the fix.

## Getting it approved, and what is missing

1. **The agency owner approves first.** When the whole site is built and the operator's checks
   pass, tell the operator to send the agency owner the `preview_url` and wait. The client sees
   nothing until the agency owner says it is approved. (If the operator is the agency owner, this
   is simply their own final review.)
2. **The missing list.** Run `node tools/check.mjs --missing`. It lists every [VERIFY] and every
   placeholder, page by page.
3. **The email to the client.** Turn that list into a short, plain email asking the client for
   exactly those items: the photos needed (say which shot) and the facts to confirm. The operator
   gets it approved by the agency owner. Only the approved version is sent, from [agency email].
   You never send anything.
4. **When the client replies**, the operator gives you their photos and answers. Put them in,
   replace the matching [VERIFY] and placeholders, run the checks, ship, and give the operator the
   link to send the client. Repeat until the client approves. Then go-live, below.

## Never

- Never a booking calendar, a payment, a table, a breadcrumb or a stock photo. `BRIEF.md` sections
  15, 16 and 18.
- Never invent a fact, a price, a review, a credential or a number. Mark it [VERIFY].
- Never an em dash or an en dash.
- Never put a password, an API key, a token or anything secret in this repo. If the operator
  pastes one into the chat, do not write it to a file, and tell them it should be changed.
- Never change `crm_location_id` or `vercel_project` in `site.json` once they are set. They tie
  the repo to the client's CRM account and Vercel project.
- Never delete this repo, rename it, or change its settings. Never delete or rename the Vercel
  project.

## Go-live: connecting the client's domain

Only when the operator says the client has approved the site and it is ready to go live.

1. Ask the operator for the client's domain if they have not given it. The site lives on the
   `www.` version (`www.theirdomain.com`), and the bare domain (`theirdomain.com`) redirects to it.
2. On a branch named `go-live`: set `site.json` `domain` to `www.theirdomain.com`, switch every
   canonical, Open Graph and sitemap address to `https://www.theirdomain.com`, run
   `node tools/check.mjs`, then ship it the usual way.
3. **Add the domain to the Vercel project** (Project Settings, Domains, or the Vercel tools if you
   have them). Add both `www.theirdomain.com` and `theirdomain.com`, set `www.theirdomain.com` as
   the primary domain, and set `theirdomain.com` to redirect to it permanently (308). Vercel then
   shows the DNS records it expects.
4. **DNS on Cloudflare.** If the domain was bought on or moved to the agency's Cloudflare account,
   make the changes there yourself (with the Cloudflare tools, or ask the operator):
   - CNAME record: name `www`, target `cname.vercel-dns.com`. If a `www` record already exists,
     change it; do not add a second one.
   - Apex: an A record, name `@` (the bare domain), value `76.76.21.21`. Alternatively, redirect
     the apex to `https://www.theirdomain.com` with a Cloudflare redirect rule; either way Vercel's
     domain settings must show both as valid.
   - Set both records to **DNS only** (grey cloud, not proxied), so Vercel can issue the SSL
     certificate. If Vercel shows different values for this project, use the ones Vercel shows.
   - Do not change or delete any other record, especially email (MX, and the TXT records that go
     with email such as SPF, DKIM and DMARC).

   If the client keeps their domain at their own registrar or DNS host, write the operator an email
   to send the client, in plain words, with exactly those record changes for whoever manages their
   domain, and one line saying: do not change or delete any other record, especially email (MX)
   records.
5. When the DNS change is made, wait until Vercel shows both domains as valid, then run
   `bash tools/golive-check.sh theirdomain.com`. All four addresses must end on
   `https://www.theirdomain.com` with a working padlock. Report each one to the operator in plain
   words. DNS can take up to a few hours to spread; if the `www` address is not working yet, say to
   try again in an hour rather than calling it broken. If only the bare domain fails, check the
   apex record and the redirect in the Vercel domain settings.
6. Tell the operator to update the client's Google Business Profile website link to
   `https://www.theirdomain.com` if it says anything else.
