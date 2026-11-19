export default async function Page({ params }) {
  const { codigo } = await params;
  const editorUrl = `/inicio/editar-molecula.html?codigo=${encodeURIComponent(codigo)}`;

  return (
    <iframe
      title="Editar molécula"
      src={editorUrl}
      style={{ border: 0, display: "block", width: "100%", height: "100vh" }}
    />
  );
}
