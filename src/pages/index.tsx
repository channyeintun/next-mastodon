import Head from 'next/head';
import { MainLayout } from '@/components/layouts/MainLayout';
import { TimelinePage } from '@/components/organisms';

export default function HomePage() {
    return (
        <MainLayout>
            <Head>
                <title>Home - Mastodon</title>
                <meta name="description" content="Your home timeline on Mastodon" />
            </Head>
            <TimelinePage />
        </MainLayout>
    );
}
