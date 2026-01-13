import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || 'Headless Firebase CMS';
    const subtitle = searchParams.get('subtitle') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 80px',
              textAlign: 'center',
            }}
          >
            {subtitle && (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#2563eb',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {subtitle}
              </div>
            )}
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                marginBottom: 24,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: '#2563eb',
                  borderRadius: 8,
                  marginRight: 12,
                }}
              />
              <div style={{ fontSize: 20, fontWeight: 600, color: '#64748b' }}>
                Headless Firebase CMS
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
