/* ============================================
   GILD DIGITAL AGENCY — main.js v6.0
   Firebase + EmailJS + OTP + Full Flow
============================================ */

// ── EmailJS public key ────────────────────
emailjs.init('3rCFsHWcxbqRtnYxd');

// ── EmailJS IDs ───────────────────────────
const EJ = {
  service:       'service_veexg7d',
  otpTemplate:   'template_frhiubp',
  resetTemplate: 'template_qkb8dcl',
  notifyTemplate:'template_notify', // your notification template ID
};

// ── Secure OTP store (NOT in window) ──────
const _OTP = (() => {
  let _code    = null;
  let _expires = 0;
  let _email   = null;
  return {
    set(code, email) {
      _code    = String(code);
      _email   = email;
      _expires = Date.now() + 15 * 60 * 1000; // 15 min
    },
    verify(input) {
      if (!_code || Date.now() > _expires) return false;
      return String(input).trim() === _code;
    },
    clear() { _code = null; _expires = 0; _email = null; },
    getEmail() { return _email; }
  };
})();

const _RESET = (() => {
  let _code    = null;
  let _expires = 0;
  let _email   = null;
  return {
    set(code, email) {
      _code    = String(code);
      _email   = email;
      _expires = Date.now() + 30 * 60 * 1000; // 30 min
    },
    verify(input) {
      if (!_code || Date.now() > _expires) return false;
      return String(input).trim() === _code;
    },
    clear() { _code = null; _expires = 0; _email = null; },
    getEmail() { return _email; }
  };
})();

// ── Generate OTP ──────────────────────────
function genOTP() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

// ── STATE ─────────────────────────────────
const STATE = {
  lang:     localStorage.getItem('gild_lang')  || 'EN',
  theme:    localStorage.getItem('gild_theme') || 'dark',
  curr:     localStorage.getItem('gild_curr')  || 'USD',
  page:     'pg-hero',
  section:  'about',
  payItem:  null,
  payType:  null,
  user:     JSON.parse(localStorage.getItem('gild_user') || 'null'),
  ob:       {},
  obStep:   1,
  prevPage: null,
};

let mx = 0, my = 0, rx = 0, ry = 0;

