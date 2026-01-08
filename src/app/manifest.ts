import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Next Mastodon',
        short_name: 'Mastodon',
        description: 'Decentralized social media',
        start_url: '/',
        display: 'standalone',
        background_color: '#1C1C1D',
        theme_color: '#6364ff',
        icons: [
            {
                src: '/icon.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}
