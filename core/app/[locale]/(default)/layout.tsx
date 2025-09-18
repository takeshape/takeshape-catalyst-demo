import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { AiChatWidget } from '@takeshape/react-chat-agent';

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
      <AiChatWidget
        apiKey={process.env.TS_API_KEY}
        endpoint={process.env.TS_API_ENDPOINT}
        welcomeMessage="Hi! How can I help you?"
      />
      <Footer />
    </>
  );
}

export const experimental_ppr = true;