// ── PACKAGES DATA ─────────────────────────
const PACKAGES = [
  {
    id: 'luster', featured: false,
    tier:    { EN: 'Foundation', AM: 'መሰረት' },
    name:    'GILD Luster',
    tagline: { EN: '"Build it right from the start."', AM: '"ከጅምሩ ትክክል ይሰሩ።"' },
    usd:     '$380 – $450',
    etb:     '42,000 – 50,000 ETB',
    delivery:{ EN: '15–21 business days', AM: '15–21 የስራ ቀናት' },
    desc: {
      EN: 'Everything your business needs to launch with authority — a complete brand identity, optimised digital presence, 24/7 lead capture, and the operational documents to keep it running correctly from day one.',
      AM: 'ቢዝነስዎ ሥልጣን ይዞ ለመጀመር የሚያስፈልገው ሁሉ — ሙሉ ብራንድ ማንነት፣ ዲጂታል ፊት፣ 24/7 ሊድ capture፣ እና ቀን አንድ ጀምሮ ትክክለኛ ሥራ ለመሥራት የሚያስፈልጉ ሰነዶች።'
    },
    perks: [
      { label: { EN: 'Brand Identity System', AM: 'ብራንድ ማንነት ሲስተም' },
        detail: { EN: 'Logo (3 concepts → 1 final), colour palette with rationale, typography system, and a permanent Brand Style Guide PDF — the rulebook every designer follows.', AM: 'ሎጎ (3 ሀሳቦች → 1 ፍፃሜ)፣ color palette ከምክንያት ጋር፣ typography system፣ እና ቋሚ Brand Style Guide PDF።' } },
      { label: { EN: 'Google Business Profile', AM: 'Google Business Profile' },
        detail: { EN: '100% profile completion, keyword-optimised description, 10+ brand photos, and a direct review link — so you appear first when local clients search for you.', AM: '100% profile completion፣ keyword-optimized መግለጫ፣ 10+ ፎቶዎች፣ እና direct review link።' } },
      { label: { EN: 'Landing Page Website', AM: 'Landing Page ዌብሳይት' },
        detail: { EN: 'A single, conversion-focused page with persuasive copy, WhatsApp & Telegram CTAs, Facebook Pixel, Google Analytics 4, and basic SEO — built to turn visitors into leads.', AM: 'አሳማኝ copy ያለው single page፣ WhatsApp & Telegram CTAs፣ Pixel፣ Analytics — ጎብኝዎችን ሊዶች ለማድረግ።' } },
      { label: { EN: 'Telegram Bot — 24/7 Lead Capture', AM: 'Telegram Bot — 24/7 ሊድ Capture' },
        detail: { EN: 'A fully-built bot that answers instantly, qualifies enquiries, captures contact details, and alerts you in real time — even while you sleep.', AM: 'ወዲያውኑ የሚመልስ፣ ጥያቄዎችን የሚያፈላቅድ፣ contact details የሚሰበስብ፣ real-time የሚያሳውቅ bot — ሲተኙ ሳይቀር።' } },
      { label: { EN: 'Basic SOP Documentation', AM: 'መሰረታዊ SOP ሰነዶች' },
        detail: { EN: 'Three core Standard Operating Procedures written in plain language — so your business runs correctly every time, by anyone, without relying on memory.', AM: 'ሶስት ዋና SOPs ግልፅ ቋንቋ ተፃፉ — ቢዝነስዎ ሁልጊዜ ትክክለኛ ሥራ ሊሠራ።' } },
    ],
    includes: [
      { title: { EN: 'Brand Identity System', AM: 'ብራንድ ማንነት ሲስተም' },
        why:   { EN: 'Every designer and platform produces consistent, premium output — because there is a documented gold standard to follow.', AM: 'ሁሉም ዲዛይነር ወጥ ፕሪሚዬም ውጤት ያወጣሉ — ሰነድ ያለው ወርቃማ ደረጃ ስላለ።' },
        items: [
          { EN: 'Custom logo — 3 concepts → 1 final → 2 revisions', AM: 'Custom ሎጎ — 3 ሀሳቦች → 1 ፍፃሜ → 2 ማስተካከያዎች' },
          { EN: 'Colour palette — psychological rationale + all colour codes', AM: 'Color palette — ምክንያት + ሁሉም codes' },
          { EN: 'Typography system — headline, body & accent fonts', AM: 'Typography system' },
          { EN: 'Brand Style Guide PDF — logo rules, colours, tone of voice', AM: 'Brand Style Guide PDF' },
          { EN: 'All formats: PNG, SVG, PDF — dark & light versions', AM: 'ሁሉም formats: PNG, SVG, PDF' },
        ]
      },
      { title: { EN: 'Google Business Profile', AM: 'Google Business Profile' },
        why:   { EN: 'Over 70% of purchase decisions begin with a Google search. An absent or incomplete profile makes you invisible.', AM: '70%+ ውሳኔዎች Google ፍለጋ ይጀምራሉ። ያልተሟላ profile ይደብቅዎታል።' },
        items: [
          { EN: 'Full creation, claiming & verification support', AM: 'ሙሉ ፈጠራ፣ claiming & verification' },
          { EN: '100% completion — category, services, hours, Q&A', AM: '100% completion' },
          { EN: 'Keyword-optimised business description', AM: 'Keyword-optimized መግለጫ' },
          { EN: '10+ brand photos uploaded', AM: '10+ ፎቶዎች' },
          { EN: 'Google Review direct link delivered', AM: 'Google Review ሊንክ' },
        ]
      },
      { title: { EN: 'Landing Page', AM: 'Landing Page' },
        why:   { EN: 'A landing page has one job: convert visitors. That focused purpose is why it outperforms any social profile.', AM: 'Landing page አንድ ስራ ብቻ አለው: ጎብኝዎችን ቀይር።' },
        items: [
          { EN: 'Mobile-first, fast-loading', AM: 'Mobile-first, ፈጣን' },
          { EN: 'Conversion copywriting', AM: 'Conversion copywriting' },
          { EN: 'WhatsApp + Telegram CTA', AM: 'WhatsApp + Telegram CTA' },
          { EN: 'Facebook Pixel + Google Analytics 4', AM: 'Pixel + Analytics' },
          { EN: 'Basic on-page SEO', AM: 'Basic on-page SEO' },
        ]
      },
      { title: { EN: 'Telegram Bot', AM: 'Telegram Bot' },
        why:   { EN: 'Every unanswered message is a lost client. A bot ensures zero leads are ever missed.', AM: 'ምላሽ ያልተሰጠ ሁሉም መልዕክት የጠፋ ደንበኛ ነው።' },
        items: [
          { EN: 'Full flow: welcome → menu → services → lead capture → admin alert', AM: 'ሙሉ flow' },
          { EN: '15+ FAQ auto-responses', AM: '15+ FAQ auto-responses' },
          { EN: 'Real-time admin notification per lead', AM: 'Real-time notification' },
          { EN: '"Talk to Human" fallback routing', AM: '"Talk to Human" routing' },
          { EN: 'Full testing + admin training video', AM: 'Testing + training video' },
        ]
      },
    ]
  },
  {
    id: 'radiant', featured: true,
    tier:    { EN: 'Growth', AM: 'እድገት' },
    name:    'GILD Radiant',
    tagline: { EN: '"A complete digital ecosystem."', AM: '"ሙሉ ዲጂታል ሥነ-ምህዳር።"' },
    usd:     '$850 – $1,000',
    etb:     '95,000 – 115,000 ETB',
    delivery:{ EN: '25–35 business days', AM: '25–35 የስራ ቀናት' },
    desc: {
      EN: 'For businesses ready to grow. A fully integrated ecosystem — enterprise branding, a multi-page website that ranks on Google, automated lead capture, an AI chatbot, and operational SOPs — all working as one.',
      AM: 'ለማደግ ዝግጁ ለሆኑ ቢዝነሶች። ሙሉ integrated ecosystem — enterprise branding፣ Google ላይ የሚመደብ multi-page ዌብሳይት፣ automated lead capture፣ AI chatbot፣ እና SOPs — ሁሉም አንድ ላይ።'
    },
    perks: [
      { label: { EN: 'Corporate Branding', AM: 'Corporate Branding' },
        detail: { EN: 'Enterprise-level identity: extended colour system, 3-font typography hierarchy, corporate stationery suite, branded presentation template, and 4-platform social templates.', AM: 'Enterprise-level identity: extended color system፣ 3-font typography፣ stationery suite፣ presentation template፣ 4-platform templates።' } },
      { label: { EN: 'Full Website — up to 8 pages', AM: 'ሙሉ ዌብሳይት — እስከ 8 ገፆች' },
        detail: { EN: 'Mobile-first, cross-browser tested, with conversion copywriting on every page, full brand applied, Pixel + Analytics, and a 30-minute client training session.', AM: 'Mobile-first፣ cross-browser tested፣ conversion copywriting፣ Pixel + Analytics፣ 30-ደቂቃ training።' } },
      { label: { EN: 'On-Page SEO + Google Maps', AM: 'On-Page SEO + Google Maps' },
        detail: { EN: '25+ keyword research, full on-page optimisation, technical SEO fixes, Search Console setup, sitemap submission, 5 directory listings, schema markup, and a baseline report.', AM: '25+ keyword research፣ ሙሉ on-page optimization፣ technical SEO፣ Search Console፣ schema markup።' } },
      { label: { EN: 'Lead Generation System', AM: 'Lead Generation ሲስተም' },
        detail: { EN: 'Website forms, Telegram qualification flow, WhatsApp integration, a structured lead log, and a 3-email follow-up sequence — so no lead is ever lost.', AM: 'Website forms፣ Telegram flow፣ WhatsApp integration፣ lead log፣ 3-email follow-up sequence።' } },
      { label: { EN: 'AI Chatbot — website + Telegram', AM: 'AI Chatbot — ዌብሳይት + Telegram' },
        detail: { EN: 'Handles 50 questions a day instantly — at 3 AM if needed — with a full knowledge base, conversation logging, escalation triggers, and a monthly performance log.', AM: 'በቀን 50 ጥያቄዎችን ወዲያውኑ ያስተናግዳቸዋል — 3AM ላይ ሳይቀር — knowledge base ፣ conversation logging ፣ escalation triggers።' } },
      { label: { EN: 'System Automation + 5-doc SOP Library', AM: 'ሲስተም Automation + 5-ሰነድ SOP Library' },
        detail: { EN: 'End-to-end workflow automation (Zapier/Make) covering lead capture, follow-up, bookings, and internal tasks — plus five detailed SOPs so the system is understood and maintainable.', AM: 'End-to-end workflow automation plus 5 detailed SOPs።' } },
    ],
    includes: [
      { title: { EN: 'Corporate Branding', AM: 'Corporate Branding' },
        why:   { EN: 'At scale, every touchpoint must tell the same premium story. Inconsistency costs trust.', AM: 'በሚያድጉ ጊዜ ሁሉም touchpoint ተመሳሳይ ፕሪሚዬም ታሪክ መናገር አለበት።' },
        items: [
          { EN: 'Everything in Luster Brand Identity, elevated', AM: 'Luster Brand Identity ሁሉም + ከፍ ያሉ' },
          { EN: 'Extended colour system: primary, secondary, accent, neutral', AM: 'Extended color system' },
          { EN: 'Corporate stationery: card (CMYK), letterhead, email signature', AM: 'Corporate stationery suite' },
          { EN: 'Branded presentation template (PowerPoint / Google Slides)', AM: 'Branded presentation template' },
          { EN: '4-platform social media templates', AM: '4-platform templates' },
        ]
      },
      { title: { EN: 'Full Website', AM: 'ሙሉ ዌብሳይት' },
        why:   { EN: 'Your website is the only platform you fully own — your 24/7 salesperson and credibility proof.', AM: 'ዌብሳይትዎ ሙሉ ባለቤትነት ያለዎት ብቸኛ ፕላትፎርም ነው।' },
        items: [
          { EN: 'Up to 8 pages: Home, About, Services, Portfolio, FAQ, Contact, Blog, Custom', AM: 'እስከ 8 ገፆች' },
          { EN: 'Full brand applied, mobile-first, cross-browser tested', AM: 'Mobile-first፣ cross-browser' },
          { EN: 'Conversion copywriting on all pages', AM: 'Conversion copywriting' },
          { EN: 'Facebook Pixel + Google Analytics 4 with conversion events', AM: 'Pixel + Analytics with events' },
          { EN: '30-min client CMS training', AM: '30-ደቂቃ CMS training' },
        ]
      },
    ]
  },
  {
    id: 'k24', featured: false,
    tier:    { EN: 'Empire', AM: 'ኢምፓየር' },
    name:    'GILD 24K',
    tagline: { EN: '"Every layer. Every system. Every operation."', AM: '"ሁሉም ሽፋን። ሁሉም ሲስተም።"' },
    usd:     '$1,800 – $2,200',
    etb:     '200,000 – 250,000 ETB',
    delivery:{ EN: '40–55 business days', AM: '40–55 የስራ ቀናት' },
    desc: {
      EN: 'The complete build. E-commerce, advanced SEO architecture, a custom admin dashboard, CRM, full automation, a VIP loyalty engine, legal foundations, and a 10-document SOP library — built to dominate your market.',
      AM: 'ሙሉ ግንባታ። E-commerce፣ advanced SEO architecture፣ custom admin dashboard፣ CRM፣ ሙሉ automation፣ VIP loyalty engine፣ ህጋዊ መሠረቶች፣ እና 10-ሰነድ SOP library — ገበያዎን ለመቆጣጠር።'
    },
    perks: [
      { label: { EN: 'E-Commerce Website', AM: 'E-Commerce ዌብሳይት' },
        detail: { EN: 'Full online store with product/service listings, TeleBirr + CBE + international payments, order management, inventory tracking, customer accounts, and admin training.', AM: 'ሙሉ online store ከ TeleBirr + CBE + international payments + order management ጋር።' } },
      { label: { EN: 'Hub & Spoke SEO — 60+ keywords', AM: 'Hub & Spoke SEO — 60+ keywords' },
        detail: { EN: 'A hub page plus six spoke pages targeting 60+ keywords, interlinking for maximum authority, competitor analysis, schema markup, and a 6-month roadmap.', AM: 'Hub page + 6 spoke pages፣ 60+ keywords፣ competitor analysis፣ 6-ወር roadmap።' } },
      { label: { EN: 'Custom Admin Dashboard', AM: 'Custom Admin Dashboard' },
        detail: { EN: 'A unified view of leads, orders, analytics, bot performance, SEO rankings, and team tasks — built specifically around your data, mobile-accessible.', AM: 'Leads፣ orders፣ analytics፣ bot performance፣ SEO rankings — unified view።' } },
      { label: { EN: 'CRM + Employee KPI Tracker', AM: 'CRM + Employee KPI Tracker' },
        detail: { EN: 'Full pipeline (Lead → Won/Lost), contact management, deal tracking, team task assignment, deadline visibility, and a CRM usage SOP.', AM: 'ሙሉ pipeline፣ contact management፣ deal tracking፣ team tasks + KPI tracker።' } },
      { label: { EN: 'Advanced Automation + VIP Loyalty', AM: 'Advanced Automation + VIP Loyalty' },
        detail: { EN: 'End-to-end automation across every core business process, automated invoicing, VIP milestone tracking, and re-engagement triggers.', AM: 'End-to-end automation + automated invoicing + VIP loyalty system።' } },
      { label: { EN: 'Full SOP Library — 10 documents', AM: 'ሙሉ SOP Library — 10 ሰነዶች' },
        detail: { EN: 'Ten comprehensive SOPs covering every core operation — from client onboarding and lead follow-up to quality control, team communication, and financial record-keeping.', AM: '10 comprehensive SOPs — onboarding፣ lead follow-up፣ quality control፣ finance።' } },
      { label: { EN: 'Digital PR + Legal Compliance', AM: 'Digital PR + Legal Compliance' },
        detail: { EN: 'A publish-ready press release, LinkedIn Company Page, Google Knowledge Panel guidance, Privacy Policy, Terms of Service, and Cookie Policy — all written and installed.', AM: 'Press release፣ LinkedIn Page፣ Privacy Policy፣ Terms of Service፣ Cookie Policy።' } },
    ],
    includes: [
      { title: { EN: 'Everything in Radiant, elevated', AM: 'Radiant ውስጥ ያሉ ሁሉም + ከፍ ያሉ' },
        why:   { EN: 'Built for businesses that are ready to dominate — not just compete.', AM: 'ለሚወዳደሩ ሳይሆን ለሚቆጣጠሩ ቢዝነሶች ተሠርቷል።' },
        items: [
          { EN: 'Full corporate branding suite (as Radiant)', AM: 'ሙሉ corporate branding (Radiant ደረጃ)' },
          { EN: 'E-commerce website with all payment integrations', AM: 'E-commerce + ሁሉም payment integrations' },
          { EN: 'Hub & Spoke SEO architecture', AM: 'Hub & Spoke SEO architecture' },
          { EN: 'Custom admin dashboard + CRM + KPI tracker', AM: 'Custom dashboard + CRM + KPI tracker' },
          { EN: 'Advanced automation + VIP loyalty system', AM: 'Advanced automation + VIP loyalty' },
          { EN: '10-document SOP library', AM: '10-ሰነድ SOP library' },
          { EN: 'Digital PR + full legal compliance suite', AM: 'Digital PR + legal compliance' },
        ]
      },
    ]
  },
  {
    id: 'black', featured: false,
    tier:    { EN: 'Invitation Only', AM: 'በጥሪ ብቻ' },
    name:    'GILD BLACK',
    tagline: { EN: '"Full digital transformation. Fractional CTO."', AM: '"ሙሉ ዲጂታል ለውጥ። Fractional CTO።"' },
    usd:     '$4,500 – $8,000+',
    etb:     '500,000+ ETB',
    delivery:{ EN: '60–90 business days', AM: '60–90 የስራ ቀናት' },
    desc: {
      EN: 'For serious businesses undergoing complete digital transformation. Everything in 24K — plus a custom web application, business intelligence dashboard, API integrations, digital HR portal, and a 90-day fractional CTO partnership.',
      AM: 'ሙሉ ዲጂታል ለውጥ ለሚያደርጉ ቁም ነገረኛ ቢዝነሶች። 24K ሁሉም + custom web app፣ BI dashboard፣ API integrations፣ digital HR portal፣ 90-ቀን Fractional CTO ሽርካ።'
    },
    perks: [
      { label: { EN: 'Everything in GILD 24K', AM: 'GILD 24K ሁሉም' },
        detail: { EN: 'The full 24K scope is included as the foundation layer.', AM: 'ሙሉ 24K scope እንደ foundation layer ይካተታሉ።' } },
      { label: { EN: 'Custom Web Application', AM: 'Custom Web Application' },
        detail: { EN: 'Purpose-built: client portal, internal tool, booking system, or operational platform — full design, development, QA, deployment, and documentation.', AM: 'Purpose-built: client portal፣ internal tool፣ booking system — ሙሉ design፣ development፣ deployment።' } },
      { label: { EN: 'Business Intelligence Dashboard', AM: 'Business Intelligence Dashboard' },
        detail: { EN: 'All your digital systems — website, CRM, bots, e-commerce, SEO — consolidated into one real-time intelligence view with automated weekly reports.', AM: 'ሁሉም ዲጂታል ሲስተሞች — website፣ CRM፣ bots፣ e-commerce — unified real-time view።' } },
      { label: { EN: 'API Integrations & Systems Architecture', AM: 'API Integrations' },
        detail: { EN: 'Custom API connections linking every platform in your ecosystem — so all tools communicate seamlessly.', AM: 'Custom API connections ሁሉም platforms ሊያናገሩ።' } },
      { label: { EN: 'Digital Recruitment & HR Portal', AM: 'Digital Recruitment & HR Portal' },
        detail: { EN: 'Job posting, application collection, screening workflow, and digital onboarding documentation for new hires.', AM: 'Job posting፣ application collection፣ screening workflow፣ digital onboarding documents።' } },
      { label: { EN: 'Fractional CTO — 90-day partnership', AM: 'Fractional CTO — 90 ቀናት' },
        detail: { EN: 'Strategic technology advisory throughout the build and for 90 days after handover — ensuring your next three years of technology investment are planned, not accidental.', AM: 'ስልታዊ technology advisory build ወቅት እና handover ካደረጉ 90 ቀናት — ቀጣዮቹ 3 ዓመታት ዕቅድ ይኖራቸዋል።' } },
    ],
    includes: [
      { title: { EN: 'Custom Web Application', AM: 'Custom Web Application' },
        why:   { EN: 'When no off-the-shelf tool solves your specific problem — a custom application is the precise, permanent solution.', AM: 'ምንም ready-made tool ሲፈታ ሳይቻል — custom application ትክክለኛ፣ ቋሚ መፍትሔ ነው።' },
        items: [
          { EN: 'Requirements discovery + UI/UX design before any code', AM: 'Requirements + UI/UX design before code' },
          { EN: 'Full frontend + backend development', AM: 'Frontend + backend development' },
          { EN: 'User authentication + role-based access + database', AM: 'Auth + roles + database' },
          { EN: 'QA testing + deployment + technical documentation', AM: 'QA + deployment + documentation' },
        ]
      },
      { title: { EN: 'Fractional CTO Partnership', AM: 'Fractional CTO ሽርካ' },
        why:   { EN: 'The right technology decisions at the right time are worth more than any single deliverable.', AM: 'ትክክለኛ ሰዓት ትክክለኛ technology ውሳኔዎች ከማናቸውም deliverable ይበልጣሉ።' },
        items: [
          { EN: 'Technology strategy for the next 2–3 years', AM: 'ለቀጣዮቹ 2–3 ዓመታት technology strategy' },
          { EN: 'Weekly strategy calls during the build', AM: 'ሳምንታዊ strategy calls' },
          { EN: '90-day post-delivery optimisation partnership', AM: '90-ቀን post-delivery optimisation' },
          { EN: 'BI Dashboard + API systems architecture', AM: 'BI Dashboard + API architecture' },
        ]
      },
    ]
  },
];

