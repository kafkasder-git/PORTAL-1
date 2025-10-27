'use client';

export default function TestPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #dbeafe, white, #dbeafe)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>
          ✅ Next.js Çalışıyor!
        </h1>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Bu sayfa görünüyorsa, Next.js doğru şekilde çalışıyor demektir.
        </p>
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '4px' }}>
          <p style={{ fontSize: '14px', marginBottom: '0.5rem' }}>
            <strong>Test adımları:</strong>
          </p>
          <ol style={{ fontSize: '14px', paddingLeft: '1.5rem', color: '#334155' }}>
            <li>Bu sayfayı görüyorsanız ✓</li>
            <li><a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>Login sayfasına git</a></li>
            <li>Giriş yapın ve dashboard'a gidin</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
