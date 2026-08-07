export type FindingType =
  | 'SUSPICIOUS_LINK'
  | 'EXTERNAL_LINK_SIGNAL'
  | 'AI_MEDIA_SIGNAL'
  | 'MISINFORMATION_SIGNAL'
  | 'AD_PERSUASION_SIGNAL'
  | 'PRIVACY_CONCERN'
  | 'SOCIAL_MEDIA_CONCERN'
  | 'SOURCE_CONTEXT_SIGNAL'
  | 'OTHER'

export type ScanFinding = {
  type: FindingType
  severity: number
  detail: string
  // Used by the extension UI only. The API intentionally stores the finding, not this heuristic value.
  riskPoints: number
  lessonSlug: string
}

export type PageCategory = {
  kind: 'shopping' | 'social' | 'news' | 'video' | 'education' | 'forum' | 'general'
  label: string
  reason: string
  baselineRiskPoints: number
  lessonSlug: string
}

export type PageScan = {
  title: string
  pageOrigin: string
  linkCount: number
  imageCount: number
  riskScore: number
  category: PageCategory
  findings: ScanFinding[]
  sourceContext: {
    provider: string
    author?: string
    publishedDate?: string
    updatedDate?: string
    aboutUrl?: string
    externalLinkCount: number
  }
}
