import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html className="bg-custom-bg-light dark:bg-custom-bg-dark">
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.2/css/all.min.css"
        />
      </Head>

      <body className="max-w-1920 mx-auto bg-custom-light dark:bg-custom-bg-dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
