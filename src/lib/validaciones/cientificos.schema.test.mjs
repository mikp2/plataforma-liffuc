import assert from "node:assert/strict";
import test from "node:test";
import { bioensayoInputSchema, resultadoBioensayoInputSchema } from "./bioensayo.schema.js";
import { muestraBotanicaInputSchema } from "./muestra-botanica.schema.js";

test("cada resultado de bioensayo exige exactamente un material", () => {
  const valid = {
    extractoId: "extracto-1",
    valor: 42,
    unidadResultado: "%",
  };
  assert.equal(resultadoBioensayoInputSchema.safeParse(valid).success, true);
  assert.equal(
    resultadoBioensayoInputSchema.safeParse({ ...valid, fraccionId: "fraccion-1" }).success,
    false,
  );
  assert.equal(
    resultadoBioensayoInputSchema.safeParse({ valor: 42, unidadResultado: "%" }).success,
    false,
  );
});

test("resultados cuantitativos requieren concentración y unidades emparejadas", () => {
  assert.equal(
    resultadoBioensayoInputSchema.safeParse({
      moleculaId: "molecula-1",
      concentracion: 10,
      unidadConcentracion: "µg/mL",
      valor: 75,
      unidadResultado: "%",
    }).success,
    true,
  );
  assert.equal(
    resultadoBioensayoInputSchema.safeParse({
      moleculaId: "molecula-1",
      valor: 75,
    }).success,
    false,
  );
  assert.equal(
    resultadoBioensayoInputSchema.safeParse({
      moleculaId: "molecula-1",
      interpretacion: "Sin actividad observable",
    }).success,
    true,
  );
});

test("bioensayo y muestra botanica validan fechas y coordenadas", () => {
  assert.equal(
    bioensayoInputSchema.safeParse({
      codigo: "BIO-1",
      tipo: "FARMACOLOGICO",
      objetivo: "Evaluar actividad",
      fechaInicio: "2025-02-02",
      fechaFin: "2025-02-01",
    }).success,
    false,
  );
  assert.equal(muestraBotanicaInputSchema.safeParse({ latitud: 12 }).success, false);
  assert.equal(
    muestraBotanicaInputSchema.safeParse({ latitud: 12, longitud: -73 }).success,
    true,
  );
  assert.deepEqual(
    muestraBotanicaInputSchema.parse({ numeroVoucher: "", herbario: "" }),
    { numeroVoucher: null, herbario: null },
  );
});
