import React from 'react';

export interface LeasingProviderLogoProps {
  slug: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon' | 'full';
  className?: string;
}

export const LEASING_PROVIDER_METADATA: Record<
  string,
  {
    name: string;
    tagline: string;
    primaryColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    websiteUrl: string;
  }
> = {
  jobrad: {
    name: 'JobRad',
    tagline: 'Pionier & Marktführer für Dienstrad-Leasing',
    primaryColor: '#00A368',
    bgColor: '#E6F7F0',
    textColor: '#006644',
    borderColor: '#A3E5C8',
    websiteUrl: 'https://www.jobrad.de'
  },
  bikeleasing: {
    name: 'Bikeleasing-Service',
    tagline: 'Digitale Dienstrad-Verwaltung & schneller Freigabeprozess',
    primaryColor: '#009FE3',
    bgColor: '#E6F6FD',
    textColor: '#00628F',
    borderColor: '#99DCF8',
    websiteUrl: 'https://www.bikeleasing.de'
  },
  businessbike: {
    name: 'BusinessBike',
    tagline: 'Einfaches Leasing mit Rundum-Schutz & Vollkaskoversicherung',
    primaryColor: '#FF5500',
    bgColor: '#FFF0EA',
    textColor: '#B83200',
    borderColor: '#FFC2A8',
    websiteUrl: 'https://www.businessbike.de'
  },
  'deutsche-dienstrad': {
    name: 'Deutsche Dienstrad',
    tagline: 'Tradition trifft modernste digitale Mobilitätsplattform',
    primaryColor: '#C8102E',
    bgColor: '#FDF0F2',
    textColor: '#8A081D',
    borderColor: '#F5B8C2',
    websiteUrl: 'https://www.deutsche-dienstrad.de'
  },
  eurorad: {
    name: 'Eurorad',
    tagline: 'Dienstrad-Leasing der ZEG mit deutschlandweitem Servicenetz',
    primaryColor: '#003399',
    bgColor: '#EBF1FC',
    textColor: '#002266',
    borderColor: '#A6C2F7',
    websiteUrl: 'https://www.eurorad.de'
  },
  'lease-a-bike': {
    name: 'Lease a Bike',
    tagline: 'Mobiles Dienstrad-Leasing powered by Pon Bike Group',
    primaryColor: '#FFDE00',
    bgColor: '#FFFDE6',
    textColor: '#735E00',
    borderColor: '#FFE855',
    websiteUrl: 'https://www.lease-a-bike.de'
  }
};

/**
 * Standardized Company Logo Component for German Dienstrad Leasing Providers
 * Provides high-contrast, scalable, retina-ready brand emblems and badges.
 */
