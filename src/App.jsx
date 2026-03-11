import { useState, useEffect, useRef } from "react";

// ─── SCENARIOS ────────────────────────────────────────────────────────────────
// Each scenario simulates a browser tab the player must judge as SAFE or UNSAFE
const SCENARIOS = [
  // ── LEVEL 1: ROOKIE ──────────────────────────────────────────────────────
  {
    id: 1, level: 1, difficulty: "Rookie",
    isSafe: false,
    ssl: false,
    url: "http://bankofamerica-secure-login.com/account/verify",
    displayUrl: "http://bankofamerica-secure-login.com/account/verify",
    favicon: "🏦", pageTitle: "Bank of America – Secure Login",
    sslLabel: "Not Secure",
    sslColor: "#ef4444",
    pageContent: {
      header: "Bank of America",
      subheader: "Secure Account Verification",
      body: "Your account has been temporarily suspended due to unusual activity. Please verify your identity to restore access.",
      form: true,
      formFields: ["Email Address", "Password", "Social Security Number", "Card Number"],
      submitLabel: "Verify My Account",
      footerText: "© 2026 Bank of America Corporation. Member FDIC.",
    },
    redFlags: [
      { icon: "🔓", title: "No HTTPS", detail: "The URL starts with 'http://' not 'https://'. Real banks always use HTTPS to encrypt your connection." },
      { icon: "🌐", title: "Fake domain", detail: "'bankofamerica-secure-login.com' is NOT Bank of America's domain. The real site is bankofamerica.com." },
      { icon: "📋", title: "Requesting SSN & card number", detail: "Legitimate banks never ask for your Social Security Number and card number on a login page." },
      { icon: "🚨", title: "Urgency tactic", detail: "'Account suspended' is a classic scare tactic to rush you into acting without thinking." },
    ],
    lesson: "Real bank sites always use HTTPS and their exact official domain (bankofamerica.com, not any variation). Never enter financial details on a page without a padlock.",
    points: 100,
  },
  {
    id: 2, level: 1, difficulty: "Rookie",
    isSafe: true,
    ssl: true,
    url: "https://www.wikipedia.org/wiki/Cybersecurity",
    displayUrl: "https://www.wikipedia.org/wiki/Cybersecurity",
    favicon: "📖", pageTitle: "Cybersecurity – Wikipedia",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Cybersecurity",
      subheader: "From Wikipedia, the free encyclopedia",
      body: "Cybersecurity, computer security, or information technology security (IT security) is the protection of computer systems and networks from attack by malicious actors that may result in unauthorized information disclosure, theft of, or damage to hardware, software, or data...",
      form: false,
      footerText: "Text is available under the Creative Commons Attribution-ShareAlike License 4.0",
    },
    redFlags: [],
    lesson: "Wikipedia uses HTTPS, its real domain (wikipedia.org), no login pressure, and asks for no personal information. It's a safe site to read — though always verify citations.",
    points: 80,
  },
  {
    id: 3, level: 1, difficulty: "Rookie",
    isSafe: false,
    ssl: false,
    url: "http://free-iphone-winner.xyz/claim?user=you&prize=confirmed",
    displayUrl: "http://free-iphone-winner.xyz/claim?user=you&prize=confirmed",
    favicon: "🎁", pageTitle: "🎉 Congratulations! You've been selected!",
    sslLabel: "Not Secure",
    sslColor: "#ef4444",
    pageContent: {
      header: "🎉 YOU HAVE BEEN SELECTED!",
      subheader: "Claim Your FREE iPhone 16 Pro Max Now!",
      body: "You are our 1,000,000th visitor! You have been exclusively selected to receive a FREE iPhone 16 Pro Max. This offer expires in 09:47. Enter your details below to claim your prize before it goes to the next winner!",
      form: true,
      formFields: ["Full Name", "Home Address", "Phone Number", "Credit Card (shipping fee $1.99)"],
      submitLabel: "CLAIM MY FREE iPHONE NOW!",
      footerText: "By claiming, you agree to a $89.99/month subscription.",
    },
    redFlags: [
      { icon: "🔓", title: "No HTTPS", detail: "No padlock, plain HTTP — any data you enter can be intercepted." },
      { icon: "🌐", title: "Suspicious .xyz domain", detail: "'.xyz' domains are extremely cheap and commonly used for scam sites. Legitimate companies use .com, .org, etc." },
      { icon: "⏰", title: "Artificial countdown timer", detail: "Fake urgency countdowns are a manipulation tactic to stop you from thinking critically." },
      { icon: "💳", title: "Asking for credit card for 'free' prize", detail: "There is no free prize. The '$1.99 shipping' is a front for a hidden $89.99/month subscription." },
      { icon: "🎉", title: "'You're the millionth visitor' is always fake", detail: "This is one of the oldest scam formats on the web. No one randomly wins prizes for visiting a site." },
    ],
    lesson: "Prize scam pages create excitement and urgency. The '$1.99 shipping fee' trick is used to capture credit card details for unauthorized recurring charges. If it sounds too good to be true, it is.",
    points: 100,
  },

  // ── LEVEL 2: CADET ───────────────────────────────────────────────────────
  {
    id: 4, level: 2, difficulty: "Cadet",
    isSafe: true,
    ssl: true,
    url: "https://github.com/login",
    displayUrl: "https://github.com/login",
    favicon: "🐙", pageTitle: "Sign in to GitHub · GitHub",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Sign in to GitHub",
      subheader: "",
      body: "Welcome back! Sign in to continue to GitHub. Access repositories, manage your code, and collaborate with your team.",
      form: true,
      formFields: ["Username or email address", "Password"],
      submitLabel: "Sign in",
      footerText: "By signing in, you agree to GitHub's Terms of Service and Privacy Policy.",
    },
    redFlags: [],
    lesson: "GitHub's login is at github.com/login — a legitimate domain with valid HTTPS. The form only asks for username and password, which is normal for a login page. No unusual or excessive data collection.",
    points: 80,
  },
  {
    id: 5, level: 2, difficulty: "Cadet",
    isSafe: false,
    ssl: true,
    url: "https://paypal-secure-account.support/login",
    displayUrl: "https://paypal-secure-account.support/login",
    favicon: "💳", pageTitle: "PayPal – Log In",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "PayPal",
      subheader: "Log in to your account",
      body: "Access your PayPal account to send money, pay online, and manage your transactions securely.",
      form: true,
      formFields: ["Email address", "Password"],
      submitLabel: "Log In",
      footerText: "© 2026 PayPal, Inc. All rights reserved.",
    },
    redFlags: [
      { icon: "🌐", title: "Wrong domain — not paypal.com", detail: "The domain is 'paypal-secure-account.support' — NOT 'paypal.com'. PayPal's real login is paypal.com/signin. Attackers register convincing domains." },
      { icon: "🔒", title: "HTTPS doesn't mean safe", detail: "HTTPS only means the connection is encrypted — NOT that the site is legitimate. Scammers can get HTTPS certificates for fake sites too." },
      { icon: "🕵️", title: "Designed to look identical", detail: "This page looks exactly like PayPal. Always verify the domain in the address bar, not the page content or padlock icon." },
    ],
    lesson: "This is the most dangerous misconception: HTTPS (the padlock) does NOT mean a site is safe — it only means the connection is encrypted. Attackers routinely get free HTTPS certificates for phishing sites. Always check the actual domain name.",
    points: 150,
  },
  {
    id: 6, level: 2, difficulty: "Cadet",
    isSafe: false,
    ssl: true,
    url: "https://www.amazon.com.account-update.net/signin",
    displayUrl: "https://www.amazon.com.account-update.net/signin",
    favicon: "📦", pageTitle: "Amazon Sign-In",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "amazon",
      subheader: "Sign in",
      body: "Enter your email or mobile phone number and password to sign in. Your account requires verification due to recent activity.",
      form: true,
      formFields: ["Email or mobile phone number", "Password"],
      submitLabel: "Continue",
      footerText: "© 2026 Amazon.com, Inc. or its affiliates. All rights reserved.",
    },
    redFlags: [
      { icon: "🌐", title: "Subdomain trick — NOT amazon.com", detail: "The real domain here is 'account-update.net'. Having 'amazon.com' as a subdomain (before the real domain) is a classic trick. Always read domain right-to-left from the TLD: account-update.net is the real site." },
      { icon: "🧠", title: "How to read a URL", detail: "In 'www.amazon.com.account-update.net', the actual domain is 'account-update.net'. Everything before it is a subdomain designed to deceive." },
      { icon: "🔒", title: "HTTPS doesn't verify the owner", detail: "The padlock is present but it only encrypts data to 'account-update.net' — not to Amazon." },
    ],
    lesson: "Subdomain spoofing puts the real brand name early in the URL to fool you. The rule: read the domain backwards from the first single slash. Find the TLD (.com, .net, .ph) — the word immediately left of it plus the TLD is the real domain.",
    points: 150,
  },

  // ── LEVEL 3: ANALYST ─────────────────────────────────────────────────────
  {
    id: 7, level: 3, difficulty: "Analyst",
    isSafe: true,
    ssl: true,
    url: "https://accounts.google.com/signin/v2/identifier",
    displayUrl: "https://accounts.google.com/signin/v2/identifier",
    favicon: "🔵", pageTitle: "Sign in – Google Accounts",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Sign in",
      subheader: "Use your Google Account",
      body: "Sign in with your Google account to access Gmail, Drive, YouTube, and all other Google services.",
      form: true,
      formFields: ["Email or phone"],
      submitLabel: "Next",
      footerText: "Before using Google's products and services, please review Google's Privacy Policy and Terms of Service.",
    },
    redFlags: [],
    lesson: "Google's sign-in is at accounts.google.com — a legitimate subdomain of google.com. The URL path '/signin/v2/identifier' is normal. The form only asks for email/phone on the first step, then password separately — standard and secure practice.",
    points: 100,
  },
  {
    id: 8, level: 3, difficulty: "Analyst",
    isSafe: false,
    ssl: true,
    url: "https://secure.dict-gov-ph.online/employee-portal/login",
    displayUrl: "https://secure.dict-gov-ph.online/employee-portal/login",
    favicon: "🏛️", pageTitle: "DICT Employee Portal – Secure Login",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "DICT Philippines",
      subheader: "Employee Portal – Secure Login",
      body: "Access the Department of Information and Communications Technology employee portal. This portal is for authorized DICT personnel only.",
      form: true,
      formFields: ["Employee ID", "Password", "One-Time PIN (sent to your registered phone)"],
      submitLabel: "Access Portal",
      footerText: "DICT Philippines – Building a digitally empowered nation. For IT support, call 1800-DICT-PHL",
      warning: "⚠️ This system is for authorized users only. Unauthorized access is prohibited under RA 10175.",
    },
    redFlags: [
      { icon: "🌐", title: "Not a .gov.ph domain", detail: "The real DICT website is dict.gov.ph. Philippine government sites always use the '.gov.ph' top-level domain. 'dict-gov-ph.online' is a fake domain that mimics it." },
      { icon: "🔠", title: "Hyphens masking the real domain", detail: "'dict-gov-ph' uses hyphens to simulate 'dict.gov.ph' — the real domain is '.online', a commercial TLD anyone can buy." },
      { icon: "🏛️", title: "Philippine gov sites use .gov.ph", detail: "All legitimate Philippine government websites end in .gov.ph: dict.gov.ph, doh.gov.ph, bir.gov.ph. Any variation is fake." },
    ],
    lesson: "In the Philippines, ALL government websites use the .gov.ph domain — there are no exceptions. 'dict-gov-ph.online' mimics the pattern but '.online' is a commercial domain anyone can register. If it doesn't end in .gov.ph, it's not a Philippine government site.",
    points: 175,
  },
  {
    id: 9, level: 3, difficulty: "Analyst",
    isSafe: false,
    ssl: true,
    url: "https://rn-facebook.com/login/",
    displayUrl: "https://rn-facebook.com/login/",
    favicon: "📘", pageTitle: "Facebook – Log In or Sign Up",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "facebook",
      subheader: "Log in to Facebook",
      body: "Connect with friends and the world around you on Facebook. Log in to see photos, updates, and more.",
      form: true,
      formFields: ["Email address or phone number", "Password"],
      submitLabel: "Log In",
      footerText: "© 2026 Meta Platforms, Inc.",
      extraLinks: ["Forgot password?", "Create new account"],
    },
    redFlags: [
      { icon: "🌐", title: "'rn-facebook.com' is not Facebook", detail: "Facebook's domain is facebook.com. 'rn-facebook.com' is a completely different domain — 'rn' likely stands for 'run' or is just a random prefix to grab a cheap domain." },
      { icon: "🎨", title: "Pixel-perfect clones are common", detail: "Attackers copy the entire visual design of Facebook, including colors, fonts, and logos. Visual appearance is NOT a safety indicator." },
      { icon: "🔒", title: "HTTPS on a fake site", detail: "Again — the padlock only means encrypted traffic to the fake domain. Your credentials go to the attacker." },
    ],
    lesson: "Facebook clones are among the most common phishing sites. The only real Facebook is facebook.com (or m.facebook.com on mobile). Any other domain — no matter how similar the page looks — is fake.",
    points: 175,
  },

  // ── LEVEL 4: EXPERT ──────────────────────────────────────────────────────
  {
    id: 10, level: 4, difficulty: "Expert",
    isSafe: true,
    ssl: true,
    url: "https://myaccount.google.com/security-checkup",
    displayUrl: "https://myaccount.google.com/security-checkup",
    favicon: "🔵", pageTitle: "Security Checkup – Google Account",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Security Checkup",
      subheader: "Manage your Google Account security",
      body: "Review and improve the security of your Google Account. Check recent security events, manage which devices have access, and review third-party apps with access to your data.",
      form: false,
      footerText: "Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043",
    },
    redFlags: [],
    lesson: "myaccount.google.com is a legitimate Google subdomain. Google owns the google.com domain — any subdomain like myaccount.google.com, mail.google.com, or drive.google.com is authentic. The page doesn't ask for credentials and has no urgency.",
    points: 120,
  },
  {
    id: 11, level: 4, difficulty: "Expert",
    isSafe: false,
    ssl: true,
    url: "https://signin.microsoft.com.auth-verify.io/oauth2/v2.0/login",
    displayUrl: "https://signin.microsoft.com.auth-verify.io/oauth2/v2.0/login",
    favicon: "🪟", pageTitle: "Microsoft – Sign In",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Microsoft",
      subheader: "Sign in",
      body: "Sign in to access Outlook, Teams, OneDrive, Office 365, and all Microsoft services. Enter your Microsoft account credentials to continue.",
      form: true,
      formFields: ["Email, phone, or Skype"],
      submitLabel: "Next",
      footerText: "© Microsoft 2026   Terms of use   Privacy & cookies",
      extraLinks: ["No account? Create one!", "Can't access your account?"],
    },
    redFlags: [
      { icon: "🧠", title: "Subdomain trap — read right to left", detail: "The real domain is 'auth-verify.io'. 'signin.microsoft.com' is just a subdomain designed to appear at the start of the URL. Real Microsoft login is login.microsoftonline.com or login.microsoft.com." },
      { icon: "🔠", title: "'microsoft.com' appears — but it's a subdomain", detail: "In 'signin.microsoft.com.auth-verify.io', everything up to '.io' is a subdomain of 'auth-verify.io'. Microsoft does not own this domain." },
      { icon: "🛣️", title: "OAuth2 path adds false legitimacy", detail: "Including '/oauth2/v2.0/login' in the path mimics Microsoft's real OAuth URL structure, but the domain makes it fake regardless of the path." },
    ],
    lesson: "This is the most sophisticated URL trick: a long subdomain containing a real brand name. Microsoft's real login URLs are login.microsoft.com and login.microsoftonline.com. The rule: find the TLD (.io here), look left — 'auth-verify' is the real domain owner, not Microsoft.",
    points: 200,
  },
  {
    id: 12, level: 4, difficulty: "Expert",
    isSafe: false,
    ssl: true,
    url: "https://www.g00gle.com/accounts/login",
    displayUrl: "https://www.g00gle.com/accounts/login",
    favicon: "🔵", pageTitle: "Google Accounts",
    sslLabel: "Connection is secure",
    sslColor: "#059669",
    pageContent: {
      header: "Google",
      subheader: "Sign in to continue",
      body: "Sign in to your Google account to access Gmail, Google Drive, YouTube, and all Google services. Verify your account credentials below.",
      form: true,
      formFields: ["Email or phone", "Password"],
      submitLabel: "Sign in",
      footerText: "© 2026 Google LLC · Privacy · Terms",
    },
    redFlags: [
      { icon: "🔢", title: "Zero substitution: 'g00gle.com' not 'google.com'", detail: "The two letter 'o's in 'google' have been replaced with zeros ('0'). This is an extremely subtle visual trick — g00gle vs google." },
      { icon: "🔍", title: "Look character by character", detail: "Typosquatting uses characters that look nearly identical: 0 vs o, 1 vs l, rn vs m. Always read the domain character by character if something feels off." },
      { icon: "🔒", title: "Valid HTTPS certificate for a fake domain", detail: "Anyone can get a free HTTPS certificate for g00gle.com. The padlock is green but the site is fake." },
    ],
    lesson: "Typosquatting replaces visually similar characters: 0 for o, 1 for l, rn for m. The domain 'g00gle.com' is completely different from 'google.com'. At expert level, always scan domain names character by character, especially for high-value accounts.",
    points: 200,
  },
];

