
# BilaKey Core Stable SOP v1.2.2

## Core law

> IME chỉ xử lý token đang composing; mọi text đã commit là bất khả xâm phạm.

## Required behavior

- `handleCharacter()` appends to `composing` and calls `setComposingText(raw, 1)`.
- `handleSpace()` only reads `composing`, converts that token, calls `commitText(converted + " ", 1)`, then clears `composing`.
- `handleSpace()` must not call `getTextBeforeCursor()` or `deleteSurroundingText()`.
- IME runtime exposes only CVNSS/CVSS → Vietnamese Unicode.
- Unicode → CVNSS is forbidden inside `BilaKeyImeService`.

## Mandatory gate tests

```text
chuw Space                    → chữ
chuw Space wias Space         → chữ nghĩa
Chaol Space                   → Chào
Chaol Space banr Space        → Chào bạn
chào Space                    → chào
Space Space Space             → one space only when no composing token
```

## Safe UI changes

Icon, colors, labels, layout sizing, README text, MainActivity text, workflow artifact names, Gradle version metadata.

## Forbidden without core review

`composing`, `handleSpace`, `handleCharacter`, `CvnssConverter`, `InputConnection` transaction logic.
