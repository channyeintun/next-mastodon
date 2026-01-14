import { NextRequest, NextResponse } from 'next/server';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json(
            { error: 'Missing url parameter' },
            { status: 400, headers: CORS_HEADERS }
        );
    }

    try {
        const response = await fetch(targetUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Target URL returned ${response.status}: ${response.statusText}` },
                { status: response.status === 404 ? 404 : 502, headers: CORS_HEADERS }
            );
        }

        const contentType = response.headers.get('content-type');
        const blob = await response.blob();

        return new NextResponse(blob, {
            headers: {
                ...CORS_HEADERS,
                'Content-Type': contentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Proxy failed to fetch the URL' },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
