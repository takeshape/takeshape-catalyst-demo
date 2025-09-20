import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';

import { AiChat } from './chat';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <Header />

      <main>{children}</main>
      <AiChat apiKey={process.env.TS_API_KEY} endpoint={process.env.TS_API_ENDPOINT} />
      <Footer />
    </>
  );
}

export const experimental_ppr = true;