const LEVELS = [
  { id:1, name:"Rookie",  color:"#f472b6", desc:"Clear visual red flags",           scenarios: SCENARIOS.filter(s=>s.level===1) },
  { id:2, name:"Cadet",   color:"#c084fc", desc:"HTTPS misconceptions",              scenarios: SCENARIOS.filter(s=>s.level===2) },
  { id:3, name:"Analyst", color:"#22d3ee", desc:"Government & brand impersonation",  scenarios: SCENARIOS.filter(s=>s.level===3) },
  { id:4, name:"Expert",  color:"#fb923c", desc:"Advanced URL manipulation",         scenarios: SCENARIOS.filter(s=>s.level===4) },
];

let SCORE_STORE = [];
function saveScore(name, score, correct, total) {
  SCORE_STORE = [...SCORE_STORE, {
    name, score, correct, total,
    date: new Date().toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"}),
  }].sort((a,b)=>b.score-a.score).slice(0,20);
}

// ─── PALETTE (same Girls in ICT Day system) ───────────────────────────────────
const C = {
  bg:"#fdf2f8", bgCard:"#ffffff", bgSoft:"#fce7f3", bgDeep:"#fdf4ff",
  border:"#fbcfe8", borderSoft:"#f9a8d4",
  pink:"#db2777", pinkL:"#f472b6", pinkXL:"#fce7f3",
  teal:"#0e7490", tealL:"#22d3ee",
  violet:"#7c3aed", violetL:"#c084fc",
  gold:"#d97706", goldL:"#fbbf24",
  green:"#059669", greenL:"#6ee7b7",
  red:"#dc2626", redL:"#fca5a5",
  text:"#1e1b2e", textMd:"#4a3f5c", textSm:"#9580a8",
  browserBg: "#f1f3f4",
  browserBar: "#ffffff",
};

