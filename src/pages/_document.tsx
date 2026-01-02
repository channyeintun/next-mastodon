import Document, { Html, Head, Main, NextScript, type DocumentContext, type DocumentInitialProps } from 'next/document';
import { parseCookies } from '@/utils/cookies';

interface MyDocumentProps extends DocumentInitialProps {
    dataTheme?: 'light' | 'dark';
}

export default class MyDocument extends Document<MyDocumentProps> {
    static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
        const initialProps = await Document.getInitialProps(ctx);

        // Read theme cookie from request headers (server-side only)
        const cookieHeader = ctx.req?.headers.cookie || '';
        const cookies = parseCookies(cookieHeader);
        const theme = cookies.theme as 'light' | 'dark' | 'auto' | undefined;

        // For SSR: only set data-theme if user explicitly chose light or dark
        // If auto or undefined, let client handle it to avoid forcing wrong default
        const dataTheme = theme === 'light' || theme === 'dark' ? theme : undefined;

        return {
            ...initialProps,
            dataTheme,
        };
    }

    render() {
        return (
            <Html lang="en" data-theme={this.props.dataTheme}>
                <Head>
                    <meta name="theme-color" content="#6364ff" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

