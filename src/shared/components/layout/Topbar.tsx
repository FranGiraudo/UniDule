export function Topbar() {

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header id="topbar">
      <div>
        <div id="topbar-title">DASHBOARD</div>
        <div id="topbar-date">{formattedDate}</div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* We can add quick action buttons here later if needed */}
      </div>
    </header>
  );
}