// ── SERVICES DATA ─────────────────────────
const SERVICES = [
  { id:'logo',      cat:'foundation', icon:'◈', usd:'$45–$65',    etb:'5,000–8,000 ETB',    days:{EN:'4–5 days',AM:'4–5 ቀናት'},    name:{EN:'Logo Design',AM:'ሎጎ ዲዛይን'},                      desc:{EN:'3 research-based concepts → 1 final → 2 revisions. PNG, SVG, PDF. Dark & light.',AM:'3 ምርምር ሀሳቦች → 1 ፍፃሜ → 2 ማስተካከያዎች።'},         why:{EN:'Your logo is the first signal your market receives. A weak logo loses trust before a word is read.',AM:'ሎጎዎ ገበያዎ ስለ ሁሉም ነገር ጥራት የሚቀበለው የመጀመሪያ ምልክት ነው።'},                    includes:[{EN:'3 distinct concepts',AM:'3 ልዩ ሀሳቦች'},{EN:'2 revision rounds',AM:'2 ማስተካከያ ዙሮች'},{EN:'PNG, SVG, PDF — dark & light',AM:'PNG, SVG, PDF'},{EN:'Design story document',AM:'Design story'}]},
  { id:'brand',     cat:'foundation', icon:'⬡', usd:'$120–$160',  etb:'12,000–18,000 ETB',  days:{EN:'7–10 days',AM:'7–10 ቀናት'},  name:{EN:'Full Brand Identity',AM:'ሙሉ Brand Identity'},      desc:{EN:'Logo + colours + typography + Brand Style Guide + social templates — your complete visual system.',AM:'ሎጎ + ቀለሞች + typography + Style Guide + templates — ሙሉ visual system።'},  why:{EN:'A logo without a system is just a mark. A brand identity ensures everything looks premium — for years.',AM:'ሲስተም ሳይኖር ሎጎ ምልክት ብቻ ነው።'},                                          includes:[{EN:'Full logo design',AM:'ሙሉ logo design'},{EN:'Colour palette + rationale',AM:'Color palette'},{EN:'Typography system',AM:'Typography system'},{EN:'Brand Style Guide PDF',AM:'Brand Style Guide PDF'},{EN:'Social templates — 3 platforms',AM:'Social templates'}]},
  { id:'corporate', cat:'foundation', icon:'▣', usd:'$200–$280',  etb:'20,000–30,000 ETB',  days:{EN:'10–14 days',AM:'10–14 ቀናት'},name:{EN:'Corporate Branding',AM:'Corporate Branding'},       desc:{EN:'Full Brand Identity + stationery + presentation template + 4-platform templates.',AM:'Full Brand Identity + stationery + presentation template + 4-platform templates།'},       why:{EN:'At enterprise level, every touchpoint must tell the same premium story.',AM:'Enterprise ደረጃ ሁሉም touchpoint ተመሳሳይ ፕሪሚዬም ታሪክ ይናገሩ።'},                                        includes:[{EN:'Everything in Full Brand Identity',AM:'Full Brand Identity ሁሉም'},{EN:'Corporate stationery suite',AM:'Stationery suite'},{EN:'Branded presentation template',AM:'Presentation template'},{EN:'4-platform templates',AM:'4-platform templates'}]},
  { id:'bizcard',   cat:'foundation', icon:'▤', usd:'$20–$35',    etb:'2,000–3,500 ETB',    days:{EN:'2–3 days',AM:'2–3 ቀናት'},    name:{EN:'Business Card Design',AM:'ቢዝነስ ካርድ ዲዛይን'},       desc:{EN:'Premium print-ready front + back. CMYK. 2 revisions.',AM:'ፕሪሚዬም print-ready ፊት + ኋላ። CMYK። 2 ማስተካከያዎች།'},                                                                    why:{EN:'Your card is the physical handshake of your brand. A cheap card signals cheap quality.',AM:'ቢዝነስ ካርድዎ የብራንድዎ አካላዊ악수ነው።'},                                                  includes:[{EN:'Front + back design',AM:'ፊት + ኋላ ዲዛይን'},{EN:'CMYK print-ready',AM:'CMYK print-ready'},{EN:'2 revisions',AM:'2 ማስተካከያዎች'},{EN:'Editable source file',AM:'Editable source'}]},
  { id:'landing',   cat:'foundation', icon:'⊞', usd:'$95–$140',   etb:'10,000–16,000 ETB',  days:{EN:'7–10 days',AM:'7–10 ቀናት'},  name:{EN:'Landing Page',AM:'Landing Page'},                   desc:{EN:'One page. One offer. Conversion copywriting, WhatsApp/Telegram CTA, Pixel, Analytics, SEO.',AM:'አንድ ገፅ። አንድ offer። Conversion copywriting፣ CTA፣ Pixel፣ Analytics།'},             why:{EN:'A landing page has one job: convert your visitor. That focus is why it works.',AM:'Landing page አንድ ስራ ብቻ አለው: ጎብኝዎን ቀይር።'},                                                  includes:[{EN:'Mobile-first single page',AM:'Mobile-first single page'},{EN:'Conversion copywriting',AM:'Conversion copywriting'},{EN:'WhatsApp + Telegram CTA',AM:'CTA buttons'},{EN:'Pixel + Analytics',AM:'Pixel + Analytics'}]},
  { id:'website',   cat:'foundation', icon:'⊟', usd:'$280–$480',  etb:'30,000–55,000 ETB',  days:{EN:'14–21 days',AM:'14–21 ቀናት'},name:{EN:'Full Business Website',AM:'ሙሉ Business ዌብሳይት'},     desc:{EN:'Up to 8 pages. Full brand. SEO on every page. Analytics + Pixel. 30-min training.',AM:'እስከ 8 ገፆች። ሙሉ brand። SEO። Analytics + Pixel። 30-ደቂቃ training།'},                       why:{EN:'The only platform you fully own — your 24/7 salesperson working while you sleep.',AM:'ሙሉ ባለቤትነት ያለዎት ብቸኛ ፕላትፎርም — 24/7 ሻጭዎ።'},                                              includes:[{EN:'Up to 8 pages',AM:'እስከ 8 ገፆች'},{EN:'Full brand applied, mobile tested',AM:'Full brand, mobile tested'},{EN:'All pages SEO-optimised',AM:'SEO-optimized'},{EN:'Pixel + Analytics + 30-min training',AM:'Pixel + Analytics + training'}]},
  { id:'ecom',      cat:'foundation', icon:'⊡', usd:'$550–$950',  etb:'60,000–110,000 ETB', days:{EN:'21–35 days',AM:'21–35 ቀናት'},name:{EN:'E-Commerce Website',AM:'E-Commerce ዌብሳይት'},         desc:{EN:'Full store. TeleBirr + CBE + international payments. Orders, inventory, accounts.',AM:'ሙሉ store። TeleBirr + CBE + international payments። Orders, inventory።'},                  why:{EN:'Removes the ceiling on clients you can serve and eliminates geography as a barrier.',AM:'ሊያገለግሉ ስለሚችሉ ደንበኞች ቁጥር ገደቡን ያስወግዳል።'},                                            includes:[{EN:'Product listings + search',AM:'Product listings'},{EN:'TeleBirr + CBE + international',AM:'TeleBirr + CBE + international'},{EN:'Order management + inventory',AM:'Orders + inventory'},{EN:'Admin training',AM:'Admin training'}]},
  { id:'gbp',       cat:'foundation', icon:'◎', usd:'$30–$45',    etb:'3,000–5,000 ETB',    days:{EN:'3–4 days',AM:'3–4 ቀናት'},    name:{EN:'Google Business Profile',AM:'Google Business Profile'},desc:{EN:'100% optimised. Categories, photos, description, review link. Maps confirmed.',AM:'100% optimized። ምድቦች፣ ፎቶዎች፣ review link།'},                                                  why:{EN:'70%+ of purchases start with a Google search. An absent profile is invisible business.',AM:'70%+ ግዢዎች Google ፍለጋ ይጀምራሉ።'},                                                        includes:[{EN:'Full creation + verification',AM:'ፈጠራ + verification'},{EN:'100% completion',AM:'100% completion'},{EN:'Keyword description + 10+ photos',AM:'Keyword description'},{EN:'Review link + Maps',AM:'Review link'}]},
  { id:'tgbot',     cat:'system',     icon:'◉', usd:'$130–$200',  etb:'15,000–22,000 ETB',  days:{EN:'5–8 days',AM:'5–8 ቀናት'},    name:{EN:'Telegram Bot',AM:'Telegram Bot'},                   desc:{EN:'24/7 lead capture + FAQ + instant admin alerts. Works while you sleep.',AM:'24/7 lead capture + FAQ + instant admin alerts። ሲተኙ ይሰራሉ།'},                                       why:{EN:'Every unanswered message is a lost client. A bot ensures zero leads are missed.',AM:'ምላሽ ያልተሰጠ ሁሉም መልዕክት የጠፋ ደንበኛ ነው།'},                                                       includes:[{EN:'Full conversation flow',AM:'ሙሉ flow'},{EN:'15+ FAQ auto-responses',AM:'15+ FAQ'},{EN:'Lead capture + admin notification',AM:'Lead + notification'},{EN:'Testing + training video',AM:'Testing + training'}]},
  { id:'aichat',    cat:'system',     icon:'◌', usd:'$180–$280',  etb:'20,000–32,000 ETB',  days:{EN:'7–10 days',AM:'7–10 ቀናት'},  name:{EN:'AI Chatbot',AM:'AI Chatbot'},                       desc:{EN:'Intelligent chatbot on website + Telegram. Knowledge base. 24/7 accurate responses.',AM:'ብልህ chatbot ዌብሳይት + Telegram ላይ። Knowledge base። 24/7።'},                               why:{EN:'Handles 50 questions a day — instantly, at 3 AM — freeing your team for real work.',AM:'በቀን 50 ጥያቄዎችን ወዲያውኑ ያስተናግዳቸዋል — 3AM ሳይቀር።'},                                           includes:[{EN:'AI on website + Telegram',AM:'AI website + Telegram'},{EN:'Knowledge base from your content',AM:'Knowledge base'},{EN:'Conversation logging + escalation',AM:'Logging + escalation'},{EN:'Monthly performance log',AM:'Monthly log'}]},
  { id:'seo',       cat:'system',     icon:'◇', usd:'$75–$120',   etb:'8,000–14,000 ETB',   days:{EN:'7–10 days',AM:'7–10 ቀናት'},  name:{EN:'On-Page SEO',AM:'On-Page SEO'},                     desc:{EN:'25+ keywords. Full optimisation. Technical SEO. Search Console. 5 directories.',AM:'25+ keywords። ሙሉ optimization። Technical SEO። Search Console።'},                            why:{EN:'Every invisible month on Google, a competitor gets your clients.',AM:'Google ላይ የማይታዩ ሁሉም ወራት ፣ ተወዳዳሪ ደንበኞችዎን ያገኛሉ།'},                                                    includes:[{EN:'25+ keyword research',AM:'25+ keyword research'},{EN:'Full on-page optimisation',AM:'ሙሉ on-page'},{EN:'Technical SEO fixes',AM:'Technical SEO'},{EN:'Search Console + sitemap + 5 directories',AM:'Search Console + directories'}]},
  { id:'hubspoke',  cat:'system',     icon:'◈', usd:'$280–$480',  etb:'30,000–55,000 ETB',  days:{EN:'14–21 days',AM:'14–21 ቀናት'},name:{EN:'Hub & Spoke SEO',AM:'Hub & Spoke SEO'},             desc:{EN:'60+ keywords. Hub + 6 spoke pages. Competitor analysis. 6-month roadmap.',AM:'60+ keywords። Hub + 6 spoke pages། Competitor analysis། 6-ወር roadmap།'},                       why:{EN:'Separates page 3 businesses from page 1 owners — permanently.',AM:'ገፅ 3 ካሉ ቢዝነሶች ፣ ገፅ 1 ባለቤቶቻቸውን ይለያቸዋል — ቋሚ።'},                                                          includes:[{EN:'60+ keyword architecture',AM:'60+ keyword architecture'},{EN:'Hub + 6 spoke pages',AM:'Hub + 6 spoke pages'},{EN:'Technical SEO + schema',AM:'Technical SEO + schema'},{EN:'6-month roadmap',AM:'6-ወር roadmap'}]},
  { id:'leadgen',   cat:'system',     icon:'◑', usd:'$110–$170',  etb:'12,000–20,000 ETB',  days:{EN:'7–10 days',AM:'7–10 ቀናት'},  name:{EN:'Lead Generation System',AM:'Lead Generation ሲስተም'},desc:{EN:'Forms + bot + WhatsApp + lead log + 3-step follow-up. Zero leads missed.',AM:'Forms + bot + WhatsApp + lead log + 3-step follow-up። ምንም ሊዶች አይጠፉም།'},                      why:{EN:'Most businesses lose leads not because clients aren\'t interested — but because no one responded fast enough.',AM:'አብዛኞቹ ቢዝነሶች ሊዶች ያጣሉ ፈጥኖ ምላሽ ስለማይሰጡ።'},                     includes:[{EN:'Website forms + instant notification',AM:'Forms + notification'},{EN:'Telegram qualification flow',AM:'Telegram flow'},{EN:'Lead log (Sheets/Notion)',AM:'Lead log'},{EN:'3-step follow-up configured',AM:'Follow-up sequence'}]},
  { id:'dashboard', cat:'system',     icon:'▦', usd:'$220–$420',  etb:'25,000–50,000 ETB',  days:{EN:'10–18 days',AM:'10–18 ቀናት'},name:{EN:'Admin Dashboard',AM:'Admin Dashboard'},             desc:{EN:'Custom unified view — leads, orders, analytics, bot, SEO, tasks. Mobile accessible.',AM:'Custom unified view — leads, orders, analytics, bot, SEO, tasks። Mobile accessible།'},   why:{EN:'A business you cannot see clearly is a business you cannot manage clearly.',AM:'በግልፅ ማየት የማትችሉት ቢዝነስ በግልፅ ማስተዳደር አትችሉም།'},                                                  includes:[{EN:'Leads + orders + analytics unified',AM:'Leads + orders + analytics'},{EN:'SEO ranking tracker',AM:'SEO tracker'},{EN:'Task management + access controls',AM:'Tasks + access'}]},
  { id:'crm',       cat:'system',     icon:'◧', usd:'$80–$130',   etb:'8,000–15,000 ETB',   days:{EN:'5–8 days',AM:'5–8 ቀናት'},    name:{EN:'CRM Setup',AM:'CRM Setup'},                         desc:{EN:'Pipeline, contacts, deals, team access, integrations, training + SOP.',AM:'Pipeline, contacts, deals, team access, integrations, training + SOP།'},                            why:{EN:'Without a CRM, relationships live in memory. With one, every relationship becomes a permanent asset.',AM:'CRM ሳይኖር ግንኙነቶቹ በትዝታ ውስጥ ይኖራሉ།'},                                   includes:[{EN:'Platform configured',AM:'Platform configured'},{EN:'Pipeline + deal tracking',AM:'Pipeline + deals'},{EN:'Integration + training + SOP',AM:'Integration + training'}]},
  { id:'sop',       cat:'operations', icon:'▤', usd:'$50–$90',    etb:'5,000–10,000 ETB',   days:{EN:'5–7 days',AM:'5–7 ቀናት'},    name:{EN:'SOP Documentation',AM:'SOP ሰነዶች'},                 desc:{EN:'Up to 5 SOPs. Step-by-step + tools + quality checkpoints. Branded PDFs.',AM:'እስከ 5 SOPs። Step-by-step + tools + quality checkpoints። Branded PDFs།'},                      why:{EN:'A business on memory is fragile. SOPs make it scalable, delegatable, consistent.',AM:'SOP ላይ የሚሰራ ቢዝነስ ሊለካ፣ ሊወከል ይችላል።'},                                                     includes:[{EN:'Up to 5 core process SOPs',AM:'እስከ 5 SOPs'},{EN:'Steps + tools + quality + responsible party',AM:'Steps + quality'},{EN:'Branded PDF documents',AM:'Branded PDFs'}]},
  { id:'automation',cat:'operations', icon:'◎', usd:'$110–$190',  etb:'12,000–22,000 ETB',  days:{EN:'7–12 days',AM:'7–12 ቀናት'},  name:{EN:'Workflow Automation',AM:'Workflow Automation'},     desc:{EN:'End-to-end automation. Lead, onboarding, follow-up, booking. All documented.',AM:'End-to-end automation። Lead, onboarding, follow-up, booking። ሁሉም ሰነድ።'},                    why:{EN:'Manual processes create inconsistency and burnout. Automation removes both.',AM:'Manual ሂደቶች አለመጣጣም ያስከትላሉ። Automation ሁለቱንም ያስወግዳቸዋል།'},                                      includes:[{EN:'Process audit + workflow mapping',AM:'Process audit + mapping'},{EN:'Lead → follow-up automation',AM:'Lead automation'},{EN:'All automations documented as SOPs',AM:'Automation SOPs'}]},
  { id:'strategy',  cat:'operations', icon:'◆', usd:'$30–$55',    etb:'3,000–6,000 ETB',    days:{EN:'Same/Next day',AM:'ተመሳሳይ/ቀጣይ ቀን'}, name:{EN:'Strategy Consultation',AM:'Strategy Consultation'}, desc:{EN:'60–90 min. Digital audit. 3–5 recs. 90-day roadmap. Action Plan PDF in 24 hrs.',AM:'60–90 ደቂቃ። Digital audit። 3–5 recommendations። Action Plan PDF 24 ሰዓት።'},         why:{EN:'One 90-minute session can save months of wasted investment and wrong decisions.',AM:'አንድ 90-ደቂቃ session ወሮች ኢንቨስትመንት ሊቆጥብ ይችላል།'},                                             includes:[{EN:'Pre-session digital audit',AM:'Pre-session audit'},{EN:'60–90 min session',AM:'60–90 ደቂቃ'},{EN:'3–5 actionable recommendations',AM:'3–5 recommendations'},{EN:'90-day roadmap + Action Plan PDF',AM:'90-ቀን roadmap + PDF'}]},
];