// ─── URL HIGHLIGHTER ──────────────────────────────────────────────────────────
function HighlightedURL({ url, isSafe, revealed }) {
  if (!revealed) {
    return <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:13,color:C.textMd}}>{url}</span>;
  }

  // Parse URL for highlighting
  try {
    const u = new URL(url);
    const protocol = u.protocol + "//";
    const hostname = u.hostname;
    const rest = u.pathname + u.search;

    // Find the real domain (TLD + one word left)
    const parts = hostname.split(".");
    let realDomainStart = -1;
    // Find TLD position
    const tlds = ["com","net","org","io","xyz","online","support","ph","gov"];
    let tldIdx = -1;
    for (let i = parts.length-1; i >= 0; i--) {
      if (tlds.includes(parts[i])) { tldIdx = i; break; }
    }
    if (tldIdx > 0) realDomainStart = tldIdx - 1;

    return (
      <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:13,wordBreak:"break-all"}}>
        <span style={{color: isSafe ? C.green : C.textSm, fontWeight:700}}>
          {protocol}
        </span>
        {parts.map((part, i) => {
          const isRealDomain = (i === realDomainStart || i === tldIdx) && !isSafe;
          const isBrandInSubdomain = !isSafe && i < realDomainStart && parts.slice(realDomainStart).join(".").includes(part.replace(/-/g,"."));
          return (
            <span key={i}>
              {i > 0 && <span style={{color:C.textSm}}>.</span>}
              <span style={{
                color: isRealDomain ? C.red : isSafe ? C.green : C.textMd,
                fontWeight: isRealDomain ? 900 : 600,
                background: isRealDomain ? `${C.red}15` : "transparent",
                borderRadius: isRealDomain ? 3 : 0,
                padding: isRealDomain ? "0 2px" : 0,
              }}>{part}</span>
            </span>
          );
        })}
        <span style={{color:C.textSm}}>{rest}</span>
      </span>
    );
  } catch {
    return <span style={{fontFamily:"'Roboto Mono',monospace",fontSize:13}}>{url}</span>;
  }
}

