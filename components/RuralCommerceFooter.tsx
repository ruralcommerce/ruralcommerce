import Image from 'next/image';
import { Facebook, Instagram, Youtube } from 'lucide-react';

type FooterLinkItem = {
  label: string;
  href: string;
};

type FooterLinkGroup = {
  group: string;
  items: FooterLinkItem[];
};

type FooterSocialLink = {
  label: string;
  href: string;
};

type RuralCommerceFooterProps = {
  title?: string;
  copyright?: string;
  contactTitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLabel?: string;
  footerLinks?: FooterLinkGroup[];
  socialLinks?: FooterSocialLink[];
};

const defaultFooterLinks: FooterLinkGroup[] = [
  {
    group: 'Outra parte',
    items: [
      { label: 'Início', href: '/#hero' },
      { label: 'Soluções', href: '/#soluciones' },
      { label: 'Segmentos', href: '/#segmentos' },
    ],
  },
  {
    group: 'Sobre',
    items: [
      { label: 'História e propósito', href: '/sobre' },
      { label: 'Como funciona', href: '/#sistema' },
      { label: 'Parceiros', href: '/#parceiros' },
    ],
  },
];

const defaultSocialLinks: FooterSocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
];

export function RuralCommerceFooter({
  title = 'Rural Commerce',
  copyright = `Rural Commerce ${new Date().getFullYear()} — Todos os direitos reservados`,
  contactTitle = 'Contato',
  contactAddress = 'Uruguay — endereço comercial (completar)',
  contactPhone = '+598 · · · · ·',
  contactEmail = 'contacto@ruralcommerce.com',
  socialLabel = 'Redes sociais',
  footerLinks = defaultFooterLinks,
  socialLinks = defaultSocialLinks,
}: RuralCommerceFooterProps) {
  return (
    <footer data-editor-section="site-footer" className="border-t border-[#071F5E]/10 bg-white text-[#1E1E1E]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <div className="inline-flex items-center">
              <Image
                src="/images/logo.png"
                alt={title}
                width={220}
                height={64}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="sr-only">{socialLabel}</p>
            <div className="mt-5 flex items-center gap-4 text-[#071F5E]">
              {socialLinks.map((link) => {
                const iconMap = {
                  Facebook,
                  YouTube: Youtube,
                  Instagram,
                } as const;
                const Icon = iconMap[link.label as keyof typeof iconMap] || Facebook;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-[#009179]"
                    aria-label={link.label}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{footerLinks[0]?.group || 'Outra parte'}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {(footerLinks[0]?.items || []).map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition hover:text-[#009179]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{footerLinks[1]?.group || 'Sobre'}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {(footerLinks[1]?.items || []).map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition hover:text-[#009179]">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-[#009179]">{contactTitle}</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>{contactAddress}</li>
              <li>
                <span className="text-[#1E1E1E]/80">WhatsApp / tel.:</span> {contactPhone}
              </li>
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-medium text-[#009179] underline-offset-2 transition hover:underline"
                >
                  {contactEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 text-center text-sm font-bold text-[#009179]">
          {copyright}
        </p>
      </div>
    </footer>
  );
}
