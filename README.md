# Client website template

A starting point for one client website built by Local Cascade. Each client gets their own copy
of this repo on GitHub, deployed by Vercel from the `main` branch.

Open the client's copy in Claude Code and say what you want. Claude reads `CLAUDE.md`, works on a
branch, opens a pull request, gives you the Vercel preview link, and puts it live when you say
"ship it". The review address is the `preview_url` in `site.json` (`https://<project>.vercel.app`)
until the client's own domain is connected at go-live.

To start a new client: copy this template into a new repo, import that repo into Vercel as a new
project (no framework, no build command, output directory `public`; `vercel.json` already sets
this), and fill in `vercel_project` and `preview_url` in `site.json`.

Do not edit this template to fix one client's site; fix it in that client's repo.

## This repo: Your Tax Nerd (The Tax Nerd, LLC), Dover, NJ

First full build from the onboarding form, 21 pages. Business facts live in `site.json`; what the
client still has to send or confirm is in `VERIFY.md` (written so it can be emailed as is).

- Hosting: built for Cloudflare Pages (project `yourtaxnerd`, no build command, output directory
  `public`, preview `https://yourtaxnerd.pages.dev`). `public/_headers` keeps the preview out of
  search engines. `vercel.json` is kept from the template in case the site moves to Vercel.
- The form and the chat are the CRM (LeadConnector) embeds from `site.json` `integrations`, used
  character for character: the form inside every page's contact section, the chat widget once per
  page inside the footer markers. The call and contact round buttons on phones are sized and placed
  to match the CRM chat button (58px, 20px from the bottom), sit above its greeting layer, and hide
  while the chat window is open.
- The look is a facelift of the client's earlier site, as the client asked: its blue header and yellow
  buttons, Montserrat and Plus Jakarta Sans, light blue bands, navy testimonial band with its gold
  ornament, service cards with a blue icon tab and yellow bar, FAQ pills, and the cartoon tax nerd
  logo (`images/logo-primary.png`; the favicon is its mascot). Its stock photos, generated city
  background and unverified numbers are deliberately not reused.
- The home page opens with an intro panel (as on the Valezar site): the light-background logo
  (`images/logo-wordmark.png`) settles in on white, a yellow rule draws, the panel lifts away, then the
  hero plays (the header logo pops in, the headline words rise in). A tap, scroll or key press skips it.
- The home hero uses the earlier site's photos of Mike: the wide office photo on screens 960px and wider,
  the tall portrait on phones, each at its full size so it stays sharp. A higher resolution original from
  the client would make it sharper still on large retina screens.
- Under the home hero, the earlier site's About band is back: Mike's portrait, the appointment options,
  2 badges and the 4 numbers (999+ clients, 1,200+ returns, 10+ years, 98% retention) counting up. The
  numbers come from the earlier site and are not confirmed: the client must confirm them (VERIFY.md
  item 3) before go-live. They are in `public/index.html` (`data-count`) and `site.json` `stats_home`.
- Scroll motion on every page: heading blocks build line by line, lists and grids rise one item after
  another, Mike's portrait is revealed with a wipe, the ornament draws out, the rating counts up, and the
  home hero photo drifts as the page scrolls. It plays on every visit to the home
  page, never blocks a tap, and is off when a visitor's device asks for reduced motion.
- Reviews: the 3 Google reviews (5.0 rating, checked October 30, 2026) are on the home page and
  `/reviews/`, word for word. Add new reviews there, and update the rating and count, when they
  arrive. "Leave us a Google review" links go to Google's write-a-review page until the CRM review
  link is set in `site.json` `integrations.review_link`; then switch every one of them to it.

### At go-live

1. Replace `public/robots.txt` with the launch version written inside it (it blocks all crawlers
   until then), and delete `public/_headers`.
2. Canonicals and the sitemap already use `https://www.yourtaxnerd.com/`.
3. Point the second domain the client owns, `yourtaxnerds.com`, at the site as a permanent
   redirect to `https://www.yourtaxnerd.com/`.
