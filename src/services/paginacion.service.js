export async function consultarPagina(findMany, { limit, cursor }, query = {}) {
  const registros = await findMany({
    ...query,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  const hayMas = registros.length > limit;
  const items = hayMas ? registros.slice(0, limit) : registros;

  return {
    items,
    hasMore: hayMas,
    nextCursor: hayMas ? items.at(-1).id : null,
  };
}
