"""Convert the PRD and Design Doc markdown files to Word (.docx) format.

Uses only the Python standard library: builds the OOXML package by hand.
Usage: python scripts/md_to_docx.py
Outputs: PRD-skillbridge.docx and DESIGN-DOC-workfinder-dashboard.docx
"""
import re
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------- OOXML bits
CT = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    '</Types>'
)
RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    '</Relationships>'
)
DOC_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    '</Relationships>'
)

def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def run(text: str, bold=False, italic=False, size=None, color=None, mono=False) -> str:
    props = []
    if bold: props.append("<w:b/>")
    if italic: props.append("<w:i/>")
    if mono: props.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>')
    if size: props.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')
    if color: props.append(f'<w:color w:val="{color}"/>')
    rpr = f'<w:rPr>{"".join(props)}</w:rPr>' if props else ""
    # preserve spaces / line breaks inside a run
    parts = esc(text).split("\n")
    body = "".join(
        (f'<w:t xml:space="preserve">{p}</w:t>' if p else "") + ("<w:br/>" if i < len(parts) - 1 else "")
        for i, p in enumerate(parts)
    )
    return f'<w:r>{rpr}{body}</w:r>'

def para(runs: str, spacing_before=0, spacing_after=120, indent=0, bullet=False) -> str:
    props = ['<w:spacing w:before="%d" w:after="%d"/>' % (spacing_before, spacing_after)]
    if bullet:
        props.append('<w:ind w:left="%d" w:hanging="240"/>' % (indent + 360))
    elif indent:
        props.append('<w:ind w:left="%d"/>' % indent)
    ppr = f'<w:pPr>{"".join(props)}</w:pPr>'
    return f'<w:p>{ppr}{runs}</w:p>'

def table(rows) -> str:
    if not rows:
        return ""
    ncols = max(len(r) for r in rows)
    borders = (
        '<w:tblBorders>'
        + "".join(
            f'<w:{s} w:val="single" w:sz="4" w:color="D9DCE1"/>'
            for s in ("top", "left", "bottom", "right", "insideH", "insideV")
        )
        + '</w:tblBorders>'
    )
    width = f'<w:tblW w:w="{ncols * 1600}" w:type="dxa"/>'
    xml = [f'<w:tbl>{width}{borders}']
    for ri, row in enumerate(rows):
        cells = []
        for ci in range(ncols):
            txt = row[ci] if ci < len(row) else ""
            shade = '<w:shd w:val="clear" w:fill="EEF2F7"/>' if ri == 0 else ""
            rpr = '<w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>'
            cell_runs = parse_inline(txt, bold=(ri == 0), size=19)
            cells.append(
                f'<w:tc><w:tcPr>{shade}</w:tcPr><w:p>{rpr}{cell_runs}</w:p></w:tc>'
            )
        xml.append(f'<w:tr>{"".join(cells)}</w:tr>')
    xml.append('</w:tbl>')
    return "".join(xml)

def parse_inline(text: str, bold=False, size=None) -> str:
    """Handle **bold**, *italic*, `code`, and bare text."""
    out = []
    token_re = re.compile(r"(\*\*.+?\*\*|\*[^*]+?\*|`[^`]+?`)")
    for part in token_re.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            out.append(run(part[2:-2], bold=True, size=size))
        elif part.startswith("`") and part.endswith("`"):
            out.append(run(part[1:-1], mono=True, size=size or 19, color="C7254E"))
        elif part.startswith("*") and part.endswith("*") and len(part) > 2:
            out.append(run(part[1:-1], italic=True, size=size))
        else:
            out.append(run(part, bold=bold, size=size))
    return "".join(out)

HEAD_SIZES = {1: 32, 2: 26, 3: 23, 4: 21, 5: 20, 6: 20}
HEAD_COLORS = {1: "111111", 2: "1F3864", 3: "2E4A7A", 4: "444444", 5: "444444", 6: "444444"}

# ---------------------------------------------------------------- markdown parser
def md_to_body(md: str) -> str:
    body = []
    lines = md.split("\n")
    i, n = 0, len(lines)
    in_code = False
    code_buf = []

    def flush_table(buf):
        rows = []
        for line in buf:
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
                continue  # separator row
            rows.append(cells)
        if rows:
            body.append(table(rows))
            body.append(para("", spacing_after=80))

    table_buf = []
    while i < n:
        line = lines[i]
        stripped = line.strip()

        # tables
        if stripped.startswith("|") and not in_code:
            table_buf.append(stripped)
            i += 1
            continue
        elif table_buf:
            flush_table(table_buf)
            table_buf = []

        # code fences
        if stripped.startswith("```"):
            if in_code:
                for cl in code_buf:
                    body.append(para(run(cl or " ", mono=True, size=18), indent=360, spacing_after=0))
                code_buf = []
                in_code = False
                body.append(para("", spacing_after=80))
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        if not stripped:
            i += 1
            continue

        # horizontal rule
        if re.fullmatch(r"-{3,}", stripped):
            body.append(para(run("─" * 60, color="CCCCCC"), spacing_before=60, spacing_after=120))
            i += 1
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            lvl = len(m.group(1))
            text = m.group(2).strip()
            if lvl == 1:
                body.append(para(parse_inline(text, bold=True, size=HEAD_SIZES[1]),
                                 spacing_before=120, spacing_after=200))
            else:
                body.append(para(parse_inline(text, bold=True, size=HEAD_SIZES.get(lvl, 20), ),
                                 spacing_before=240, spacing_after=120))
            i += 1
            continue

        # checklist / bullets
        m = re.match(r"^[-*]\s+\[( |x)\]\s+(.*)$", stripped)
        if m:
            mark = "☑" if m.group(1) == "x" else "☐"
            body.append(para(run(f"{mark} ") + parse_inline(m.group(2)), bullet=True))
            i += 1
            continue
        m = re.match(r"^[-*]\s+(.*)$", stripped)
        if m:
            body.append(para(run("•  ") + parse_inline(m.group(1)), bullet=True))
            i += 1
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m:
            body.append(para(run(f"{m.group(1)}.  ", bold=True) + parse_inline(m.group(2)),
                             bullet=True))
            i += 1
            continue

        # plain paragraph (merge single-line; blank lines split paragraphs)
        body.append(para(parse_inline(stripped)))
        i += 1

    if table_buf:
        flush_table(table_buf)
    return "".join(body)

def make_docx(md_path: Path, out_path: Path):
    md = md_path.read_text(encoding="utf-8")
    body = md_to_body(md)
    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:body>' + body +
        '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr>'
        '</w:body></w:document>'
    )
    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:docDefaults><w:rPrDefault><w:rPr>'
        '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>'
        '<w:sz w:val="21"/><w:szCs w:val="21"/>'
        '</w:rPr></w:rPrDefault></w:docDefaults></w:styles>'
    )
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CT)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/document.xml", document)
        z.writestr("word/styles.xml", styles)
    print(f"OK  {out_path.name}")

if __name__ == "__main__":
    for name in ("PRD-skillbridge.md", "DESIGN-DOC-workfinder-dashboard.md"):
        src = ROOT / name
        dst = ROOT / name.replace(".md", ".docx")
        if src.exists():
            make_docx(src, dst)
        else:
            print(f"SKIP {name} (not found)")
