import zipfile
import re
import sys

def docx_plain(path: str) -> str:
    with zipfile.ZipFile(path) as z:
        data = z.read("word/document.xml").decode("utf-8")
    data = data.replace("</w:p>", "\n").replace("<w:tab/>", " ")
    data = re.sub(r"<[^>]+>", "", data)
    for a, b in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"')]:
        data = data.replace(a, b)
    data = re.sub(r"[ \t\f\v]+", " ", data)
    data = re.sub(r"\n\s*\n+", "\n\n", data)
    return data.strip()


if __name__ == "__main__":
    path = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "-"
    text = docx_plain(path)
    if out == "-":
        sys.stdout.buffer.write(text.encode("utf-8"))
    else:
        with open(out, "w", encoding="utf-8") as f:
            f.write(text)
