// Helper functions to normalize and convert iOS XML to Android XML
export function normalizeParrafoAttributes(xmlText: string) {
  return xmlText.replace(/<parrafo\s+([^>]*?)>/g, (_, attrs) => {
    const normalized = attrs.replace(/\s+/g, " ").trim();
    return `<parrafo ${normalized}>`;
  });
}

export function convertIOSXmlToAndroid(xmlText: string): string | null {
  // Normalize accidental extra spaces between attributes
  xmlText = normalizeParrafoAttributes(xmlText);

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  if (doc.getElementsByTagName("parsererror").length) {
    return null;
  }

  const relato = doc.querySelector("relato");
  if (!relato) return null;

  const datos = relato.querySelector("datos");
  const titulo = datos?.getAttribute("titulo") || "";
  const autor = datos?.getAttribute("autor") || "";

  let out = '<?xml version="1.0" encoding="utf-8"?>\n';
  out += `<relato titulo="${titulo}" autor="${autor}">\n\n`;

  const pars = relato.querySelectorAll("parrafo");
  pars.forEach((p) => {
    const just = p.getAttribute("just") || "";
    const cap = p.getAttribute("cap") || "";
    const saltolinea = p.getAttribute("saltolinea") || "";
    const sangria = p.getAttribute("sangria") || "";
    const font = p.getAttribute("font") || "";
    const size = p.getAttribute("size") || "";
    const gratis = p.getAttribute("gratis") || "";
    const img = p.getAttribute("img") || "0";
    let bloque = p.getAttribute("bloque") || "";

    // Marker conversions
    bloque = bloque.replace(
      /(\*SL\*\s*)\*C\*\s*([^*]+?)\s*\*C\*/g,
      "$1*C*$2*C*"
    );
    bloque = bloque.replace(
      /\s*\*C\*\s*([^*]+?)\s*\*C\*\s*(?=\.\*SL\*|\*SL\*|\.|\S)/,
      "*C*$1*C*"
    );
    bloque = bloque.replace(/(\S)\s*\*C\*\s*">/g, '$1*C*">');
    bloque = bloque.replace(
      /(\*SL\*\s*)\*C\*\s*([^*]+?)\s*\*C\*/g,
      "$1*C*$2*C*"
    );

    // preserve bloque verbatim (do not trim leading/trailing spaces)
    // bloque = bloque.trim();

    // font conversion
    const fontOut = font === "basica3" ? "basica2" : font;

    // saltolinea conversion
    let saltolineaOut = saltolinea;
    const saltolineaNum = parseInt(saltolinea, 10);
    if (!isNaN(saltolineaNum)) {
      if (saltolineaNum > 1) saltolineaOut = "2";
      if (saltolineaNum === 2) saltolineaOut = "1";
    }

    // img conversion
    const imgOut =
      img === "imagen_pruebas_barra_f-0-0" ? "filigrana00-f-0-0" : img;

    // Build line parts
    const lineParts: string[] = [];
    lineParts.push("\t<parrafo>");
    // do not prefix SPACES_190 inside <just>; keep the value verbatim
    lineParts.push(` <just>${just}</just>`);
    
    lineParts.push(` <cap>${cap}</cap>`);
    lineParts.push(` <saltolinea>${saltolineaOut}</saltolinea>`);
    lineParts.push(` <sangria>${sangria}</sangria>`);
    lineParts.push(` <font>${fontOut}</font>`);
    lineParts.push(` <size>${size}</size>`);
    lineParts.push(` <gratis>${gratis}</gratis>`);
    lineParts.push(` <img>${imgOut}</img>`);
    lineParts.push(` <bloque>${bloque}</bloque></parrafo>`);
    
    out += lineParts.join("") + "\n";
  });

  out += "\n</relato>";
  return out;
}