// ── FAQ DATA ──────────────────────────────
const FAQS = [
  { q:{EN:'What exactly does GILD do?',AM:'GILD ምን ያደርጋሉ?'},
    a:{EN:'GILD is a Full-Stack Business Engineering firm. We design, build, and install the complete digital infrastructure of a business — Brand Identity, Websites, Backend Systems, Smart Automation, and Operational Frameworks. We build permanent systems and hand them over completely. No monthly retainers.',AM:'GILD Full-Stack Business Engineering ድርጅት ነው። ቋሚ ሲስተሞች ንገነባለን እና ሙሉ ናቸው። ወርሃዊ retainer የለም።'}},
  { q:{EN:'How is GILD different from other agencies?',AM:'GILD ከሌሎቹ ኤጀንሲዎች እንዴት ይለያሉ?'},
    a:{EN:'Three things: we build permanent systems, not monthly services; we work across all three layers — Brand, System, and Operations; and we hand everything over completely. You own every file, system, and document.',AM:'ሶስት ነገሮች: ቋሚ ሲስተሞች እንሠራለን፤ ሶስቱም ሽፋኖች ላይ ነን፤ ሁሉም ሙሉ ናቸው — ሁሉም ፋይሎች፣ ሲስተሞች፣ ሰነዶች።'}},
  { q:{EN:'Do you work with clients outside Ethiopia?',AM:'ከኢትዮጵያ ውጭ ካሉ ደንበኞች ጋር ትሠራሉ?'},
    a:{EN:'Yes. We are based in Addis Ababa but work with clients across East Africa, the Middle East, Europe, and globally. All communication happens via LinkedIn or email. Location is never a barrier.',AM:'አዎ። አዲስ አበባ ላይ ስንሆን ደንበኞቻችንን ምስራቅ አፍሪካ፣ አውሮፓ፣ ዓለምአቀፍ ሁሉ ይሠራሉ።'}},
  { q:{EN:'How long does a project take?',AM:'ፕሮጀክት ምን ያህል ጊዜ ይወስዳሉ?'},
    a:{EN:'Luster: 15–21 days. Radiant: 25–35 days. 24K: 40–55 days. GILD BLACK: 60–90 days. Single services: 2–21 days. All timelines start after Brand Brief submission and deposit confirmation.',AM:'Luster: 15–21 ቀናት። Radiant: 25–35 ቀናት። 24K: 40–55 ቀናት። BLACK: 60–90 ቀናት།'}},
  { q:{EN:'What payment methods do you accept?',AM:'ምን ክፍያ ዘዴዎች ትቀበሉ?'},
    a:{EN:'Ethiopia: CBE bank transfer and TeleBirr. International: Cryptocurrency only (USDT TRC-20/ERC-20 or BTC) for security and borderless transactions. A 50% deposit is required before work begins.',AM:'ኢትዮጵያ: CBE እና TeleBirr። ዓለምአቀፍ: Cryptocurrency ብቻ (USDT ወይም BTC)። 50% deposit ሥራ ከመጀመሩ አስፈላጊ ነው།'}},
  { q:{EN:'Why crypto only for international clients?',AM:'ለዓለምአቀፍ ደንበኞች Crypto ብቻ ለምን?'},
    a:{EN:'Cryptocurrency ensures secure, borderless transactions with no intermediary delays, no currency conversion complications, and no payment gateway restrictions. We accept USDT (TRC-20 or ERC-20) and BTC.',AM:'Cryptocurrency ደህንነቱ የተጠበቀ፣ ምንም intermediary ሳይኖር ዓለምአቀፍ ክፍያ ያረጋግጣቸዋል།'}},
  { q:{EN:'What happens after delivery?',AM:'ዲሊቨሪ ካደረጉ በኋላ ምን ይሆናሉ?'},
    a:{EN:'All packages include a 14-day post-delivery support window for minor adjustments at no charge. After that, additional work is quoted separately. You own every file and system permanently.',AM:'ሁሉም packages 14-ቀን post-delivery support ያካትታሉ ያለ ክፍያ። ሁሉም ፋይሎች — ቋሚ — የእርስዎ ናቸው།'}},
  { q:{EN:'Do I sign a contract?',AM:'ውል ይፈርማሉ?'},
    a:{EN:'Yes. Every project begins with a signed GILD Service Agreement. After onboarding and connecting on LinkedIn, we send your unique Contract ID (format: GILD-2026-XXX). No work begins without a signed agreement.',AM:'አዎ። ሁሉም ፕሮጀክቶች signed GILD Service Agreement ያካትታሉ። LinkedIn ላይ ስናወራ Contract ID ይልካሉ (GILD-2026-XXX)।'}},
];

