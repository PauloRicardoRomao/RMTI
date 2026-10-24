export interface ThemeConfig {
  primaryColor: string;
  primaryHover: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMuted: string;
  presetId?: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemeConfig;
}

export interface IdentityConfig {
  brandName: string;
  companyName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  copyrightYear: string;
  footerText: string;
}

export interface HeroConfig {
  badge: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonAction: 'whatsapp' | 'scroll_contact';
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  benefits: string[];
  ctaText: string;
  whatsappMessage: string;
  active: boolean;
  order: number;
}

export interface ProcessStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  order: number;
}

export interface DifferentialItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface BannerConfig {
  active: boolean;
  desktopImageUrl: string;
  mobileImageUrl: string;
  altText: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
}

export interface ContactConfig {
  sectionTitle: string;
  sectionSubtitle: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  floatingWhatsappActive: boolean;
  floatingWhatsappTooltip: string;
  email: string;
  emailjsPublicKey: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  date?: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
}

export interface IntegrationsConfig {
  clarityProjectId?: string;
  googleAdsId?: string;
  googleAdsConversionLabel?: string;
  googleAnalyticsId?: string;
}

export interface AppConfig {
  adminPin?: string;
  adminPasswordHash?: string;
  theme: ThemeConfig;
  identity: IdentityConfig;
  hero: HeroConfig;
  services: ServiceItem[];
  process: ProcessStep[];
  differentials: DifferentialItem[];
  banner: BannerConfig;
  faqs: FaqItem[];
  contact: ContactConfig;
  integrations?: IntegrationsConfig;
}