// ─── BROWSER MOCK ─────────────────────────────────────────────────────────────
function BrowserMock({ scenario, revealed }) {
  const s = scenario;
  return (
    <div style={{
      background:C.browserBg, borderRadius:16, overflow:"hidden",
      border:`1.5px solid ${C.border}`,
      boxShadow:"0 8px 32px rgba(0,0,0,.1)",
      fontFamily:"'Nunito',sans-serif",
    }}>
      {/* Window controls */}
      <div style={{background:"#e8eaed",padding:"10px 16px 0",display:"flex",alignItems:"center",gap:6}}>
        <div style={{width:12,height:12,borderRadius:"50%",background:"#ef4444"}}/>
        <div style={{width:12,height:12,borderRadius:"50%",background:"#facc15"}}/>
        <div style={{width:12,height:12,borderRadius:"50%",background:"#4ade80"}}/>
        <div style={{flex:1,marginLeft:12}}>
          {/* Tab */}
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff",borderRadius:"8px 8px 0 0",padding:"6px 14px",fontSize:12,color:C.textMd,maxWidth:260}}>
            <span>{s.favicon}</span>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:600}}>{s.pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Address bar */}
      <div style={{background:"#e8eaed",padding:"8px 16px 10px",display:"flex",alignItems:"center",gap:10}}>
        {/* Nav buttons */}
        <div style={{display:"flex",gap:6}}>
          {["←","→","↻"].map((b,i)=>(
            <div key={i} style={{width:28,height:28,borderRadius:6,background:"#d0d3d9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#5f6368",fontWeight:700,cursor:"default"}}>{b}</div>
          ))}
        </div>

        {/* URL bar */}
        <div style={{flex:1,background:C.browserBar,borderRadius:50,padding:"7px 14px",display:"flex",alignItems:"center",gap:8,border:`1px solid #dadce0`,boxShadow:"inset 0 1px 3px rgba(0,0,0,.06)"}}>
          {/* SSL indicator */}
          <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0,cursor:"default",userSelect:"none"}}>
            {s.ssl
              ? <span style={{fontSize:13}}>🔒</span>
              : <span style={{fontSize:13}}>⚠️</span>
            }
            <span style={{fontSize:11,fontWeight:700,color:s.sslColor,whiteSpace:"nowrap"}}>{s.sslLabel}</span>
          </div>
          <div style={{width:1,height:14,background:"#e0e0e0",flexShrink:0}}/>
          <div style={{flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
            <HighlightedURL url={s.displayUrl} isSafe={s.isSafe} revealed={revealed}/>
          </div>
          {revealed && !s.isSafe && (
            <div style={{flexShrink:0,fontSize:10,fontWeight:800,color:C.red,background:`${C.red}15`,border:`1px solid ${C.red}44`,borderRadius:50,padding:"2px 8px",whiteSpace:"nowrap"}}>
              FAKE DOMAIN
            </div>
          )}
          {revealed && s.isSafe && (
            <div style={{flexShrink:0,fontSize:10,fontWeight:800,color:C.green,background:`${C.green}15`,border:`1px solid ${C.green}44`,borderRadius:50,padding:"2px 8px",whiteSpace:"nowrap"}}>
              ✓ VERIFIED
            </div>
          )}
        </div>

        {/* Bookmark */}
        <div style={{fontSize:16,cursor:"default"}}>☆</div>
      </div>

      {/* Page content */}
      <div style={{background:"#fff",minHeight:260,padding:"28px 32px"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Nunito',sans-serif",fontSize:22,fontWeight:900,color:C.text,margin:"0 0 4px"}}>{s.pageContent.header}</h2>
          {s.pageContent.subheader && <p style={{fontSize:13,color:C.textSm,margin:"0 0 16px"}}>{s.pageContent.subheader}</p>}
          <p style={{fontSize:13,color:C.textMd,lineHeight:1.7,margin:"0 0 20px"}}>{s.pageContent.body}</p>

          {s.pageContent.warning && (
            <div style={{background:"#fef3c7",border:"1px solid #fbbf24",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#92400e",marginBottom:16,fontWeight:600}}>
              {s.pageContent.warning}
            </div>
          )}

          {s.pageContent.form && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {s.pageContent.formFields.map((field,i)=>(
                <div key={i} style={{background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",fontSize:13,color:C.textSm,cursor:"default"}}>
                  {field}
                </div>
              ))}
              <div style={{background:s.isSafe?`linear-gradient(135deg,${C.teal},${C.violet})`:`linear-gradient(135deg,${C.red},#b91c1c)`,color:"#fff",borderRadius:8,padding:"11px",textAlign:"center",fontSize:13,fontWeight:800,cursor:"default",marginTop:4}}>
                {s.pageContent.submitLabel}
              </div>
            </div>
          )}

          {s.pageContent.extraLinks && (
            <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
              {s.pageContent.extraLinks.map((l,i)=>(
                <span key={i} style={{fontSize:12,color:C.teal,cursor:"default",fontWeight:600}}>{l}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{background:"#f8f9fa",padding:"4px 16px",borderTop:`1px solid #e0e0e0`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:C.textSm}}>
          {s.ssl ? "✓ Encrypted connection" : "⚠ Connection not encrypted"}
        </span>
        <span style={{fontSize:10,color:C.textSm}}>{s.pageContent.footerText}</span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SafeBrowsing() {
  const [screen, setScreen]           = useState("home");
  const [playerName, setPlayerName]   = useState("");
  const [nameInput, setNameInput]     = useState("");
  const [nameError, setNameError]     = useState("");

  const [qIndex, setQIndex]           = useState(0);
  const [answered, setAnswered]       = useState(false);
  const [playerChoice, setPlayerChoice] = useState(null); // 'safe' | 'unsafe'
  const [score, setScore]             = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults]         = useState([]);
  const [streak, setStreak]           = useState(0);
  const [maxStreak, setMaxStreak]     = useState(0);
  const [newToast, setNewToast]       = useState(null);
  const [dots, setDots]               = useState([]);
  const [highScores, setHighScores]   = useState([]);
  const [activeLevel, setActiveLevel] = useState(1);
  const [urlRevealed, setUrlRevealed] = useState(false);

  const QUIZ = SCENARIOS; // all 12 scenarios in order

  useEffect(() => {
    setDots(Array.from({length:18},(_,i)=>({
      id:i, x:Math.random()*100, y:Math.random()*100,
      r:1.5+Math.random()*3, dur:5+Math.random()*7, del:Math.random()*4,
      c:i%3===0?C.pinkL:i%3===1?C.tealL:C.violetL,
    })));
  }, []);

  const current = QUIZ[qIndex];
  const levelInfo = LEVELS.find(l=>l.id===current?.level);
  const accuracy = QUIZ.length > 0 ? Math.round((correctCount / Math.max(qIndex,1)) * 100) : 0;
  const progress = qIndex / QUIZ.length;

  function handleAnswer(choice) {
    if (answered) return;
    setPlayerChoice(choice);
    setAnswered(true);
    setUrlRevealed(true);

    const correct = (choice === "safe") === current.isSafe;
    if (correct) {
      const newStreak = streak + 1;
      const bonus = Math.min(newStreak - 1, 3) * 20;
      const pts = current.points + bonus;
      setScore(p => p + pts);
      setCorrectCount(p => p + 1);
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      if (newStreak >= 3) {
        setNewToast({ text: `🔥 ${newStreak}x Streak! +${bonus} bonus XP`, color: C.gold });
        setTimeout(() => setNewToast(null), 2500);
      }
      setResults(p => [...p, { correct: true, scenario: current }]);
    } else {
      setStreak(0);
      setResults(p => [...p, { correct: false, scenario: current }]);
    }
  }

  function nextQuestion() {
    if (qIndex + 1 >= QUIZ.length) {
      saveScore(playerName, score, correctCount, QUIZ.length);
      setHighScores([...SCORE_STORE]);
      setScreen("final");
    } else {
      setQIndex(p => p + 1);
      setAnswered(false);
      setPlayerChoice(null);
      setUrlRevealed(false);
    }
  }

  function startGame() {
    if (!nameInput.trim()) { setNameError("Please enter your name to continue. 🌸"); return; }
    setPlayerName(nameInput.trim()); setNameError("");
    setQIndex(0); setAnswered(false); setPlayerChoice(null);
    setScore(0); setCorrectCount(0); setStreak(0); setMaxStreak(0);
    setResults([]); setUrlRevealed(false);
    setScreen("game");
  }

  function openScores() { setHighScores([...SCORE_STORE]); setScreen("scores"); }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&family=Roboto+Mono:wght@400;600;700&display=swap');
    *{box-sizing:border-box;}
    body{margin:0;background:${C.bg};}
    .root{font-family:'Nunito',sans-serif;min-height:100vh;}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes fadeUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
    @keyframes slideIn{from{transform:translateX(80px);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes popIn{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
    @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(219,39,119,.3)}50%{box-shadow:0 0 28px rgba(219,39,119,.6)}}
    .shimmer{
      background:linear-gradient(90deg,${C.pink},${C.violet},${C.teal},${C.pink});
      background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
      animation:shimmer 3s linear infinite;
    }
    .card{background:#fff;border:1.5px solid ${C.border};border-radius:20px;padding:22px;box-shadow:0 2px 20px rgba(219,39,119,.07);}
    .chip{background:#fff;border:1.5px solid ${C.border};border-radius:14px;padding:8px 16px;text-align:center;box-shadow:0 2px 10px rgba(219,39,119,.06);}
    .btn-main{background:linear-gradient(135deg,${C.pink},${C.violet});border:none;color:#fff;cursor:pointer;padding:14px 36px;border-radius:50px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;letter-spacing:.5px;transition:all .25s;box-shadow:0 6px 22px rgba(219,39,119,.35);}
    .btn-main:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(219,39,119,.5);}
    .btn-out{background:transparent;border:2px solid ${C.pink};color:${C.pink};cursor:pointer;padding:12px 28px;border-radius:50px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;transition:all .2s;}
    .btn-out:hover{background:${C.pink};color:#fff;transform:translateY(-1px);}
    .btn-safe{background:linear-gradient(135deg,${C.green},#047857);border:none;color:#fff;cursor:pointer;padding:16px 36px;border-radius:50px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;letter-spacing:.5px;transition:all .25s;box-shadow:0 6px 22px rgba(5,150,105,.3);}
    .btn-safe:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(5,150,105,.5);}
    .btn-unsafe{background:linear-gradient(135deg,${C.red},#b91c1c);border:none;color:#fff;cursor:pointer;padding:16px 36px;border-radius:50px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;letter-spacing:.5px;transition:all .25s;box-shadow:0 6px 22px rgba(220,38,38,.3);}
    .btn-unsafe:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(220,38,38,.5);}
    .btn-next{background:linear-gradient(135deg,${C.teal},${C.violet});border:none;color:#fff;cursor:pointer;padding:12px 28px;border-radius:50px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;transition:all .2s;box-shadow:0 4px 14px rgba(14,116,144,.3);}
    .btn-next:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(14,116,144,.45);}
    .inp{background:#fff;border:2px solid ${C.border};border-radius:14px;padding:13px 18px;font-family:'Nunito',sans-serif;font-size:15px;color:${C.text};width:100%;transition:border .2s;outline:none;}
    .inp:focus{border-color:${C.pink};box-shadow:0 0 0 3px rgba(219,39,119,.14);}
    .score-row{display:flex;align-items:center;gap:12px;border-radius:12px;padding:10px 14px;transition:background .15s;}
    .score-row:nth-child(odd){background:${C.bgSoft};}
    .score-row:hover{background:${C.pinkXL};}
    .flag-item{animation:fadeUp .3s ease forwards;opacity:0;}
    .answer-btn-selected-safe{outline:3px solid ${C.green};outline-offset:2px;}
    .answer-btn-selected-unsafe{outline:3px solid ${C.red};outline-offset:2px;animation:shake .4s ease;}
    .level-tab{padding:8px 18px;border-radius:50px;font-weight:700;font-size:13px;cursor:pointer;border:1.5px solid ${C.border};background:#fff;transition:all .2s;font-family:'Nunito',sans-serif;}
    .level-tab.active{color:#fff;border-color:transparent;}
  `;

  return (
    <div className="root" style={{background:C.bg,color:C.text,position:"relative",overflow:"hidden"}}>
      <style>{css}</style>

      {/* BG particles */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-140,right:-140,width:460,height:460,borderRadius:"50%",background:`radial-gradient(circle,${C.pinkL}1c,transparent 70%)`}}/>
        <div style={{position:"absolute",bottom:-100,left:-100,width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${C.tealL}18,transparent 70%)`}}/>
        <div style={{position:"absolute",top:"40%",left:"42%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${C.violetL}14,transparent 70%)`}}/>
        {dots.map(d=>(
          <div key={d.id} style={{position:"absolute",left:`${d.x}%`,top:`${d.y}%`,width:d.r*2,height:d.r*2,borderRadius:"50%",background:d.c,opacity:.28,animation:`float ${d.dur}s ease-in-out ${d.del}s infinite`}}/>
        ))}
      </div>

      {/* Toast */}
      {newToast && (
        <div style={{position:"fixed",top:20,right:20,zIndex:300,background:"#fff",border:`2px solid ${C.goldL}`,borderRadius:18,padding:"14px 20px",boxShadow:`0 8px 36px rgba(217,119,6,.28)`,animation:"slideIn .4s ease",fontSize:15,fontWeight:800,color:C.gold}}>
          {newToast.text}
        </div>
      )}

      {/* ── HOME ── */}
      {screen==="home" && (
        <div style={{position:"relative",zIndex:1,maxWidth:820,margin:"0 auto",padding:"40px 20px 70px"}}>
          {/* Branding */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:50,padding:"8px 22px",boxShadow:`0 2px 14px rgba(219,39,119,.1)`}}>
              <span style={{fontSize:18}}>💜</span>
              <span style={{fontSize:12,fontWeight:800,color:C.textMd}}>Girls in ICT Day · ITU</span>
              <span style={{width:1,height:16,background:C.border,display:"inline-block"}}/>
              <span style={{fontSize:12,fontWeight:800,color:C.teal}}>DICT Region IV-A</span>
            </div>
          </div>

          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:12,fontWeight:700,letterSpacing:4,color:C.textSm,marginBottom:10,textTransform:"uppercase"}}>Module 3</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,7vw,64px)",fontWeight:900,margin:"0 0 10px",lineHeight:1.05}}>
              <span className="shimmer">Safe Browsing</span>
              <br/><span style={{fontSize:"clamp(24px,4vw,40px)",color:C.textMd,WebkitTextFillColor:C.textMd}}>Challenge</span>
            </h1>
            <div style={{fontSize:13,fontWeight:700,letterSpacing:3,color:C.textSm,textTransform:"uppercase",marginBottom:18}}>
              Browser Security Simulator
            </div>
            <p style={{color:C.textMd,maxWidth:540,margin:"0 auto",lineHeight:1.8,fontSize:15}}>
              You'll see realistic browser windows — address bar, padlock, page content and all.
              Judge each one: <strong style={{color:C.green}}>Safe to use</strong> or <strong style={{color:C.red}}>Unsafe / Fake</strong>. Learn the URL tricks attackers use. 🌐
            </p>
          </div>

          {/* Name entry */}
          <div className="card" style={{maxWidth:460,margin:"0 auto 32px",textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:800,color:C.pink,letterSpacing:1,marginBottom:14}}>✨ ENTER YOUR NAME TO BEGIN</div>
            <input className="inp" placeholder="Your name or username…" value={nameInput}
              onChange={e=>{setNameInput(e.target.value);setNameError("");}}
              onKeyDown={e=>e.key==="Enter"&&startGame()} maxLength={30}/>
            {nameError && <div style={{fontSize:12,color:C.red,marginTop:8,fontWeight:600}}>{nameError}</div>}
            <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:18,flexWrap:"wrap"}}>
              <button className="btn-main" onClick={startGame}>▶ Start Challenge</button>
              <button className="btn-out" onClick={openScores}>🏆 High Scores</button>
            </div>
          </div>

          {/* Levels */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12,marginBottom:24}}>
            {LEVELS.map((lvl,i)=>(
              <div key={i} style={{background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:16,padding:"16px",transition:"all .2s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 28px rgba(219,39,119,.15)`}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
                <div style={{fontSize:10,fontWeight:800,color:lvl.color,letterSpacing:2,marginBottom:5}}>LEVEL {lvl.id} · {lvl.scenarios.length} QUESTIONS</div>
                <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:4}}>{lvl.name}</div>
                <div style={{fontSize:11,color:C.textSm,lineHeight:1.5}}>{lvl.desc}</div>
              </div>
            ))}
          </div>

          {/* Key concepts */}
          <div className="card">
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.textSm,marginBottom:16}}>KEY CONCEPTS YOU'LL MASTER</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>
              {[
                {icon:"🔒",t:"HTTPS ≠ Safe",d:"The padlock only encrypts traffic — attackers can get HTTPS too"},
                {icon:"🌐",t:"Domain anatomy",d:"Learn to identify the real domain vs clever subdomains"},
                {icon:"🔢",t:"Typosquatting",d:"0 vs o, rn vs m, 1 vs l — subtle character swaps"},
                {icon:"🏛️",t:".gov.ph domains",d:"Philippine government sites always and only use .gov.ph"},
                {icon:"🎭",t:"Pixel-perfect clones",d:"Fake sites copy real designs completely — looks aren't safety"},
                {icon:"🧭",t:"URL reading technique",d:"Read right-to-left from the TLD to find the real domain"},
              ].map((item,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:22,flexShrink:0}}>{item.icon}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>{item.t}</div>
                    <div style={{fontSize:11,color:C.textSm,lineHeight:1.5}}>{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{textAlign:"center",marginTop:36,fontSize:12,color:C.textSm,lineHeight:2}}>
            <strong style={{color:C.pink}}>Girls in ICT Day</strong> · Facilitated by <strong style={{color:C.teal}}>DICT Region IV-A</strong> · In partnership with <strong style={{color:C.violet}}>ITU</strong>
          </div>
        </div>
      )}

      {/* ── HIGH SCORES ── */}
      {screen==="scores" && (
        <div style={{position:"relative",zIndex:1,maxWidth:580,margin:"0 auto",padding:"50px 20px 70px"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{fontSize:52,marginBottom:12,animation:"popIn .4s ease"}}>🏆</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:34,margin:"0 0 8px",color:C.text}}>Hall of Fame</h2>
            <div style={{fontSize:13,color:C.textSm}}>Safe Browsing Challenge · Top Detectives</div>
          </div>
          <div className="card" style={{marginBottom:24}}>
            {SCORE_STORE.length===0 ? (
              <div style={{textAlign:"center",padding:"36px 0",color:C.textSm}}>
                <div style={{fontSize:40,marginBottom:12}}>🌐</div>No scores yet — be the first!
              </div>
            ) : SCORE_STORE.map((s,i)=>(
              <div key={i} className="score-row">
                <div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,flexShrink:0,
                  background:i===0?`linear-gradient(135deg,#f59e0b,#d97706)`:i===1?`linear-gradient(135deg,#9ca3af,#6b7280)`:i===2?`linear-gradient(135deg,#b45309,#92400e)`:C.bgSoft,
                  color:i<3?"#fff":C.textSm}}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:14,color:C.text}}>{s.name}</div>
                  <div style={{fontSize:11,color:C.textSm}}>{s.date} · {s.correct}/{s.total} correct</div>
                </div>
                <div style={{fontWeight:900,fontSize:20,color:C.pink}}>{s.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <button className="btn-main" onClick={()=>setScreen("home")}>← Back to Home</button>
          </div>
        </div>
      )}

      {/* ── GAME ── */}
      {screen==="game" && current && (
        <div style={{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"20px 16px 50px"}}>
          {/* HUD */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:50,padding:"6px 16px"}}>
              <span style={{fontSize:14}}>💜</span>
              <span style={{fontSize:12,fontWeight:800,color:C.textMd}}>Girls in ICT Day</span>
            </div>
            <div className="chip">
              <div style={{fontSize:10,fontWeight:700,color:C.textSm,letterSpacing:2}}>PLAYER</div>
              <div style={{fontSize:13,fontWeight:900,color:C.pink}}>{playerName}</div>
            </div>
            <div className="chip">
              <div style={{fontSize:10,fontWeight:700,color:C.textSm,letterSpacing:2}}>SCORE</div>
              <div style={{fontSize:13,fontWeight:900,color:C.gold}}>{score}</div>
            </div>
            <div className="chip">
              <div style={{fontSize:10,fontWeight:700,color:C.textSm,letterSpacing:2}}>STREAK</div>
              <div style={{fontSize:13,fontWeight:900,color:C.gold}}>{streak>0?`🔥${streak}`:"—"}</div>
            </div>
            <div className="chip" style={{borderColor:`${levelInfo?.color}55`}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textSm,letterSpacing:2}}>LEVEL</div>
              <div style={{fontSize:13,fontWeight:900,color:levelInfo?.color}}>{levelInfo?.name}</div>
            </div>
            <div style={{flex:1,textAlign:"right",fontSize:13,fontWeight:700,color:C.textSm}}>
              {qIndex+1} / {QUIZ.length}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{height:5,background:C.bgSoft,borderRadius:5,marginBottom:20,overflow:"hidden"}}>
            <div style={{height:"100%",background:`linear-gradient(90deg,${C.pink},${C.violet})`,borderRadius:5,width:`${(qIndex/QUIZ.length)*100}%`,transition:"width .4s ease"}}/>
          </div>

          {/* Question label */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:C.textSm}}>
              🌐 IS THIS WEBSITE SAFE OR UNSAFE?
            </div>
            <div style={{fontSize:11,fontWeight:700,color:levelInfo?.color,background:`${levelInfo?.color}18`,border:`1px solid ${levelInfo?.color}44`,borderRadius:50,padding:"3px 12px"}}>
              {current.difficulty} · +{current.points} pts
            </div>
          </div>

          {/* Browser mock */}
          <div style={{marginBottom:16}}>
            <BrowserMock scenario={current} revealed={urlRevealed}/>
          </div>

          {/* URL reading tip */}
          {!answered && (
            <div style={{background:"#fff",border:`1.5px dashed ${C.border}`,borderRadius:12,padding:"10px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>💡</span>
              <span style={{fontSize:12,color:C.textMd,fontWeight:600}}>
                <strong style={{color:C.pink}}>Tip:</strong> Focus on the address bar — especially the domain name. Remember: HTTPS (the padlock) does NOT automatically mean the site is safe.
              </span>
            </div>
          )}

          {/* Answer buttons */}
          {!answered && (
            <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:16}}>
              <button className="btn-safe" onClick={()=>handleAnswer("safe")}>
                ✅ Safe — I'd use this site
              </button>
              <button className="btn-unsafe" onClick={()=>handleAnswer("unsafe")}>
                🚫 Unsafe — Something's wrong
              </button>
            </div>
          )}

          {/* Result panel */}
          {answered && (
            <div style={{
              background: (playerChoice==="safe")===current.isSafe ? "rgba(236,253,245,.95)" : "rgba(254,242,242,.95)",
              border:`1.5px solid ${(playerChoice==="safe")===current.isSafe ? C.greenL : C.redL}`,
              borderRadius:20, padding:"20px 22px", animation:"fadeUp .3s ease",
            }}>
              {/* Verdict */}
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <span style={{fontSize:36}}>{(playerChoice==="safe")===current.isSafe ? "✅" : "❌"}</span>
                <div>
                  <div style={{fontSize:17,fontWeight:900,color:(playerChoice==="safe")===current.isSafe?C.green:C.red}}>
                    {(playerChoice==="safe")===current.isSafe
                      ? `Correct! This site is ${current.isSafe?"safe":"unsafe"}.`
                      : `Incorrect — this site is actually ${current.isSafe?"safe":"unsafe"}.`
                    }
                  </div>
                  {streak>1 && (playerChoice==="safe")===current.isSafe && (
                    <div style={{fontSize:12,color:C.gold,fontWeight:700}}>🔥 {streak}x streak!</div>
                  )}
                </div>
              </div>

              {/* Red flags */}
              {current.redFlags.length > 0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.red,marginBottom:10}}>🚩 WHAT TO LOOK FOR:</div>
                  {current.redFlags.map((f,i)=>(
                    <div key={i} className="flag-item" style={{display:"flex",gap:12,marginBottom:10,animationDelay:`${i*.07}s`}}>
                      <span style={{fontSize:20,flexShrink:0}}>{f.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>{f.title}</div>
                        <div style={{fontSize:12,color:C.textMd,lineHeight:1.55}}>{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lesson */}
              <div style={{background:"#fff",borderRadius:12,padding:"12px 16px",fontSize:13,color:C.textMd,lineHeight:1.7,borderLeft:`3px solid ${C.teal}`,marginBottom:16}}>
                <span style={{color:C.teal,fontWeight:800}}>💡 Lesson: </span>{current.lesson}
              </div>

              {/* URL breakdown */}
              <div style={{background:C.bgDeep,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:C.violet,letterSpacing:1,marginBottom:8}}>🔍 URL BREAKDOWN</div>
                <div style={{background:"#fff",borderRadius:8,padding:"10px 14px",border:`1px solid ${C.border}`}}>
                  <HighlightedURL url={current.displayUrl} isSafe={current.isSafe} revealed={true}/>
                </div>
                {!current.isSafe && (
                  <div style={{marginTop:8,fontSize:12,color:C.red,fontWeight:700}}>
                    ⬆ The highlighted portion shows the REAL domain — not the legitimate brand.
                  </div>
                )}
                {current.isSafe && (
                  <div style={{marginTop:8,fontSize:12,color:C.green,fontWeight:700}}>
                    ⬆ The domain is legitimate — owned by the real organization.
                  </div>
                )}
              </div>

              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button className="btn-next" onClick={nextQuestion}>
                  {qIndex+1>=QUIZ.length?"See Final Results →":"Next Site →"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FINAL ── */}
      {screen==="final" && (
        <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto",padding:"50px 20px 80px"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <div style={{fontSize:64,marginBottom:14,animation:"popIn .5s ease"}}>
              {correctCount>=10?"🏆":correctCount>=7?"🎯":correctCount>=5?"🛡️":"📖"}
            </div>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:C.gold,marginBottom:10}}>CHALLENGE COMPLETE</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:34,margin:"0 0 8px",color:C.text}}>
              {correctCount >= 10 ? `Security Expert, ${playerName}!` : correctCount >= 7 ? `Well done, ${playerName}!` : `Good effort, ${playerName}!`}
            </h2>
            <div style={{color:C.textSm}}>{correctCount} of {QUIZ.length} sites correctly identified</div>
          </div>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
            {[
              {label:"FINAL SCORE",val:score.toLocaleString(),c:C.pink},
              {label:"ACCURACY",val:`${Math.round((correctCount/QUIZ.length)*100)}%`,c:correctCount>=8?C.green:correctCount>=5?C.gold:C.red},
              {label:"MAX STREAK",val:maxStreak>0?`🔥${maxStreak}`:"—",c:C.gold},
            ].map((s,i)=>(
              <div key={i} className="chip" style={{padding:"18px 14px"}}>
                <div style={{fontSize:26,fontWeight:900,color:s.c}}>{s.val}</div>
                <div style={{fontSize:10,fontWeight:700,color:C.textSm,letterSpacing:1}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per-question results */}
          <div className="card" style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.textSm,marginBottom:14}}>QUESTION RESULTS</div>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<results.length-1?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:18,flexShrink:0}}>{r.correct?"✅":"❌"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:1}}>
                    {r.scenario.isSafe?"✅ Legitimate site":"🚫 Phishing/fake site"} — {r.scenario.difficulty}
                  </div>
                  <div style={{fontSize:11,color:C.textSm,fontFamily:"'Roboto Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:400}}>
                    {r.scenario.displayUrl}
                  </div>
                </div>
                <div style={{fontWeight:900,fontSize:13,color:r.correct?C.green:C.textSm,flexShrink:0}}>
                  {r.correct?`+${r.scenario.points}`:"—"}
                </div>
              </div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="card" style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.textSm,marginBottom:14}}>🏆 LEADERBOARD</div>
            {SCORE_STORE.length===0 ? (
              <div style={{textAlign:"center",padding:"16px 0",color:C.textSm,fontSize:13}}>No other scores yet.</div>
            ) : SCORE_STORE.slice(0,10).map((s,i)=>(
              <div key={i} className="score-row" style={{background:s.name===playerName?C.pinkXL:i%2===0?C.bgSoft:"#fff"}}>
                <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,flexShrink:0,
                  background:i===0?`linear-gradient(135deg,#f59e0b,#d97706)`:i===1?`linear-gradient(135deg,#9ca3af,#6b7280)`:i===2?`linear-gradient(135deg,#b45309,#92400e)`:C.bgSoft,
                  color:i<3?"#fff":C.textSm}}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                </div>
                <div style={{flex:1}}>
                  <span style={{fontWeight:s.name===playerName?900:700,fontSize:14,color:s.name===playerName?C.pink:C.text}}>
                    {s.name}{s.name===playerName?" 👈":""}
                  </span>
                  <div style={{fontSize:11,color:C.textSm}}>{s.date} · {s.correct}/{s.total} correct</div>
                </div>
                <div style={{fontWeight:900,fontSize:18,color:C.pink}}>{s.score.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Takeaways */}
          <div className="card" style={{marginBottom:28}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.teal,marginBottom:14}}>KEY TAKEAWAYS</div>
            {[
              "HTTPS (the padlock) only means traffic is encrypted — NOT that the site is trustworthy",
              "Always read the domain right-to-left: find the TLD (.com, .net, .ph), then the word to its left is the real owner",
              "Subdomains can contain real brand names — 'paypal.com.evil.net' is owned by evil.net",
              "In the Philippines, all government sites end in .gov.ph — no exceptions",
              "Typosquatting swaps similar characters: 0↔o, 1↔l, rn↔m — always read character by character",
              "Pixel-perfect clones exist — visual appearance of a page tells you nothing about safety",
              "When in doubt, type the URL directly — never click links from emails or messages",
            ].map((tip,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:10,fontSize:13,color:C.textMd,lineHeight:1.55}}>
                <span style={{color:C.green,fontWeight:900,flexShrink:0}}>✓</span><span>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-main" onClick={()=>{setNameInput(playerName);setScreen("home");}}>↺ Play Again</button>
            <button className="btn-out" onClick={openScores}>🏆 Full Leaderboard</button>
          </div>

          <div style={{textAlign:"center",marginTop:36,fontSize:12,color:C.textSm,lineHeight:2}}>
            <strong style={{color:C.pink}}>Girls in ICT Day</strong> · Facilitated by <strong style={{color:C.teal}}>DICT Region IV-A</strong><br/>
            In partnership with <strong style={{color:C.violet}}>ITU</strong> · Empowering women and girls in technology 💜
          </div>
        </div>
      )}
    </div>
  );
}
