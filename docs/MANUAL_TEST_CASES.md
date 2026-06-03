
# BilaKey Manual Test Cases

1. Open any text field and select BilaKey.
2. Test: `chuw Space` → `chữ `.
3. Test continuous typing: `chuw Space wias Space` → `chữ nghĩa `.
4. Test: `Chaol Space banr Space` → `Chào bạn `.
5. Test existing Unicode: `chào Space` → `chào `, never `chaol`.
6. Test duplicate spaces: pressing Space repeatedly with empty composing must not create a long run of spaces.
7. Test Backspace while composing: type `wias`, backspace twice; only the composing token changes.