// ── ONBOARDING STEPS ──────────────────────
const OB_STEPS = [
  { key:'businessType', type:'choice',
    q:   {EN:'What type of business are you?',              AM:'ምን አይነት ቢዝነስ ነዎት?'},
    sub: {EN:'This helps us tailor our approach perfectly.', AM:'አቀራረባችንን ለማስተካከል ይረዳናል።'},
    options:[
      {label:{EN:'New / Pre-Launch',              AM:'አዲስ / ቅድመ-ጅምር'},        sub:{EN:'Starting or about to launch',             AM:'ጀምሮ ወይም ሊጀምር ነው'}},
      {label:{EN:'Small / Growing Business',      AM:'ትንሽ / እያደገ ቢዝነስ'},      sub:{EN:'Operating, ready to scale',              AM:'ሠርቷል፣ ሊጎለምስ ዝግጁ'}},
      {label:{EN:'Established Business',          AM:'ያደገ ቢዝነስ'},              sub:{EN:'Need upgrade or full rebuild',            AM:'ማሻሻያ ወይም ሙሉ rebuild'}},
      {label:{EN:'Professional / Personal Brand', AM:'ፕሮፌሽናል / Personal Brand'},sub:{EN:'Doctor, lawyer, consultant, etc.',        AM:'ዶክተር፣ ጠበቃ፣ አማካሪ ወዘተ'}},
    ]
  },
  { key:'mainGoal', type:'choice',
    q:   {EN:'What is your primary goal?',                    AM:'ዋና ግብዎ ምንድነው?'},
    sub: {EN:'Select the outcome that matters most right now.',AM:'አሁን ቅድሚያ የሚሰጠውን ውጤት ይምረጡ።'},
    options:[
      {label:{EN:'Build my brand identity',          AM:'ብራንዴን ወደ ልቀት ከፍ አደርጋሁ'},   sub:{EN:'Logo, colours, visual system',              AM:'ሎጎ፣ ቀለሞች፣ visual system'}},
      {label:{EN:'Get a professional website',       AM:'ፕሮፌሽናል ዌብሳይት ፈልጋሁ'},        sub:{EN:'Landing page or full business site',       AM:'Landing page ወይም ሙሉ ዌብሳይት'}},
      {label:{EN:'Automate my operations',           AM:'ሥራዎቼን አውቶሜት አደርጋሁ'},        sub:{EN:'Bots, CRM, workflows, dashboards',         AM:'Bots, CRM, workflows, dashboards'}},
      {label:{EN:'Complete digital transformation',  AM:'ሙሉ ዲጂታል ለውጥ'},              sub:{EN:'Everything — brand to backend',            AM:'ሁሉም — ብራንድ እስከ backend'}},
    ]
  },
  { key:'timeline', type:'choice',
    q:   {EN:'What is your timeline?',                 AM:'የጊዜ ሰሌዳዎ ምንድነው?'},
    sub: {EN:'When do you need your build completed?', AM:'ሲጠናቀቅ የሚፈልጉት መቼ ነው?'},
    options:[
      {label:{EN:'As soon as possible', AM:'በተቻለ ፍጥነት'},   sub:{EN:'Urgent — ready to move now', AM:'አስቸኳይ — አሁን ዝግጁ'}},
      {label:{EN:'Within 1 month',      AM:'ያለ 1 ወር'},       sub:{EN:'Standard timeline',         AM:'መደበኛ ጊዜ ሰሌዳ'}},
      {label:{EN:'Within 3 months',     AM:'ያለ 3 ወሮች'},      sub:{EN:'Planning ahead',            AM:'አስቀድሞ እቅድ'}},
      {label:{EN:'Flexible',            AM:'ተለዋዋጭ'},         sub:{EN:'No hard deadline',          AM:'ጠንካራ ቀነ-ገደብ የለም'}},
    ]
  },
  { key:'budget', type:'choice',
    q:   {EN:'What is your investment range?',              AM:'የኢንቨስትመንት ክልልዎ ምን ያህል ነው?'},
    sub: {EN:'Helps us recommend the right package for you.',AM:'ትክክለኛ ጥቅሉን ለመምከር ይረዳናል።'},
    options:[
      {label:{EN:'Under $200',         AM:'ከ $200 በታች'},     sub:{EN:'Single service',            AM:'ነጠላ አገልግሎት'}},
      {label:{EN:'$200 – $500',        AM:'$200 – $500'},      sub:{EN:'Entry-level build',         AM:'Entry-level build'}},
      {label:{EN:'$500 – $1,500',      AM:'$500 – $1,500'},    sub:{EN:'Full foundation',           AM:'ሙሉ foundation'}},
      {label:{EN:'$1,500 – $3,000',    AM:'$1,500 – $3,000'},  sub:{EN:'Complete ecosystem',        AM:'ሙሉ ecosystem'}},
      {label:{EN:'$3,000+',            AM:'$3,000+'},          sub:{EN:'Enterprise transformation', AM:'Enterprise transformation'}},
    ]
  },
  { key:'hearAbout', type:'choice',
    q:   {EN:'How did you hear about GILD?',                              AM:'GILD ን እንዴት ሰሙ?'},
    sub: {EN:'Helps us understand where our clients come from.',           AM:'ደንበኞቻችን ከየት እንደሚመጡ ይረዳናል።'},
    options:[
      {label:{EN:'Instagram',       AM:'Instagram'},      sub:{EN:'@gild_agency',    AM:'@gild_agency'}},
      {label:{EN:'Telegram',        AM:'Telegram'},       sub:{EN:'@gild_agency',    AM:'@gild_agency'}},
      {label:{EN:'Referral',        AM:'ሌላ ሰው ነገረኝ'},  sub:{EN:'Someone told me', AM:'ሌላ ሰው ነገረኝ'}},
      {label:{EN:'Google / Search', AM:'Google ፍለጋ'},    sub:{EN:'Found online',    AM:'ኦንላይን አገኘሁ'}},
      {label:{EN:'Other',           AM:'ሌላ'},            sub:{EN:'Another way',     AM:'ሌላ መንገድ'}},
    ]
  },
  { key:'paymentMethod', type:'payment',
    q:   {EN:'Where are you located?',                                     AM:'የት ነዎት?'},
    sub: {EN:'This determines your available payment methods.',             AM:'ይህ ክፍያ ዘዴዎዎን ይወስናሉ።'},
  },
];

// ── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(STATE.theme);
  applyLang();
  applyCurr();
  initLoader();
  initCursor();
  initParticles();
  initCounters();
  initScrollReveal();
  buildFAQ();
  buildPackages();
  buildServices('all');
  showSec('about');
  initNavScroll();
  document.getElementById('signupBackBtn').addEventListener('click', () => {
    goTo(STATE.prevPage || 'pg-select');
  });
});

// ── LOADER ────────────────────────────────
function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('out'), 2400);
  });
}

// ── CURSOR ────────────────────────────────
function initCursor() {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'));
  (function loop() {
    rx += (mx-rx)*.12; ry += (my-ry)*.12;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(loop);
  })();
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,[onclick],.pkg-card,.svc-card,.sel-card,.plat-card,.pillar,.ob-choice,.ob-pay-card,.faq-item,.diff-card'))
      document.body.classList.add('cur-big');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,[onclick],.pkg-card,.svc-card,.sel-card,.plat-card,.pillar,.ob-choice,.ob-pay-card,.faq-item,.diff-card'))
      document.body.classList.remove('cur-big');
  });
}

// ── PARTICLES ─────────────────────────────
function initParticles() {
  const cv = document.getElementById('particles');
  const cx = cv.getContext('2d');
  let pts = [];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random()*cv.width; this.y = Math.random()*cv.height;
      this.r = Math.random()*1.4+.3;
      this.vx = (Math.random()-.5)*.25; this.vy = (Math.random()-.5)*.25-.05;
      this.o = Math.random()*.32+.05;
      this.life = 0; this.max = Math.random()*220+140;
    }
    tick() { this.x+=this.vx; this.y+=this.vy; this.life++; if(this.life>this.max||this.y<-5) this.reset(); }
    draw() { cx.save(); cx.globalAlpha=this.o*(1-this.life/this.max); cx.fillStyle='#d4af37'; cx.beginPath(); cx.arc(this.x,this.y,this.r,0,Math.PI*2); cx.fill(); cx.restore(); }
  }
  for (let i=0;i<65;i++) pts.push(new P());
  (function frame(){ cx.clearRect(0,0,cv.width,cv.height); pts.forEach(p=>{p.tick();p.draw();}); requestAnimationFrame(frame); })();
}

// ── COUNTERS ──────────────────────────────
function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || e.target.dataset.done) return;
      e.target.dataset.done = 1;
      const target = +e.target.dataset.target;
      const dur = target > 50 ? 1800 : 1000;
      const t0 = performance.now();
      (function tick(now) {
        const p = Math.min((now-t0)/dur,1);
        const ease = 1-Math.pow(1-p,3);
        e.target.textContent = Math.floor(ease*target);
        if (p < 1) requestAnimationFrame(tick);
        else e.target.textContent = target;
      })(performance.now());
    });
  }, {threshold:.5});
  document.querySelectorAll('[data-target]').forEach(c => io.observe(c));
}

// ── SCROLL REVEAL ─────────────────────────
function initScrollReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, {threshold:.1});
  document.querySelectorAll('.fu').forEach(el => io.observe(el));
}

// ── NAV SCROLL ────────────────────────────
function initNavScroll() {
  window.addEventListener('scroll', () => {
    document.querySelectorAll('.mnav').forEach(n => n.classList.toggle('scrolled', scrollY>40));
  });
}

// ── PAGE NAVIGATION ───────────────────────
function goTo(id) {
  const cur = document.querySelector('.page.active');
  const tgt = document.getElementById(id);
  if (!cur || !tgt || cur===tgt) return;
  STATE.prevPage = cur.id;
  cur.classList.add('p-out');
  setTimeout(() => {
    cur.classList.remove('active','p-out');
    tgt.classList.add('active','p-in');
    setTimeout(() => tgt.classList.remove('p-in'), 550);
    window.scrollTo({top:0, behavior:'smooth'});
    STATE.page = id;
  }, 340);
}

// ── SECTIONS ──────────────────────────────
function showSec(name) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nl').forEach(b => b.classList.remove('active'));
  const sec = document.getElementById('sec-'+name);
  if (sec) sec.classList.add('active');
  const btn = document.querySelector(`.nl[onclick*="${name}"]`);
  if (btn) btn.classList.add('active');
  STATE.section = name;
  if (!document.getElementById('pg-main').classList.contains('active')) goTo('pg-main');
  setTimeout(() => sec?.scrollIntoView({behavior:'smooth', block:'start'}), 420);
}

// ── FAQ ───────────────────────────────────
function buildFAQ() {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.innerHTML = FAQS.map((f,i) => `
    <div class="faq-item" onclick="toggleFAQ(${i})">
      <div class="faq-q"><span>${f.q[STATE.lang]}</span><span class="faq-arrow">▾</span></div>
      <div class="faq-a">${f.a[STATE.lang]}</div>
    </div>
  `).join('');
}
function toggleFAQ(i) {
  const items = document.querySelectorAll('.faq-item');
  const isOpen = items[i].classList.contains('open');
  items.forEach(it => it.classList.remove('open'));
  if (!isOpen) items[i].classList.add('open');
}

// ── PACKAGES ──────────────────────────────
function buildPackages() {
  const grid = document.getElementById('pkgGrid');
  if (!grid) return;
  const L = STATE.lang; const C = STATE.curr;

  grid.innerHTML = PACKAGES.map(p => {
    const priceDisplay = C === 'USD' ? p.usd : p.etb.split(' ')[0]+' ETB';
    const subDisplay   = C === 'USD' ? '≈ '+p.etb : p.delivery[L];
    const perksHTML = p.perks.map(k => `
      <li>
        <div>
          <strong>${k.label[L]}</strong>
          <span>${k.detail[L]}</span>
        </div>
      </li>
    `).join('');

    return `
      <div class="pkg-card ${p.featured?'featured':''}" onclick="showPkgDetail('${p.id}')">
        ${p.featured ? '<div class="pkg-popular">Most Popular</div>' : ''}
        <div class="pkg-top">
          <span class="pkg-tier">${p.tier[L]}</span>
          <div class="pkg-name">${p.name}</div>
          <div class="pkg-tagline">${p.tagline[L]}</div>
          <div class="pkg-price">${priceDisplay}</div>
          <div class="pkg-delivery">${p.delivery[L]}</div>
          <div class="pkg-desc-block"><p>${p.desc[L]}</p></div>
          <ul class="pkg-perks">${perksHTML}</ul>
        </div>
        <div class="pkg-cta-btn">
          <span>${L==='EN'?'See Full Details':'ሙሉ ዝርዝር ይመልከቱ'}</span>
          <span class="pkg-arrow">→</span>
        </div>
      </div>
    `;
  }).join('');
}

