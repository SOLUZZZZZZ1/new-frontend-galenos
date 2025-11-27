export default function Cancel(){
  return (
    <main className="sr-container py-12">
      <h1 className="sr-h1">Suscripción cancelada</h1>
      <p className="sr-p">No se ha procesado el cargo. Puedes reintentarlo cuando quieras.</p>
      <a className="sr-btn-secondary mt-4 inline-block" href="/suscripcion">Reintentar</a>
    </main>
  );
}
