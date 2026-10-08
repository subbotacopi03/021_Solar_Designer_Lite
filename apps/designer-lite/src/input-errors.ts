import { ZodError } from "zod";
import { CalculationRangeError } from "../../../packages/core/src/numerical-safety.js";

export function formatInputError(error: unknown, lang: "uk" | "en"): string {
  const uk = lang === "uk";
  if (error instanceof CalculationRangeError)
    return uk
      ? `Результат виходить за числовий діапазон (${error.path}). Перевірте значення й одиниці; розрахунок не застосовано.`
      : `Result exceeds the numeric range (${error.path}). Check values and units; calculation was not applied.`;
  if (error instanceof SyntaxError)
    return uk
      ? "Некоректний JSON. Перевірте формат файлу або тексту."
      : "Invalid JSON. Check the file or text format.";
  if (!(error instanceof ZodError))
    return error instanceof Error ? error.message : String(error);
  const issue = error.issues[0];
  if (!issue) return uk ? "Перевірте введені дані." : "Check the input data.";
  const field = String(issue.path.at(-1) ?? "");
  const fields: Record<string, string> = {
    beta_voc_pct_c: "βVoc (%/°C)",
    beta_vmp_pct_c: "βVmp (%/°C)",
    alpha_isc_pct_c: "αIsc (%/°C)",
    gamma_pmax_pct_c: "γPmax (%/°C)",
    module_count: uk ? "Кількість модулів" : "Module count",
    inverter_quantity: uk ? "Кількість інверторів" : "Inverter count",
    modules: uk ? "Модулі у стрінгу" : "Modules per string",
    length_m: uk ? "Довжина траси (m)" : "Route length (m)",
  };
  const label =
    fields[field] ?? (issue.path.join(".") || (uk ? "Проєкт" : "Project"));
  let reason = uk ? "перевірте значення" : "check the value";
  if (issue.code === "too_big" || issue.code === "too_small") {
    const operator =
      issue.code === "too_big"
        ? issue.inclusive
          ? "≤"
          : "<"
        : issue.inclusive
          ? "≥"
          : ">";
    const bound = issue.code === "too_big" ? issue.maximum : issue.minimum;
    reason = `${uk ? "значення має бути" : "value must be"} ${operator} ${String(bound)}`;
  } else if (issue.code === "invalid_type") {
    reason =
      issue.expected === "number"
        ? uk
          ? "потрібне числове значення"
          : "a numeric value is required"
        : uk
          ? "неправильний тип значення"
          : "invalid value type";
  } else if (issue.code === "custom") reason = issue.message;
  const more = error.issues.length - 1;
  return `${label}: ${reason}.${more ? ` ${uk ? "Ще помилок" : "Additional errors"}: ${more}.` : ""}`;
}
