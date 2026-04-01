import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { translations, type Lang } from '@/lib/i18n';

const Providers = dynamic(() => import('../providers'), { ssr: false });

const SITE_URL = 'https://sdola.inverse.finance';
const OG_IMAGE = 'https://inverse.finance/assets/social-previews/sDOLA-v3.jpeg';
const LANGS = Object.keys(translations) as Lang[];

function MyApp({ Component, pageProps, router }: AppProps) {
  const locale = (router.locale ?? 'en') as Lang;
  const t = translations[locale in translations ? locale : 'en'];
  const canonicalPath = locale === 'en' ? '' : `/${locale}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return (
    <>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <meta name="keywords" content={t.metaKeywords} />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="sDOLA Earn" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@InverseFinance" />
        <meta name="twitter:title" content={t.metaTitle} />
        <meta name="twitter:description" content={t.metaDescription} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <link rel="canonical" href={canonicalUrl} />
        {LANGS.map(lang => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={`${SITE_URL}${lang === 'en' ? '' : `/${lang}`}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
      </Head>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </>
  );
}

export default MyApp;
