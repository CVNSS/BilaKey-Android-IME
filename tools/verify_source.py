#!/usr/bin/env python3
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
ime = (root/'app/src/main/java/com/cvnss/bilakey/BilaKeyImeService.java').read_text(encoding='utf-8')
manifest = (root/'app/src/main/AndroidManifest.xml').read_text(encoding='utf-8')
conv = (root/'app/src/main/java/com/cvnss/bilakey/CvnssConverter.java').read_text(encoding='utf-8')

assert 'android.permission.INTERNET' not in manifest, 'INTERNET permission is forbidden'
assert 'CORE_FINGERPRINT' in ime and 'TOKEN-COMPOSE' in ime, 'missing core fingerprint'
assert 'ic.commitText(converted + " ", 1)' in ime, 'Space must commit converted token + space'
assert 'TOKEN-ONLY COMMIT' in ime, 'missing token-only marker'

def strip_java_comments(text: str) -> str:
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
    text = re.sub(r'//.*', '', text)
    return text

def method_body(src: str, signature: str) -> str:
    start = src.index(signature)
    brace = src.index('{', start)
    depth = 0
    for i in range(brace, len(src)):
        if src[i] == '{':
            depth += 1
        elif src[i] == '}':
            depth -= 1
            if depth == 0:
                return src[brace:i+1]
    raise AssertionError(f'Cannot parse method body: {signature}')

handle_space = strip_java_comments(method_body(ime, 'private void handleSpace()'))
assert 'deleteSurroundingText' not in handle_space, 'handleSpace must not delete committed text'
assert 'getTextBeforeCursor' not in handle_space, 'handleSpace must not read previous committed text'

for bad in ['unicodeToCvnss', 'cqnToCvss', 'VIETNAMESE_TO_CVNSS']:
    assert bad not in ime, f'forbidden reverse-conversion marker in IME: {bad}'
assert 'containsVietnameseUnicode' in conv, 'converter must preserve Vietnamese Unicode tokens'
print('PASS: BilaKey Core Stable source gate')
