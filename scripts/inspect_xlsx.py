from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

path = Path(r'C:\Users\rezen\OneDrive\Desktop\RuralCommerce\Formulario de Postulación - Rural Commerce.xlsx')

with zipfile.ZipFile(path) as z:
    print('ENTRIES:')
    for name in z.namelist():
        print(name)

    print('\nSHARED STRINGS:')
    shared = z.read('xl/sharedStrings.xml')
    root = ET.fromstring(shared)
    ns = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
    strings = []
    for si in root.findall(ns + 'si'):
        text = ''.join((node.text or '') for node in si.iter(ns + 't'))
        strings.append(text)
    for i, s in enumerate(strings):
        print(f'[{i}] {s}')

    print('\nWORKSHEET CELLS:')
    for name in z.namelist():
        if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
            print(f'--- {name} ---')
            root = ET.fromstring(z.read(name))
            for c in root.iter(ns + 'c'):
                r = c.attrib.get('r')
                t = c.attrib.get('t')
                v = c.find(ns + 'v')
                if v is not None and v.text is not None:
                    value = v.text
                    if t == 's':
                        value = strings[int(value)]
                    print(f'{r} => {value}')