function showPkgDetail(id) {
  const pkg = PACKAGES.find(p => p.id===id);
  if (!pkg) return;
  const L = STATE.lang; const C = STATE.curr;

  const incs = pkg.includes.map(inc => `
    <div class="detail-sec">
      <div class="detail-sec-title">${inc.title[L]}</div>
      <ul class="detail-list" style="margin-bottom:10px">
        <li style="background:rgba(212,175,55,.06);border-color:rgba(212,175,55,.2);font-style:italic">
          <span style="color:var(--gold);font-size:7px;flex-shrink:0;margin-top:4px">✦</span>
          ${inc.why[L]}
        </li>
      </ul>
      <ul class="detail-list">
        ${inc.items.map(it=>`<li>${it[L]}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  document.getElementById('pkgDetailWrap').innerHTML = `
    <div class="detail-badge">${pkg.tier[L]}</div>
    <h1 class="detail-title">${pkg.name}</h1>
    <div class="detail-tagline">${pkg.tagline[L]}</div>
    <div class="detail-price">${C==='USD'?pkg.usd:pkg.etb.split(' ')[0]+' ETB'}</div>
    <div class="detail-price-etb">${L==='EN'?'Delivery:':'ዲሊቨሪ:'} ${pkg.delivery[L]}</div>
    <p class="detail-desc">${pkg.desc[L]}</p>
    ${incs}
    <div class="detail-actions">
      <button class="btn-ghost" onclick="goTo('pg-packages')">${L==='EN'?'← Back to Packages':'← ወደ ጥቅሎች'}</button>
      <button class="btn-gold" style="opacity:1;animation:none" onclick="startBooking('${pkg.id}','package')">${L==='EN'?'Secure Your Slot →':'ቦታዎን ያስጠብቁ →'}</button>
    </div>
  `;
  goTo('pg-pkg-detail');
}

// ── SERVICES ──────────────────────────────
function buildServices(filter='all') {
  const grid = document.getElementById('svcGrid');
  if (!grid) return;
  const L = STATE.lang; const C = STATE.curr;
  const list = filter==='all' ? SERVICES : SERVICES.filter(s=>s.cat===filter);
  grid.innerHTML = list.map(s => `
    <div class="svc-card" onclick="showSvcDetail('${s.id}')">
      <span class="svc-icon">${s.icon}</span>
      <span class="svc-cat">${s.cat.toUpperCase()}</span>
      <div class="svc-name">${s.name[L]}</div>
      <div class="svc-desc">${s.desc[L]}</div>
      <div class="svc-bottom">
        <div class="svc-price">${C==='USD'?s.usd:s.etb}</div>
        <div class="svc-time">${s.days[L]}</div>
      </div>
    </div>
  `).join('');
}
function filterSvc(cat, btn) {
  document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  buildServices(cat);
}
function showSvcDetail(id) {
  const svc = SERVICES.find(s=>s.id===id);
  if (!svc) return;
  const L = STATE.lang; const C = STATE.curr;
  document.getElementById('svcDetailWrap').innerHTML = `
    <div class="detail-badge">${svc.cat.toUpperCase()}</div>
    <h1 class="detail-title">${svc.name[L]}</h1>
    <div class="detail-price">${C==='USD'?svc.usd:svc.etb}</div>
    <div class="detail-price-etb">${L==='EN'?'Delivery:':'ዲሊቨሪ:'} ${svc.days[L]}</div>
    <p class="detail-desc">${svc.desc[L]}</p>
    <div class="detail-sec">
      <div class="detail-sec-title">${L==='EN'?'WHY YOU NEED THIS':'ለምን ያስፈልጋሉ'}</div>
      <ul class="detail-list">
        <li style="font-style:italic;background:rgba(212,175,55,.06);border-color:rgba(212,175,55,.2)">
          <span style="color:var(--gold);flex-shrink:0">✦</span>${svc.why[L]}
        </li>
      </ul>
    </div>
    <div class="detail-sec" style="margin-top:20px">
      <div class="detail-sec-title">${L==='EN'?"WHAT'S INCLUDED":'ምን ይካተታሉ'}</div>
      <ul class="detail-list">${svc.includes.map(it=>`<li>${it[L]}</li>`).join('')}</ul>
    </div>
    <div class="detail-actions">
      <button class="btn-ghost" onclick="goTo('pg-services')">${L==='EN'?'← Back to Services':'← ወደ አገልግሎቶች'}</button>
      <button class="btn-gold" style="opacity:1;animation:none" onclick="startBooking('${svc.id}','service')">${L==='EN'?'Secure Your Slot →':'ቦታዎን ያስጠብቁ →'}</button>
    </div>
  `;
  goTo('pg-svc-detail');
}

// ══════════════════════════════════════════
//  OTP — SIGN UP FLOW
// ══════════════════════════════════════════
let _resendTimer = null;

function showSuStep(n) {
  document.getElementById('su-step-1').style.display = n===1 ? 'block' : 'none';
  document.getElementById('su-step-2').style.display = n===2 ? 'block' : 'none';
}

async function sendOTP() {
  const name  = document.getElementById('su-name').value.trim();
  const biz   = document.getElementById('su-biz').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const pass  = document.getElementById('su-pass').value;
  const errEl = document.getElementById('suErr');
  const L     = STATE.lang;

  // Validation
  if (!name || !email || !pass) {
    errEl.textContent = L==='EN' ? 'Please fill in all required fields.' : 'እባክዎ ሁሉም ግዴታ fields ይሙሉ።';
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errEl.textContent = L==='EN' ? 'Please enter a valid email address.' : 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።';
    return;
  }
  if (pass.length < 8) {
    errEl.textContent = L==='EN' ? 'Password must be at least 8 characters.' : 'የምስጢር ቃሉ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባሉ።';
    return;
  }

  const btn = document.getElementById('suSendOtpBtn');
  btn.textContent = L==='EN' ? 'Sending…' : 'እየላኩ ነን…';
  btn.disabled = true;
  errEl.textContent = '';

  const code = genOTP();
  _OTP.set(code, email);

  try {
    await emailjs.send(EJ.service, EJ.otpTemplate, {
      user_name:    name,
      user_email:   email,
      otp_code:     code,
      submitted_at: new Date().toLocaleString(),
    });

    // Store pending user (no password stored in plain text — just session)
    STATE.user = { name, biz, email };
    document.getElementById('otpEmailDisplay').textContent = email;
    showSuStep(2);
    startResendTimer('resendBtn','resendTimer');

  } catch (err) {
    errEl.textContent = L==='EN' ? 'Failed to send code. Please try again.' : 'ኮድ ለመላክ አልተሳካም። እንደገና ሞክሩ።';
    console.error(err);
  } finally {
    btn.textContent = L==='EN' ? 'Send Verification Code →' : 'የማረጋገጫ ኮድ ላክ →';
    btn.disabled = false;
  }
}

function verifyOTP() {
  const input = document.getElementById('su-otp').value.trim();
  const errEl = document.getElementById('otpErr');
  const L     = STATE.lang;

  if (!input) {
    errEl.textContent = L==='EN' ? 'Please enter the verification code.' : 'እባክዎ የማረጋገጫ ኮዱን ያስገቡ።';
    return;
  }
  if (!_OTP.verify(input)) {
    errEl.textContent = L==='EN' ? 'Invalid code. Please try again.' : 'ትክክለኛ ያልሆነ ኮድ። እንደገና ሞክሩ።';
    document.getElementById('su-otp').value = '';
    return;
  }

  _OTP.clear();
  errEl.textContent = '';
  // Save user to localStorage
  localStorage.setItem('gild_user', JSON.stringify(STATE.user));
  startOnboarding();
}

async function resendOTP() {
  const email = _OTP.getEmail() || STATE.user?.email;
  const name  = STATE.user?.name || 'User';
  if (!email) return;
  const code = genOTP();
  _OTP.set(code, email);
  try {
    await emailjs.send(EJ.service, EJ.otpTemplate, {
      user_name:    name,
      user_email:   email,
      otp_code:     code,
      submitted_at: new Date().toLocaleString(),
    });
    startResendTimer('resendBtn','resendTimer');
  } catch(err){ console.error(err); }
}

// ── RESEND TIMER ──────────────────────────
function startResendTimer(btnId, timerId) {
  const btn   = document.getElementById(btnId);
  const timer = document.getElementById(timerId);
  if (!btn || !timer) return;
  btn.disabled = true;
  let secs = 60;
  timer.textContent = secs+'s';
  if (_resendTimer) clearInterval(_resendTimer);
  _resendTimer = setInterval(() => {
    secs--;
    timer.textContent = secs+'s';
    if (secs <= 0) {
      clearInterval(_resendTimer);
      btn.disabled = false;
      timer.textContent = '';
    }
  }, 1000);
}

// ── LOGIN ─────────────────────────────────
function handleLogin() {
  const email = document.getElementById('li-email').value.trim();
  const pass  = document.getElementById('li-pass').value;
  const errEl = document.getElementById('liErr');
  const L     = STATE.lang;

  if (!email || !pass) {
    errEl.textContent = L==='EN' ? 'Please fill in all fields.' : 'እባክዎ ሁሉም fields ይሙሉ።';
    return;
  }
  const stored = JSON.parse(localStorage.getItem('gild_user') || 'null');
  if (!stored || stored.email !== email) {
    errEl.textContent = L==='EN' ? 'Account not found. Please sign up first.' : 'መለያ አልተገኘም። እባክዎ ቅድሚያ sign up ያድርጉ።';
    return;
  }
  STATE.user = stored;
  errEl.textContent = '';
  startOnboarding();
}

// ══════════════════════════════════════════
//  PASSWORD RESET FLOW
// ══════════════════════════════════════════
let _fpResendTimer = null;

function showFpStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById('fp-step-'+i);
    if (el) el.style.display = i===n ? 'block' : 'none';
  });
}

async function sendResetCode(isResend=false) {
  const email = (document.getElementById('fp-email')?.value.trim()) || _RESET.getEmail();
  const errEl = document.getElementById('fpErr1');
  const L     = STATE.lang;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    if (errEl) errEl.textContent = L==='EN' ? 'Please enter a valid email address.' : 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።';
    return;
  }

  const code = genOTP();
  _RESET.set(code, email);

  try {
    await emailjs.send(EJ.service, EJ.resetTemplate, {
      user_name:    email.split('@')[0],
      user_email:   email,
      reset_code:   code,
      submitted_at: new Date().toLocaleString(),
    });
    showFpStep(2);
    startResendTimer('fpResendBtn','fpResendTimer');
    if (document.getElementById('fpErr2')) document.getElementById('fpErr2').textContent = '';
  } catch(err) {
    if (errEl) errEl.textContent = L==='EN' ? 'Failed to send code. Please try again.' : 'ኮድ ለመላክ አልተሳካም።';
    console.error(err);
  }
}

function verifyResetCode() {
  const code    = document.getElementById('fp-code').value.trim();
  const newpass = document.getElementById('fp-newpass').value;
  const errEl   = document.getElementById('fpErr2');
  const L       = STATE.lang;

  if (!code) { errEl.textContent = L==='EN'?'Please enter the reset code.':'እባክዎ reset ኮዱን ያስገቡ።'; return; }
  if (!_RESET.verify(code)) { errEl.textContent = L==='EN'?'Invalid or expired code.':'ትክክለኛ ያልሆነ ወይም ጊዜ ያለፈ ኮድ።'; return; }
  if (newpass.length < 8)   { errEl.textContent = L==='EN'?'Password must be at least 8 characters.':'ቢያንስ 8 ቁምፊዎች ያስፈልጋሉ።'; return; }

  _RESET.clear();
  errEl.textContent = '';

  // Update stored user password (localStorage only — real backend later)
  const stored = JSON.parse(localStorage.getItem('gild_user') || '{}');
  stored.pass = btoa(newpass); // base64 encode (not secure — placeholder)
  localStorage.setItem('gild_user', JSON.stringify(stored));

  showFpStep(3);
}

// ══════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════
function startBooking(itemId, itemType) {
  STATE.payItem = itemId; STATE.payType = itemType;
  STATE.ob = {}; STATE.obStep = 1;
  if (STATE.user) startOnboarding();
  else goTo('pg-signup');
}

function startOnboarding() {
  STATE.obStep = 1; STATE.ob = {};
  renderObStep();
  goTo('pg-onboard');
}

