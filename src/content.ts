import type { FindingType, PageCategory, PageScan, ScanFinding } from './lib/pageScan'

type FlaggedElement = HTMLElement

const suspiciousPhrases = ['click here', 'gift card', 'password', 'urgent', 'reset your password', 'verify your account']
const urlShorteners = new Set(['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'ow.ly', 'buff.ly'])
const mediaLabels = /(ai[ -]?generated|synthetic|deepfake|digitally created)/i

function addFinding(findings: ScanFinding[], type: FindingType, severity: number, riskPoints: number, lessonSlug: string, detail: string) {
  const existing = findings.find((finding) => finding.type === type && finding.detail === detail)
  if (!existing) findings.push({ type, severity, riskPoints, lessonSlug, detail })
}

function clearPreviousHighlights() {
  document.querySelectorAll<HTMLElement>('[data-mile-oh-flag]').forEach((element) => {
    element.style.outline = ''
    element.style.outlineOffset = ''
    element.style.backgroundColor = ''
    element.removeAttribute('data-mile-oh-flag')
    element.removeAttribute('title')
  })
  document.querySelectorAll('[data-mile-oh-inline-notice]').forEach((element) => element.remove())
  document.querySelector('[data-mile-oh-inline-notice-style]')?.remove()
}

function ensureInlineNoticeStyle() {
  if (document.querySelector('[data-mile-oh-inline-notice-style]')) return
  const style = document.createElement('style')
  style.dataset.mileOhInlineNoticeStyle = ''
  style.textContent = `
    [data-mile-oh-inline-notice] { display:block; max-width:340px; margin:6px 0; padding:7px 9px; border-left:3px solid #dc385d; border-radius:6px; background:#fff4f6; color:#5c2335; font:600 12px/1.35 system-ui,sans-serif; text-align:left; }
    [data-mile-oh-inline-notice].mile-oh-caution { border-left-color:#e68a22; background:#fff8ed; color:#624314; }
  `
  document.documentElement.append(style)
}

function addInlineNotice(element: FlaggedElement, severity: number, reason: string) {
  if (element.parentElement?.querySelector(`[data-mile-oh-inline-notice="${CSS.escape(reason)}"]`)) return
  ensureInlineNoticeStyle()
  const notice = document.createElement('span')
  notice.dataset.mileOhInlineNotice = reason
  notice.className = severity >= 4 ? '' : 'mile-oh-caution'
  notice.textContent = `MILE-oh: ${reason}`
  element.insertAdjacentElement('afterend', notice)
}

function flagElement(element: FlaggedElement, severity: number, reason: string) {
  element.dataset.mileOhFlag = reason
  element.style.outline = `2px solid ${severity >= 4 ? '#dc385d' : '#e68a22'}`
  element.style.outlineOffset = '2px'
  element.title = `MILE-oh: ${reason}`
  addInlineNotice(element, severity, reason)
}

function visibleUrlInText(text: string): URL | undefined {
  // Only compare an explicit, stand-alone URL. Matching a domain fragment inside ordinary prose
  // produced false positives on legitimate sites with navigation and community links.
  const candidate = text.trim()
  if (!/^(?:https?:\/\/|www\.)/i.test(candidate) || /\s/.test(candidate)) return undefined
  try {
    return new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`)
  } catch {
    return undefined
  }
}

function sameDomain(first: string, second: string) {
  return first === second || first.endsWith(`.${second}`) || second.endsWith(`.${first}`)
}

function pageTextMatches(pattern: RegExp) {
  return pattern.test((document.body?.innerText ?? '').slice(0, 80_000))
}

function categorizePage(): PageCategory {
  const hasProductSchema = Array.from(document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')).some((script) => /"@type"\s*:\s*"Product"/i.test(script.textContent ?? ''))
  const hasShoppingAction = Boolean(document.querySelector('[data-testid*="add-to-cart" i], [aria-label*="add to cart" i], [aria-label*="buy now" i], a[href*="/cart" i]')) || pageTextMatches(/\b(add to cart|buy now|checkout|in stock)\b/i)
  if (hasProductSchema || hasShoppingAction) return { kind: 'shopping', label: 'Shopping / marketplace', reason: 'Product, cart, price, or checkout cues were detected.', baselineRiskPoints: 3, lessonSlug: 'understand-ads-persuasion' }
  if (isSocialPlatform() || document.querySelector('[role="feed"], [role="log"], a[href*="/direct/"]')) return { kind: 'social', label: 'Social / messaging', reason: 'Social, messaging, or user-posting features were detected.', baselineRiskPoints: 4, lessonSlug: 'social-media-safety' }
  if (document.querySelector('article, [role="article"], meta[property="article:published_time"]')) return { kind: 'news', label: 'News / article', reason: 'Article and publication cues were detected.', baselineRiskPoints: 1, lessonSlug: 'evaluate-sources' }
  if (document.querySelector('video, [role="slider"][aria-label*="video" i]') || /\b(watch|subscribe|playlist)\b/i.test(document.title)) return { kind: 'video', label: 'Video / media', reason: 'Video or media-viewing cues were detected.', baselineRiskPoints: 2, lessonSlug: 'ai-media-verification' }
  if (pageTextMatches(/\b(lesson|course|module|assignment|learn|quiz)\b/i)) return { kind: 'education', label: 'Learning / reference', reason: 'Learning or reference cues were detected.', baselineRiskPoints: 1, lessonSlug: 'evaluate-sources' }
  if (document.querySelector('[role="comment"], [data-testid*="comment" i]')) return { kind: 'forum', label: 'Forum / discussion', reason: 'Discussion or comment cues were detected.', baselineRiskPoints: 2, lessonSlug: 'participate-respectfully' }
  return { kind: 'general', label: 'General website', reason: 'No specialized page pattern was detected.', baselineRiskPoints: 0, lessonSlug: 'evaluate-sources' }
}

function effectiveDestination(destination: URL) {
  // Some platforms use an internal redirect URL (for example, l.instagram.com/?u=...).
  // If it exposes a destination in a standard query parameter, evaluate that destination instead.
  for (const key of ['url', 'u', 'target', 'destination', 'redirect', 'redirect_uri']) {
    const value = destination.searchParams.get(key)
    if (!value) continue
    try { return new URL(value, destination.href) } catch { /* Keep the visible destination. */ }
  }
  return destination
}

function analyzeLinks(findings: ScanFinding[]) {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
  let suspiciousTextCount = 0
  let disguisedLinkCount = 0
  let shortenedLinkCount = 0
  let externalLinkCount = 0

  for (const link of links) {
    const text = (link.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
    const rawHref = link.getAttribute('href') ?? ''

    // javascript: links are frequently used by legitimate web applications for menus and controls.
    // They are not a reliable scam signal by themselves, so ignore them rather than alarming users.
    if (/^(javascript|data):/i.test(rawHref)) continue

    let destination: URL
    try {
      destination = effectiveDestination(new URL(link.href))
    } catch {
      continue
    }

    if (suspiciousPhrases.some((phrase) => text.includes(phrase))) {
      suspiciousTextCount += 1
      flagElement(link, 2, 'Urgent or credential-related language is a cue to verify the destination first.')
    }
    if (/^https?:$/.test(destination.protocol) && !sameDomain(destination.hostname, window.location.hostname)) externalLinkCount += 1
    // An ordinary HTTP outbound link is a weak technical cue, not enough to flag a whole site.
    // Password forms sent over HTTP remain a high-priority check in analyzeForms.
    if (urlShorteners.has(destination.hostname.toLowerCase())) {
      shortenedLinkCount += 1
      flagElement(link, 2, 'This shortened link hides its final destination. Check it before opening.')
    }
    // Internationalized domains are common and legitimate in many languages. Do not flag them alone.

    const displayedUrl = visibleUrlInText(text)
    if (displayedUrl && !sameDomain(displayedUrl.hostname, destination.hostname)) {
      disguisedLinkCount += 1
      flagElement(link, 4, 'The visible web address does not match this link’s actual destination.')
    }
  }

  // Low-level cues should never make a reputable information site look high-risk on their own.
  if (suspiciousTextCount) addFinding(findings, 'SUSPICIOUS_LINK', 2, 8, 'suspicious-links', `${suspiciousTextCount} link${suspiciousTextCount === 1 ? '' : 's'} use urgency or credential-related language.`)
  if (shortenedLinkCount) addFinding(findings, 'SUSPICIOUS_LINK', 2, 10, 'suspicious-links', `${shortenedLinkCount} shortened link${shortenedLinkCount === 1 ? '' : 's'} hide the final destination.`)
  if (disguisedLinkCount) addFinding(findings, 'SUSPICIOUS_LINK', 4, 45, 'suspicious-links', `${disguisedLinkCount} link${disguisedLinkCount === 1 ? '' : 's'} show a web address that differs from the actual destination.`)
  if (externalLinkCount) {
    const points = Math.min(6, 1 + Math.floor(externalLinkCount / 10))
    addFinding(findings, 'EXTERNAL_LINK_SIGNAL', 1, points, 'evaluate-sources', `${externalLinkCount} link${externalLinkCount === 1 ? '' : 's'} lead${externalLinkCount === 1 ? 's' : ''} to a different website. Check the destination before sharing information there.`)
  }
  return links.length
}

function analyzeForms(findings: ScanFinding[]) {
  for (const form of Array.from(document.forms)) {
    if (!form.querySelector('input[type="password"]')) continue
    const action = new URL(form.getAttribute('action') || window.location.href, window.location.href)
    if (action.protocol === 'http:') {
      flagElement(form, 5, 'This password form submits over HTTP. Do not enter credentials here.')
      addFinding(findings, 'PRIVACY_CONCERN', 5, 70, 'protect-privacy', 'A password form submits over HTTP rather than an encrypted connection.')
    } else if (action.origin !== window.location.origin) {
      flagElement(form, 3, 'This password form submits to a different website. Verify the organization before entering credentials.')
      addFinding(findings, 'PRIVACY_CONCERN', 3, 25, 'protect-privacy', 'A password form submits to a different website. Verify where credentials are being sent.')
    }
  }
}

const socialComposerWords = /\b(comment|reply|message|chat|post|share|direct message)\b/i
const publicAudienceWords = /\b(public|everyone|visible to everyone|anyone can see)\b/i
const sensitiveFieldWords = /\b(email|phone|mobile|address|location|birth|birthday|date of birth|contact)\b/i
const socialPlatformHosts = new Set(['instagram.com', 'facebook.com', 'tiktok.com', 'x.com', 'twitter.com', 'reddit.com', 'discord.com', 'snapchat.com', 'linkedin.com', 'pinterest.com', 'youtube.com', 'twitch.tv'])
const sensitivePostPatterns = [
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/, name: 'a Social Security number' },
  { pattern: /\b(?:\d[ -]*?){13,19}\b/, name: 'a card number' },
  { pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, name: 'an email address' },
  { pattern: /\b(?:\+?\d[ .-]?){7,15}\b/, name: 'a phone number' },
]

function textForSocialCheck(element: Element) {
  return [
    element.getAttribute('aria-label'),
    element.getAttribute('placeholder'),
    element.getAttribute('name'),
    element.getAttribute('id'),
    element.getAttribute('data-testid'),
    element.className,
  ].filter((value): value is string => typeof value === 'string').join(' ')
}

function isSocialPlatform() {
  const host = window.location.hostname.toLowerCase()
  return [...socialPlatformHosts].some((platform) => sameDomain(host, platform))
    || /\b(instagram|facebook|tiktok|reddit|discord|social media)\b/i.test(metaContent('meta[property="og:site_name"]', 'meta[name="application-name"]') ?? '')
}

function installPrivacyTypingGuard(composers: HTMLElement[]) {
  for (const composer of composers) {
    if (composer.dataset.mileOhPrivacyGuardInstalled) continue
    composer.dataset.mileOhPrivacyGuardInstalled = 'true'
    composer.addEventListener('input', () => {
      // This check is local to the page. MILE-oh does not save or send what someone types.
      const value = composer instanceof HTMLInputElement || composer instanceof HTMLTextAreaElement ? composer.value : composer.textContent ?? ''
      const match = sensitivePostPatterns.find((candidate) => candidate.pattern.test(value))
      if (match) flagElement(composer, 4, `This post appears to include ${match.name}. Do not share sensitive details publicly or with people you cannot verify.`)
    })
  }
}

function analyzeSocialContext(findings: ScanFinding[]) {
  const composers = Array.from(document.querySelectorAll<HTMLElement>('textarea, [contenteditable="true"], [role="textbox"], input[type="text"]'))
    .filter((element) => socialComposerWords.test(textForSocialCheck(element)))
  const hasConversationRegion = Boolean(document.querySelector('[role="log"], [role="feed"], [aria-label*="chat" i], [aria-label*="comments" i], a[href*="/direct/"]'))
  const socialArea = composers[0]?.closest<HTMLElement>('form, section, article, div') ?? document.body

  // A social feature is an opportunity to learn, not evidence that a site is unsafe.
  if (composers.length || hasConversationRegion || isSocialPlatform()) {
    addFinding(findings, 'SOCIAL_MEDIA_CONCERN', 1, 4, 'social-media-safety', 'This page includes social, messaging, comments, or public-sharing features. Pause before posting personal details or information about someone else.')
  }

  installPrivacyTypingGuard(composers)

  if (!composers.length) return
  const socialText = `${socialArea.textContent ?? ''} ${textForSocialCheck(composers[0])}`.slice(0, 2_000)
  const nearbyInputs = Array.from(socialArea.querySelectorAll<HTMLInputElement>('input:not([type="password"])'))
  const asksForSensitiveDetails = nearbyInputs.some((input) => sensitiveFieldWords.test(`${input.type} ${textForSocialCheck(input)}`))
  if (publicAudienceWords.test(socialText) && asksForSensitiveDetails) {
    flagElement(socialArea, 3, 'This area appears to combine public sharing with personal-detail fields. Share only what is necessary and check who can see it.')
    addFinding(findings, 'PRIVACY_CONCERN', 3, 15, 'social-media-safety', 'A public-sharing area appears to request personal details. Check the audience and share only what is necessary.')
  }
}

function analyzePersuasion(findings: ScanFinding[]) {
  const labeledAds = Array.from(document.querySelectorAll<HTMLElement>('[aria-label*="sponsored" i], [data-testid*="sponsor" i], [class*="sponsor" i]'))
    .filter((element) => element.offsetParent !== null)
  const labeledAdCount = labeledAds.length
  const affiliateLinkCount = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
    .filter((link) => /[?&](affiliate|aff_id|ref|referral)=/i.test(link.href)).length
  if (labeledAdCount || affiliateLinkCount) {
    const details = [labeledAdCount && `${labeledAdCount} sponsored placement${labeledAdCount === 1 ? '' : 's'}`, affiliateLinkCount && `${affiliateLinkCount} affiliate/referral link${affiliateLinkCount === 1 ? '' : 's'}`].filter(Boolean).join(' and ')
    addFinding(findings, 'AD_PERSUASION_SIGNAL', 1, Math.min(5, 2 + labeledAdCount + affiliateLinkCount), 'understand-ads-persuasion', `MILE-oh noticed ${details}. Consider whether the content has a commercial or persuasive purpose.`)
    if (labeledAds[0]) flagElement(labeledAds[0], 2, 'This appears to be sponsored content. Check the seller and offer before buying or sharing information.')
  }
}

function analyzeShoppingRisks(findings: ScanFinding[]) {
  const urgency = /\b(only \d+ left|sale ends|ending soon|limited time|deal ends|act now|last chance)\b/i
  const urgencyElements = Array.from(document.querySelectorAll<HTMLElement>('span, p, div')).filter((element) => {
    const text = (element.innerText ?? '').trim()
    return text.length > 0 && text.length < 100 && urgency.test(text) && element.offsetParent !== null
  })
  if (urgencyElements.length) {
    flagElement(urgencyElements[0], 2, 'This offer uses time or scarcity pressure. Pause, compare the seller and price, and check the return policy before buying.')
    addFinding(findings, 'AD_PERSUASION_SIGNAL', 2, 5, 'understand-ads-persuasion', `${urgencyElements.length} time-sensitive sales cue${urgencyElements.length === 1 ? '' : 's'} detected. Pressure is a reason to pause and compare before buying.`)
  }
  const offPlatformPayment = pageTextMatches(/\b(pay by (gift card|wire transfer|crypto|bitcoin)|pay outside (the )?platform|contact seller directly)\b/i)
  if (offPlatformPayment) addFinding(findings, 'PRIVACY_CONCERN', 4, 25, 'suspicious-links', 'This shopping page mentions an off-platform or hard-to-reverse payment method. Verify the seller through the marketplace before paying.')
}

function analyzeMedia(findings: ScanFinding[]) {
  const images = Array.from(document.images)
  let labeledMediaCount = 0
  for (const image of images) {
    const figureText = image.closest('figure')?.textContent ?? ''
    const context = `${image.alt} ${image.title} ${image.className} ${figureText}`
    if (mediaLabels.test(context)) {
      labeledMediaCount += 1
      flagElement(image, 1, 'This media is labeled as AI-generated or synthetic. Verify the source and context of any claim it makes.')
    }
  }
  // A transparent AI label is a small verification cue, not proof that media is harmful.
  if (labeledMediaCount) addFinding(findings, 'AI_MEDIA_SIGNAL', 1, Math.min(3, labeledMediaCount), 'ai-media-verification', `${labeledMediaCount} image${labeledMediaCount === 1 ? ' is' : 's are'} labeled as AI-generated or synthetic. Check the source and context of related claims.`)
  return images.length
}

function metaContent(...selectors: string[]) {
  for (const selector of selectors) {
    const value = document.querySelector<HTMLMetaElement>(selector)?.content?.trim()
    if (value) return value
  }
  return undefined
}

function findAboutLink() {
  const aboutWords = /\b(about|about us|contact|editorial standards|our team)\b/i
  const link = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
    .find((candidate) => aboutWords.test(candidate.textContent ?? ''))
  return link?.href
}

function collectSourceContext() {
  const currentHost = window.location.hostname
  const provider = metaContent(
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
    'meta[name="publisher"]',
  ) ?? currentHost
  const author = metaContent('meta[name="author"]', 'meta[property="article:author"]', '[itemprop="author"] meta[name="name"]')
  const publishedDate = metaContent('meta[property="article:published_time"]', 'meta[name="date"]', '[itemprop="datePublished"]')
    ?? document.querySelector('time[datetime]')?.getAttribute('datetime') ?? undefined
  const updatedDate = metaContent('meta[property="article:modified_time"]', '[itemprop="dateModified"]')
  const externalLinkCount = new Set(
    Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
      .map((link) => link.href)
      .filter((href) => {
        try {
          const destination = new URL(href)
          return /^https?:$/.test(destination.protocol) && !sameDomain(destination.hostname, currentHost)
        } catch {
          return false
        }
      }),
  ).size

  return { provider, author, publishedDate, updatedDate, aboutUrl: findAboutLink(), externalLinkCount }
}

function analyzeSourceContext(findings: ScanFinding[], context: ReturnType<typeof collectSourceContext>) {
  const looksLikeAnArticle = Boolean(document.querySelector('article, [role="article"], meta[property="article:published_time"], [itemprop="articleBody"]'))
  if (looksLikeAnArticle && !context.author && !context.publishedDate) {
    addFinding(findings, 'SOURCE_CONTEXT_SIGNAL', 1, 2, 'evaluate-sources', 'Author and publication-date metadata were not detected. Look for source context before relying on a claim.')
  }
}

function analyzePage(): PageScan {
  clearPreviousHighlights()
  const findings: ScanFinding[] = []
  const category = categorizePage()
  const linkCount = analyzeLinks(findings)
  analyzeForms(findings)
  analyzeSocialContext(findings)
  analyzePersuasion(findings)
  if (category.kind === 'shopping') analyzeShoppingRisks(findings)
  const imageCount = analyzeMedia(findings)
  const sourceContext = collectSourceContext()
  analyzeSourceContext(findings, sourceContext)
  const riskScore = Math.min(100, category.baselineRiskPoints + findings.reduce((total, finding) => total + finding.riskPoints, 0))

  return {
    title: document.title || 'Untitled page',
    pageOrigin: window.location.origin,
    linkCount,
    imageCount,
    riskScore,
    category,
    findings,
    sourceContext,
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'ANALYZE_PAGE') sendResponse(analyzePage())
  return true
})