export const LeasingProviderLogo: React.FC<LeasingProviderLogoProps> = ({
  slug,
  name,
  size = 'sm',
  variant = 'icon',
  className = ''
}) => {
  const normSlug = (slug || '').toLowerCase().trim();
  const meta = LEASING_PROVIDER_METADATA[normSlug];
  const displayName = name || meta?.name || slug;

  // Size dimensions
  const dims = (
    {
      xs: { box: 'w-4 h-4', icon: 16, text: 'text-[10px]' },
      sm: { box: 'w-6 h-6', icon: 24, text: 'text-xs' },
      md: { box: 'w-8 h-8', icon: 32, text: 'text-sm' },
      lg: { box: 'w-10 h-10', icon: 40, text: 'text-base' }
    } as const
  )[size] || { box: 'w-6 h-6', icon: 24, text: 'text-xs' };

  // Specific Brand Logo Graphics
  const renderEmblem = () => {
    switch (normSlug) {
      case 'jobrad':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="JobRad Logo"
          >
            <rect width="40" height="40" rx="10" fill="#00A368" />
            {/* Dynamic gear & cycle wheel motif */}
            <circle cx="20" cy="20" r="13" stroke="white" strokeWidth="2.8" strokeDasharray="5 2.5" />
            <circle cx="20" cy="20" r="7.5" fill="white" />
            <circle cx="20" cy="20" r="3.5" fill="#00A368" />
            <path d="M11 20H29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M20 11V29" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      case 'bikeleasing':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Bikeleasing-Service Logo"
          >
            <rect width="40" height="40" rx="10" fill="#009FE3" />
            {/* Infinity bike loop motif */}
            <circle cx="14" cy="20" r="6" stroke="white" strokeWidth="2.8" />
            <circle cx="26" cy="20" r="6" stroke="white" strokeWidth="2.8" />
            <path
              d="M14 14C17.5 14 22.5 26 26 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M14 26C17.5 26 22.5 14 26 14"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="2.2" fill="#0A2540" />
          </svg>
        );

      case 'businessbike':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="BusinessBike Logo"
          >
            <rect width="40" height="40" rx="10" fill="#FF5500" />
            {/* Bold angled frame & BB road badge */}
            <path
              d="M11 24L16 13H24L21 20H27L19 28L21 22H15L11 24Z"
              fill="white"
            />
            <circle cx="13" cy="27" r="3.2" stroke="white" strokeWidth="2" />
            <circle cx="27" cy="27" r="3.2" stroke="white" strokeWidth="2" />
          </svg>
        );

      case 'deutsche-dienstrad':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Deutsche Dienstrad Logo"
          >
            <rect width="40" height="40" rx="10" fill="#1D2A44" />
            {/* Stylized D wheel with Crimson & Gold accents */}
            <path
              d="M12 12H21C26.5 12 29 15.5 29 20C29 24.5 26.5 28 21 28H12V12Z"
              stroke="#C8102E"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="20" cy="20" r="4.5" fill="#FFCC00" />
            <path d="M12 20H17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="21" cy="20" r="1.5" fill="#1D2A44" />
          </svg>
        );

      case 'eurorad':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Eurorad Logo"
          >
            <rect width="40" height="40" rx="10" fill="#003399" />
            {/* Euro golden stars ring around cycling gear */}
            <circle cx="20" cy="20" r="12" stroke="#FFCC00" strokeWidth="1.5" strokeDasharray="2 3.5" />
            <circle cx="20" cy="20" r="6" fill="#FFCC00" />
            <circle cx="20" cy="20" r="2.8" fill="#003399" />
            <path d="M20 9L20.8 11.5H23.4L21.3 13.1L22.1 15.5L20 14L17.9 15.5L18.7 13.1L16.6 11.5H19.2L20 9Z" fill="#FFCC00" />
          </svg>
        );

      case 'lease-a-bike':
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Lease a Bike Logo"
          >
            <rect width="40" height="40" rx="10" fill="#FFDE00" />
            {/* Iconic yellow & black bike silhouette */}
            <circle cx="13" cy="24" r="5" stroke="#111111" strokeWidth="2.8" />
            <circle cx="27" cy="24" r="5" stroke="#111111" strokeWidth="2.8" />
            <path
              d="M13 24L18 16H23L27 24M18 16L21 24H13"
              stroke="#111111"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M21 13H24" stroke="#111111" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="Leasing Provider Logo"
          >
            <rect width="40" height="40" rx="10" fill="#059669" />
            <circle cx="15" cy="23" r="5" stroke="white" strokeWidth="2.5" />
            <circle cx="25" cy="23" r="5" stroke="white" strokeWidth="2.5" />
            <path d="M15 23L19 16H22L25 23" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border font-semibold ${dims.text} ${className}`}
        style={{
          backgroundColor: meta?.bgColor || '#F0FDF4',
          borderColor: meta?.borderColor || '#BBF7D0',
          color: meta?.textColor || '#166534'
        }}
      >
        <span className={`${dims.box} shrink-0 rounded overflow-hidden shadow-2xs`}>
          {renderEmblem()}
        </span>
        <span className="truncate">{displayName}</span>
      </span>
    );
  }

  return (
    <div
      className={`${dims.box} shrink-0 rounded-lg overflow-hidden flex items-center justify-center shadow-2xs ${className}`}
      title={displayName}
    >
      {renderEmblem()}
    </div>
  );
};