function renderObStep() {
  const step  = OB_STEPS[STATE.obStep-1];
  const total = OB_STEPS.length;
  const L     = STATE.lang;

  // Progress bar
  const pct = ((STATE.obStep-1)/total)*100;
  document.getElementById('obFill').style.width = pct+'%';
  document.getElementById('obStepTxt').textContent = L==='EN'
    ? `Step ${STATE.obStep} of ${total}`
    : `ደረጃ ${STATE.obStep} ከ ${total}`;

  let bodyHTML = '';
  if (step.type === 'choice') {
    bodyHTML = `
      <div class="ob-choices">
        ${step.options.map((opt,i)=>`
          <div class="ob-choice ${STATE.ob[step.key]===i?'selected':''}" onclick="selectOb(${i})">
            <div class="ob-choice-radio"></div>
            <div class="ob-choice-text">
              <strong>${opt.label[L]}</strong>
              <span>${opt.sub[L]}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (step.type === 'payment') {
    const sel = STATE.ob[step.key];
    bodyHTML = `
      <div class="ob-pay-grid">
        <div class="ob-pay-card ${sel==='ethiopia'?'selected':''}" onclick="selectPay('ethiopia')">
          <span class="ob-pay-icon">🇪🇹</span>
          <div class="ob-pay-name">${L==='EN'?'Ethiopia':'ኢትዮጵያ'}</div>
          <div class="ob-pay-desc">${L==='EN'?'TeleBirr · Bank Transfer':'TeleBirr · ባንክ ዝውውር'}</div>
        </div>
        <div class="ob-pay-card ${sel==='international'?'selected':''}" onclick="selectPay('international')">
          <span class="ob-pay-icon">🌍</span>
          <div class="ob-pay-name">${L==='EN'?'International':'ዓለምአቀፍ'}</div>
          <div class="ob-pay-desc">${L==='EN'?'Crypto Only (USDT · BTC)':'Crypto ብቻ (USDT · BTC)'}</div>
        </div>
      </div>
      ${sel==='international' ? `
        <div class="ob-pay-note">
          🔐 <strong style="color:var(--gold)">${L==='EN'?'Why Crypto?':'ለምን Crypto?'}</strong><br>
          ${L==='EN'
            ? 'Cryptocurrency ensures secure, borderless transactions with no intermediary delays. We accept USDT (TRC-20 or ERC-20) and BTC.'
            : 'Cryptocurrency ደህንነቱ የተጠበቀ፣ ምንም intermediary ሳይኖር ዓለምአቀፍ ክፍያ ያረጋግጣቸዋሉ። USDT (TRC-20 ወይም ERC-20) እና BTC እንቀበላለን።'}
        </div>` : ''}
    `;
  }

  const isLast  = STATE.obStep === total;
  const isFirst = STATE.obStep === 1;

  document.getElementById('obCard').innerHTML = `
    <span class="ob-step-num">${L==='EN'?`Step ${STATE.obStep} of ${total}`:`ደረጃ ${STATE.obStep}`}</span>
    <h2 class="ob-q">${step.q[L]}</h2>
    <p class="ob-sub">${step.sub[L]}</p>
    ${bodyHTML}
    <div class="ob-nav">
      ${!isFirst
        ? `<button class="btn-ob-back" onclick="obBack()">${L==='EN'?'← Back':'← ወደ ኋላ'}</button>`
        : '<span></span>'}
      <button class="btn-ob-next" onclick="obNext()">
        ${isLast
          ? (L==='EN'?'Complete & Connect →':'አጠናቅቅ እና ያገናኙ →')
          : (L==='EN'?'Continue →':'ቀጥሉ →')}
      </button>
    </div>
  `;
}

function selectOb(idx) {
  STATE.ob[OB_STEPS[STATE.obStep-1].key] = idx;
  renderObStep();
}
function selectPay(val) {
  STATE.ob['paymentMethod'] = val;
  renderObStep();
}

function obNext() {
  const step = OB_STEPS[STATE.obStep-1];
  if (step.type==='choice' && STATE.ob[step.key]===undefined) {
    const card = document.getElementById('obCard');
    card.style.outline = '2px solid rgba(212,175,55,.5)';
    setTimeout(()=>card.style.outline='', 1200);
    return;
  }
  if (step.type==='payment' && !STATE.ob['paymentMethod']) return;

  if (STATE.obStep === OB_STEPS.length) showConfirmation();
  else { STATE.obStep++; renderObStep(); }
}
function obBack() {
  if (STATE.obStep > 1) { STATE.obStep--; renderObStep(); }
}

// ── CONFIRMATION ──────────────────────────
async function showConfirmation() {
  const L   = STATE.lang;
  const u   = STATE.user || {name:'',biz:'',email:''};
  const ob  = STATE.ob;

  // Build readable answers
  const getLabel = (stepKey, idx) => {
    const step = OB_STEPS.find(s=>s.key===stepKey);
    return step && idx!==undefined ? step.options[idx]?.label?.EN || '—' : '—';
  };

  const itemName = STATE.payType==='package'
    ? (PACKAGES.find(p=>p.id===STATE.payItem)?.name || '—')
    : (SERVICES.find(s=>s.id===STATE.payItem)?.name?.[L] || '—');

  const summary = {
    Name:     u.name  || '—',
    Business: u.biz   || '—',
    Email:    u.email || '—',
    Selected: itemName,
    Goal:     getLabel('mainGoal',   ob['mainGoal']),
    Timeline: getLabel('timeline',   ob['timeline']),
    Budget:   getLabel('budget',     ob['budget']),
    Payment:  ob['paymentMethod']==='ethiopia' ? 'TeleBirr / Bank Transfer' : 'Cryptocurrency (USDT / BTC)',
  };

  document.getElementById('confirmSummary').innerHTML =
    Object.entries(summary).map(([k,v])=>`
      <div class="cs-row">
        <span class="label">${k}</span>
        <span class="value">${v}</span>
      </div>
    `).join('');

  // LinkedIn button
  document.getElementById('linkedinBtn').onclick = () => sendAndRedirect(u, ob, itemName, summary);

  // Save to Firebase
  await saveToFirebase(u, ob, itemName, summary);

  goTo('pg-confirm');
}

// ── FIREBASE SAVE ─────────────────────────
async function saveToFirebase(u, ob, itemName, summary) {
  try {
    const db        = window.__gildDB;
    const addDoc    = window.__gildAddDoc;
    const coll      = window.__gildColl;
    const timestamp = window.__gildTimestamp;

    if (!db) return;

    await addDoc(coll(db,'onboarding_submissions'), {
      name:          u.name   || '',
      business:      u.biz    || '',
      email:         u.email  || '',
      itemId:        STATE.payItem || '',
      itemType:      STATE.payType || '',
      itemName:      itemName || '',
      goal:          summary.Goal     || '',
      timeline:      summary.Timeline || '',
      budget:        summary.Budget   || '',
      paymentMethod: summary.Payment  || '',
      language:      STATE.lang,
      status:        'pending',
      createdAt:     timestamp(),
    });
  } catch(err) {
    console.error('Firebase save error:', err);
  }
}

// ── SEND EMAIL + OPEN LINKEDIN ────────────
async function sendAndRedirect(u, ob, itemName, summary) {
  const L   = STATE.lang;
  const btn = document.getElementById('linkedinBtn');
  btn.style.opacity = '.7';
  btn.querySelector('span:last-child').textContent = L==='EN'?'Sending…':'እየላኩ ነን…';

  const getLabel = (key, idx) => {
    const step = OB_STEPS.find(s=>s.key===key);
    return step && idx!==undefined ? step.options[idx]?.label?.EN || '—' : '—';
  };

  const params = {
    to_email:     'gild.agency.et@gmail.com',
    from_name:    u.name   || 'Unknown',
    from_biz:     u.biz    || '—',
    from_email:   u.email  || '—',
    item_name:    itemName || '—',
    item_type:    STATE.payType || '—',
    goal:         summary.Goal     || '—',
    timeline:     summary.Timeline || '—',
    budget:       summary.Budget   || '—',
    payment:      summary.Payment  || '—',
    biz_type:     getLabel('businessType', ob['businessType']),
    hear_about:   getLabel('hearAbout',    ob['hearAbout']),
    submitted_at: new Date().toLocaleString(),
  };

  try {
    await emailjs.send(EJ.service, EJ.notifyTemplate, params);
  } catch(err){ console.error(err); }

  window.open('https://www.linkedin.com/in/YOUR_LINKEDIN_HANDLE','_blank');

  btn.style.opacity  = '1';
  btn.style.background = 'linear-gradient(135deg,#0077b5,#005fa3)';
  btn.querySelector('span:last-child').textContent = L==='EN'?'Sent — LinkedIn Opened ✓':'ተላኩ — LinkedIn ተከፈተ ✓';
  btn.onclick = null;
}

// ══════════════════════════════════════════
//  3D TILT
// ══════════════════════════════════════════
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.sel-card').forEach((card,i) => {
    const rect   = card.getBoundingClientRect();
    const inside = e.clientX>=rect.left && e.clientX<=rect.right && e.clientY>=rect.top && e.clientY<=rect.bottom;
    if (inside) {
      const x = (e.clientX-rect.left)/rect.width-.5;
      const y = (e.clientY-rect.top)/rect.height-.5;
      const dir = i%2===0?-1:1;
      card.style.transform = `rotateY(${dir*x*14}deg) rotateX(${y*-12}deg) translateY(-12px) scale(1.025)`;
      const sh = card.querySelector('.sel-shine');
      if (sh) { sh.style.background=`radial-gradient(circle at ${(x+.5)*100}% ${(y+.5)*100}%,rgba(212,175,55,.18) 0%,transparent 65%)`; sh.style.opacity='1'; }
    } else {
      card.style.transform = '';
      const sh = card.querySelector('.sel-shine');
      if (sh) sh.style.opacity='0';
    }
  });
});

// ══════════════════════════════════════════
//  THEME / LANG / CURRENCY
// ══════════════════════════════════════════
function toggleTheme() {
  STATE.theme = STATE.theme==='dark'?'light':'dark';
  localStorage.setItem('gild_theme', STATE.theme);
  applyTheme(STATE.theme);
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme',t);
  const b = document.getElementById('themeBtn');
  if (b) b.textContent = t==='dark'?'☀️':'🌙';
}

function toggleLang() {
  STATE.lang = STATE.lang==='EN'?'AM':'EN';
  localStorage.setItem('gild_lang', STATE.lang);
  applyLang();
}
function applyLang() {
  const L = STATE.lang;
  document.querySelectorAll('[data-en]').forEach(el => {
    const v = el.getAttribute('data-'+L.toLowerCase());
    if (v) el.innerHTML = v;
  });
  document.querySelectorAll('#langBtn').forEach(b => b.textContent = L);
  buildFAQ(); buildPackages(); buildServices('all');
}

function toggleCurr() {
  STATE.curr = STATE.curr==='USD'?'ETB':'USD';
  localStorage.setItem('gild_curr', STATE.curr);
  applyCurr();
}
function applyCurr() {
  const b = document.getElementById('currBtn');
  if (b) b.textContent = STATE.curr;
  buildPackages(); buildServices('all');
}

function toggleMob() {
  document.getElementById('mobMenu').classList.toggle('open');
}
