import Head from 'next/head';
import { MainLayout } from '@/components/layouts/MainLayout';
import { TrendingContent } from '@/components/organisms/TrendingContent';

export default function ExplorePage() {
    return (
        <MainLayout>
            <Head>
                <title>Explore - Mastodon</title>
                <meta name="description" content="Explore trending posts, hashtags, and links on Mastodon" />
            </Head>
            <TrendingContent
                scrollRestorationPrefix="explore"
            />
        </MainLayout>
    );
}
