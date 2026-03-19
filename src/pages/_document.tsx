import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/sDOLAx64.png" type="image/png" />
        <meta name="theme-color" content="#0D0F14" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="sDOLA - Inverse Finance" />
        <meta property="og:image" content="https://www.inverse.finance/assets/socials/sDOLA.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@InverseFinance" />
        <meta name="twitter:image" content="https://www.inverse.finance/assets/socials/sDOLA.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
