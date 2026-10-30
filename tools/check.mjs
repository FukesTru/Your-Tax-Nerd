#!/usr/bin/env node
// Checks the site in public/ against the Local Cascade website brief's rules a machine can see.
// Run before every ship:  node tools/check.mjs
// FAIL lines must be fixed. WARN lines are for the operator to know about. Exits 1 on any FAIL.
// node tools/check.mjs --missing lists every [VERIFY] and placeholder, page by page, for the
// email asking the client for what is missing.
// The judgement half (is the copy good, does the phone view work) is still yours: BRIEF.md.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'public');
const fails = [];
const warns = [];
const fail = (where, msg) => fails.push(`FAIL  ${where}: ${msg}`);
const warn = (where, msg) => warns.push(`WARN  ${where}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const MISSING = process.argv.includes('--missing');
const files = walk(PUB);
const pages = files.filter((f) => f.endsWith('.html'));
const rel = (f) => relative(PUB, f).split(sep).join('/');
const urlPath = (f) => '/' + rel(f).replace(/index\.html$/, '').replace(/\.html$/, '');

let site = {};
try {
  site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));
} catch (e) {
  fail('site.json', `cannot be read as JSON (${e.message})`);
}
const domain = (site.domain || '').trim();
if (domain && !/^www\.[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
  fail('site.json', `domain is "${domain}". It must be the www address in lower case, like www.theirdomain.com`);
}

// The three CRM pieces (your CRM's form embed, chat widget and review link, e.g. GoHighLevel).
const integrations = (site && typeof site.integrations === 'object' && site.integrations) || {};
const formEmbed = String(integrations.form_embed || '').trim();
const chatWidget = String(integrations.chat_widget || '').trim();
const reviewLink = String(integrations.review_link || '').trim();
for (const [key, val] of [['form_embed', formEmbed], ['chat_widget', chatWidget], ['review_link', reviewLink]]) {
  if (!val) warn('site.json', `integrations.${key} is empty. Get it from the CRM before the first build`);
}

const DASHES = /[–—]/;
const BOOKING_OR_PAYMENT = /(calendly|acuityscheduling|squareup|square\.site|setmore|\/widget\/booking|\/widget\/appointment|\/widget\/bookings|stripe\.com|paypal\.com|\/checkout)/i;
const BLOCK = (name, html) => {
  const m = html.match(new RegExp(`<!-- site-${name}:start -->([\\s\\S]*?)<!-- site-${name}:end -->`));
  return m ? m[1].trim() : null;
};

const missingList = [];
let headerRef = null;
let footerRef = null;
const sitemap = existsSync(join(PUB, 'sitemap.xml')) ? readFileSync(join(PUB, 'sitemap.xml'), 'utf8') : '';
const sitemapHasEntries = /<loc>/.test(sitemap);

for (const f of pages) {
  const where = rel(f);
  const html = readFileSync(f, 'utf8');
  const is404 = where === '404.html';
  const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);

  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) fail(where, 'no page title');
  else if (title.trim().length > 60) fail(where, `page title is ${title.trim().length} characters, the limit is 60`);

  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || [])[1];
  if (!desc) fail(where, 'no meta description');
  else if (!noindex && (desc.length < 140 || desc.length > 158)) {
    warn(where, `meta description is ${desc.length} characters, the brief asks for 140 to 158`);
  }

  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) fail(where, `${h1s} main headings (h1), there must be exactly 1`);

  if (/<table[\s>]/i.test(html)) fail(where, 'contains a table. No tables anywhere: use cards or label and value pairs');
  if (DASHES.test(html)) fail(where, 'contains an em dash or en dash. Use a period, comma or parentheses');
  if (/breadcrumb/i.test(html)) fail(where, 'contains a breadcrumb. The header menu is the only navigation');

  for (const m of html.matchAll(/\b(?:src|href|action)=["']([^"']+)["']/gi)) {
    if (BOOKING_OR_PAYMENT.test(m[1])) fail(where, `links or embeds ${m[1]}. The site never books and never takes payment`);
  }
  if (/<input[^>]+type=["'](date|time|datetime-local)["']/i.test(html)) {
    fail(where, 'has a date or time picker. The site never books');
  }

  if (!is404 && !noindex) {
    const canon = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1];
    if (!canon) fail(where, 'no canonical address');
    else if (domain && !canon.startsWith(`https://${domain}/`)) {
      fail(where, `canonical is ${canon} but site.json domain is ${domain}. At go-live every canonical uses https://${domain}/`);
    }
    if (!/<meta[^>]+property=["']og:title["']/i.test(html)) warn(where, 'no Open Graph title');
    if (sitemapHasEntries && !sitemap.includes(`${urlPath(f)}</loc>`)) warn(where, `not listed in sitemap.xml (${urlPath(f)})`);
  }

  if (!is404 && !noindex) {
    if (chatWidget && !html.includes(chatWidget)) {
      fail(where, 'the chat widget from site.json integrations.chat_widget is missing or altered. It loads once, site-wide, exactly as given');
    } else if (chatWidget && html.split(chatWidget).length > 2) {
      fail(where, 'the chat widget code appears more than once. It loads once per page');
    }
    if (formEmbed && !html.includes(formEmbed)) {
      warn(where, 'the form from site.json integrations.form_embed is not on this page exactly as given. Every page needs the form');
    }
    if (reviewLink) {
      for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        if (/review/i.test(m[2].replace(/<[^>]+>/g, '')) && /leave|write|post/i.test(m[2]) && m[1] !== reviewLink) {
          fail(where, `a "leave us a review" link goes to ${m[1]}, not to site.json integrations.review_link`);
        }
      }
    }
  }

  const header = BLOCK('header', html);
  const footer = BLOCK('footer', html);
  if (header === null) fail(where, 'missing the <!-- site-header:start --> / <!-- site-header:end --> markers');
  if (footer === null) fail(where, 'missing the <!-- site-footer:start --> / <!-- site-footer:end --> markers');
  if (header !== null) {
    if (headerRef === null) headerRef = { where, header };
    else if (header !== headerRef.header) fail(where, `header differs from the one on ${headerRef.where}. It must be identical on every page`);
  }
  if (footer !== null) {
    if (footerRef === null) footerRef = { where, footer };
    else if (footer !== footerRef.footer) fail(where, `footer differs from the one on ${footerRef.where}. It must be identical on every page`);
  }

  const verify = (html.match(/\[VERIFY\]/g) || []).length;
  if (verify) warn(where, `${verify} [VERIFY] marker(s) still on the page, for the client to confirm`);
  const placeholders = [...html.matchAll(/data-placeholder=["']([^"']+)["']/gi)].map((m) => m[1]);
  if (placeholders.length) warn(where, `${placeholders.length} photo or video placeholder(s) still on the page`);
  if (!is404 && !noindex && !/<link[^>]+rel=["'](?:icon|shortcut icon)["']/i.test(html)) {
    fail(where, 'no favicon link. Make public/favicon.png from the logo icon and link it in the head');
  }
  if (MISSING && (verify || placeholders.length)) {
    const text = html.replace(/<head[\s\S]*?<\/head>/i, ' ').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const items = [];
    for (const m of text.matchAll(/\[VERIFY\]/g)) {
      items.push(`  confirm: ...${text.slice(Math.max(0, m.index - 70), m.index + 8 + 40).trim()}...`);
    }
    for (const ph of placeholders) items.push(`  photo or video needed: ${ph}`);
    missingList.push(`${urlPath(f)}\n${items.join('\n')}`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']+["']/i.test(m[0])) fail(where, `an image has no alt text: ${m[0].slice(0, 80)}`);
  }
}

for (const f of files) {
  if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(f)) continue;
  const mb = statSync(f).size / 1024 / 1024;
  if (mb > 1.5) fail(rel(f), `${mb.toFixed(1)}MB. Resize to at most 2000px wide and compress it below 1.5MB`);
  else if (mb > 0.6) warn(rel(f), `${mb.toFixed(1)}MB, worth compressing`);
  if (/[A-Z\s]/.test(rel(f))) fail(rel(f), 'file names are lower case with hyphens, no capitals or spaces');
}

if (MISSING) {
  console.log(missingList.length ? missingList.join('\n\n') : 'Nothing is missing: no [VERIFY] and no placeholders on any page.');
  process.exit(0);
}

for (const line of [...fails, ...warns]) console.log(line);
console.log(`\n${pages.length} pages checked. ${fails.length} to fix, ${warns.length} to know about.`);
process.exit(fails.length ? 1 : 0);
