// =====================================================================
//  ALL NUTRIENT STANDARDS the app can compare with.
//  To add NRC later: make src/data/standards/nrc-2006.ts like fediaf-2025.ts,
//  then add it to this list. NRC becomes the default when it is here.
// =====================================================================
import type { Standard } from "@/lib/data/standards-schema";
import { fediaf2025 } from "./fediaf-2025";

export const standards: Standard[] = [fediaf2025];

/** The standard picked when the page opens: NRC if it exists, otherwise FEDIAF */
export const defaultStandardId = standards.find((s) => s.id.startsWith("nrc"))?.id ?? standards[0].id;
