'use client';

/**
 * Skeleton loading placeholder for Account Profile section
 */
export function AccountProfileSkeleton() {
  return (
    <div>
      {/* Profile Header Image */}
      <div
        style={{
          width: '100%',
          height: '200px',
          background: 'var(--surface-3)',
          borderRadius: 'var(--radius-3)',
          marginBottom: 'calc(-1 * var(--size-8))',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Profile Info */}
      <div style={{ padding: 'var(--size-4)', paddingTop: 'var(--size-2)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: 'var(--size-3)',
          }}
        >
          {/* Avatar skeleton */}
          <div
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'var(--surface-3)',
              border: '4px solid var(--surface-1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />

          {/* Follow button skeleton */}
          <div
            style={{
              width: '100px',
              height: '36px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>

        {/* Display name and username */}
        <div style={{ marginBottom: 'var(--size-3)' }}>
          <div
            style={{
              width: '50%',
              height: '28px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-1)',
              marginBottom: 'var(--size-2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div
            style={{
              width: '35%',
              height: '20px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 'var(--size-3)' }}>
          <div
            style={{
              width: '100%',
              height: '16px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-1)',
              marginBottom: 'var(--size-2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div
            style={{
              width: '90%',
              height: '16px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-1)',
              marginBottom: 'var(--size-2)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          <div
            style={{
              width: '70%',
              height: '16px',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        </div>

        {/* Fields (metadata) */}
        <div style={{ marginBottom: 'var(--size-3)' }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 'var(--size-2)',
                padding: 'var(--size-2) 0',
                borderBottom:
                  i < 2 ? '1px solid var(--surface-3)' : 'none',
              }}
            >
              <div
                style={{
                  width: '80%',
                  height: '16px',
                  background: 'var(--surface-3)',
                  borderRadius: 'var(--radius-1)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <div
                style={{
                  width: '60%',
                  height: '16px',
                  background: 'var(--surface-3)',
                  borderRadius: 'var(--radius-1)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            </div>
          ))}
        </div>

        {/* Joined date */}
        <div
          style={{
            width: '40%',
            height: '16px',
            background: 'var(--surface-3)',
            borderRadius: 'var(--radius-1)',
            marginBottom: 'var(--size-3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-4)',
            marginBottom: 'var(--size-4)',
          }}
        >
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '100px',
                height: '20px',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-1)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          ))}
        </div>

        {/* External link */}
        <div
          style={{
            width: '150px',
            height: '16px',
            background: 'var(--surface-3)',
            borderRadius: 'var(--radius-1)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>
    </div>
  );
}
