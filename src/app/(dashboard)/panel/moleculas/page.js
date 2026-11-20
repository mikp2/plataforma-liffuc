export default async function Page({ searchParams }) {
  const search = await searchParams;
  const species = search?.especie;
  const catalogUrl = species
    ? `/inicio/moleculas.html?especie=${encodeURIComponent(species)}`
    : "/inicio/moleculas.html";

  return (
    <iframe
      title="Catálogo de moléculas"
      src={catalogUrl}
      style={{ border: 0, display: "block", width: "100%", height: "100vh" }}
    />
  );
}
