# BilaKey Core Stable — DeepTech Core SOP

**Tài liệu chuẩn vận hành lõi phần mềm cho các phiên bản BilaKey sau này**  
**Phiên bản SOP:** 1.0  
**Trạng thái:** Core Stable Contract  
**Vai trò áp dụng:** Core developer, UI developer, build/release engineer, tester  
**Mục tiêu:** Giữ BilaKey ổn định trong lúc gõ; các phiên bản sau chỉ được thay hình thức nếu không có quy trình sửa core riêng.

---

## 0. Tuyên bố lõi

> **BilaKey IME chỉ xử lý token đang composing; mọi text đã commit là bất khả xâm phạm.**

Câu này là điều khoản tối cao của BilaKey Core Stable.  
Nếu một thay đổi vi phạm câu này, thay đổi đó không được merge vào nhánh ổn định.

BilaKey là bàn phím hệ thống Android dạng IME, tối giản, offline, Unicode-only, tập trung vào một hướng duy nhất trong luồng gõ:

```text
CVNSS4.0 / CVSS ASCII  →  tiếng Việt Unicode
```

Không dùng luồng gõ IME để chuyển ngược:

```text
tiếng Việt Unicode  →  CVNSS4.0 / CVSS ASCII
```

Nếu cần công cụ chuyển ngược, phải đặt trong màn hình tiện ích riêng, không nằm trong `BilaKeyImeService`.

---

## 1. Phạm vi SOP

Tài liệu này dùng cho mọi phiên bản phát triển sau của BilaKey, gồm:

```text
BilaKey Android IME
BilaKey Mini 255KB
BilaKey Core Stable
BilaKey UI Refresh
BilaKey Build/Release Pack
BilaKey NextGen thử nghiệm
```

SOP này quy định:

```text
1. Kiến trúc lõi IME.
2. Các hàm được phép dùng.
3. Các hàm cấm dùng sai ngữ cảnh.
4. Chuẩn giao dịch composing → commit.
5. Chuẩn test bắt buộc.
6. Chuẩn build GitHub Actions.
7. Chuẩn versioning.
8. Chuẩn review trước khi release.
9. Chuẩn rollback nếu bản mới lỗi.
```

---

## 2. Nguyên tắc thiết kế cấp deeptech core

### 2.1. Một nguồn sự thật duy nhất

Trong luồng gõ, chỉ có một nguồn sự thật của token hiện tại:

```java
private final StringBuilder composing = new StringBuilder();
```

`composing` giữ **token CVNSS4.0 đang gõ**, ví dụ:

```text
chuw
wias
Chaol
banr
Tizb
Vidf
```

Không dùng `getTextBeforeCursor()` để lấy lại token hiện tại, trừ trường hợp rất đặc biệt đã có test riêng. Text trong editor không phải nguồn sự thật của token đang gõ.

---

### 2.2. Text đã commit là bất khả xâm phạm

Sau khi user bấm `Space` và BilaKey đã commit:

```text
chuw Space → chữ 
```

thì `chữ ` là text đã commit. Từ đó trở đi, BilaKey không được xóa, thay, đọc lại để chuyển đổi, hoặc kéo vào token kế tiếp.

Khi user gõ tiếp:

```text
wias
```

trạng thái đúng phải là:

```text
committed editor text: "chữ "
current composing:     "wias"
```

Không được để thành:

```text
current composing: "chuwias"
```

hoặc:

```text
delete target: "chữ wias"
```

---

### 2.3. Space chỉ commit token đang composing

Chuẩn bắt buộc:

```text
Space chỉ commit token hiện tại.
Space không đọc lại cả câu trước con trỏ.
Space không xóa từ đã commit.
Space không tái xử lý vùng text đã chốt.
Space không gọi chiều chuyển ngược Unicode → CVNSS.
```

Luồng đúng:

```text
Gõ chuw
→ setComposingText("chuw")

Bấm Space
→ converted = "chữ"
→ commitText("chữ ")
→ clear composing

Gõ wias
→ setComposingText("wias")

Bấm Space
→ converted = "nghĩa"
→ commitText("nghĩa ")
→ clear composing
```

Kết quả:

```text
chữ nghĩa 
```

---

### 2.4. Không thông minh hóa lõi bằng cách đọc/xóa vùng trước con trỏ

Không được dùng kiểu:

```java
CharSequence before = ic.getTextBeforeCursor(50, 0);
ic.deleteSurroundingText(before.length(), 0);
ic.commitText(converted, 1);
```

Lý do: nếu `before` chứa `chữ wias`, lệnh xóa sẽ xóa luôn `chữ`.

Chỉ được dùng `getTextBeforeCursor(1, 0)` cho mục đích rất hẹp: chống trùng khoảng trắng.

---

## 3. Kiến trúc thư mục chuẩn

Cấu trúc đề xuất cho mọi bản BilaKey Core Stable:

```text
app/
  src/main/
    AndroidManifest.xml
    java/com/cvnss/bilakey/
      BilaKeyImeService.java
      CvnssConverter.java
      MainActivity.java
    res/
      drawable-nodpi/bilakey_icon.png
      layout/activity_main.xml
      layout/ime_keyboard.xml
      values/strings.xml
      xml/method.xml
docs/
  CORE_STABLE_DEEPTECH_SOP.md
  CORE_REUSE_CONTRACT.md
  FINAL_AUDIT_CHECKLIST.md
  MANUAL_TEST_CASES.md
  RELEASE_CHECKLIST.md
tools/
  verify_source.py
  TestConverter.java
.github/
  workflows/
    bilakey-mini-255k.yml
BUILD_APK_ON_GITHUB.cmd
README.md
```

Nếu thêm module mới, phải giải thích vì sao cần thêm. Không thêm kiến trúc phức tạp nếu chỉ sửa giao diện.

---

## 4. Các file core và quyền sửa

### 4.1. `BilaKeyImeService.java`

Đây là trái tim của IME. File này xử lý:

```text
InputMethodService lifecycle
InputConnection
composing buffer
keyboard event
Space transaction
Backspace
Enter
Shift
mode state nếu có
```

#### Quy định

Chỉ core maintainer được sửa file này.

UI developer không được sửa file này nếu chỉ đổi:

```text
màu nền
icon
font
label
layout
dòng giới thiệu
```

#### Hàm bắt buộc phải audit khi thay đổi

```java
onCreateInputView()
onStartInputView(...)
handleCharacter(...)
handleSpace(...)
commitBuffer(...)
commitCurrentToken(...)
handleBackspace(...)
commitSingleSpace(...)
```

---

### 4.2. `CvnssConverter.java`

File này chỉ làm chuyển đổi.

Trong IME chỉ dùng hướng:

```java
cvnssToUnicodeText(...)
cvnssWordToUnicode(...)
```

hoặc tên tương đương, miễn là chức năng là:

```text
CVNSS/CVSS → Unicode tiếng Việt
```

Không được gọi các hàm chuyển ngược trong luồng gõ:

```java
unicodeToCvnss(...)
cqnToCvn(...)
cqnToCvss(...)
toCvnss(...)
encode(...)
```

Nếu bắt buộc giữ hàm chuyển ngược trong codebase, phải đặt chú thích rõ:

```java
// NOT FOR IME INPUT FLOW.
// Use only in converter tools, never in BilaKeyImeService.
```

---

### 4.3. `MainActivity.java`

File này chỉ dùng cho màn hình hướng dẫn/thông tin. Được phép sửa hình thức và nội dung hiển thị. Không được đặt logic chuyển đổi realtime của IME ở đây nếu không có lý do rõ ràng.

---

### 4.4. `method.xml`

File khai báo BilaKey là IME hệ thống. Không đổi tùy tiện.

Phải giữ ý tưởng:

```xml
<input-method ... />
```

Nếu đổi subtype, label, settingsActivity, phải test lại việc bật bàn phím trong Android Settings.

---

## 5. Chuẩn hàm core

### 5.1. `handleCharacter`

Mục tiêu: nhận một ký tự, đưa vào `composing`, hiển thị dưới dạng composing text.

Chuẩn đúng:

```java
private void handleCharacter(char ch) {
    InputConnection ic = getCurrentInputConnection();
    if (ic == null) return;

    composing.append(ch);
    ic.setComposingText(composing.toString(), 1);
}
```

Chuẩn cấm:

```java
ic.commitText(String.valueOf(ch), 1);
composing.append(ch);
```

Vì cách cấm sẽ làm raw text vào editor trước, sau đó khi `Space` lại commit Unicode thêm lần nữa, sinh lỗi:

```text
Chaol Space → ChaolChào
```

---

### 5.2. `handleSpace` / `commitBuffer`

Mục tiêu: commit token hiện tại, không đụng từ cũ.

Chuẩn đúng:

```java
private void handleSpace() {
    InputConnection ic = getCurrentInputConnection();
    if (ic == null) return;

    if (composing.length() == 0) {
        commitSingleSpace(ic);
        return;
    }

    String raw = composing.toString();
    String converted = CvnssConverter.cvnssToUnicodeText(raw).trim();

    ic.beginBatchEdit();
    ic.commitText(converted + " ", 1);
    ic.endBatchEdit();

    composing.setLength(0);
}
```

Chuẩn cấm:

```java
CharSequence before = ic.getTextBeforeCursor(50, 0);
ic.deleteSurroundingText(before.length(), 0);
ic.commitText(converted + " ", 1);
```

Lỗi sinh ra:

```text
chuw Space wias Space → nghĩa
```

Trong khi đúng là:

```text
chữ nghĩa
```

---

### 5.3. `commitSingleSpace`

Mục tiêu: chống sinh nhiều khoảng trắng khi `composing` rỗng.

Chuẩn đúng:

```java
private void commitSingleSpace(InputConnection ic) {
    CharSequence before = ic.getTextBeforeCursor(1, 0);

    if (before != null && before.length() > 0
            && Character.isWhitespace(before.charAt(0))) {
        return;
    }

    ic.commitText(" ", 1);
}
```

Quy định:

```text
Chỉ đọc 1 ký tự trước con trỏ.
Không đọc cả từ.
Không đọc cả câu.
Không deleteSurroundingText trong commitSingleSpace.
```

---

### 5.4. `handleBackspace`

Mục tiêu: sửa token đang composing; chỉ phục hồi token cuối nếu thật sự cần.

Luồng bắt buộc:

```text
Nếu composing có ký tự:
  xóa 1 ký tự trong composing
  setComposingText(composing)

Nếu composing rỗng:
  deleteSurroundingText(1, 0)
```

Nếu hỗ trợ `Space → Backspace → sửa raw token`, phải có cơ chế riêng:

```text
lastRaw
lastConverted
canRestoreLastRaw
```

Nhưng phục hồi chỉ được áp dụng cho token cuối cùng, không bao giờ xóa lan sang token trước.

---

## 6. Mode policy

### 6.1. Mode chuẩn cho Core Stable

Core Stable chỉ có một mode trong luồng IME:

```text
CVNSS_TO_VIETNAMESE
```

Có thể đặt label là:

```text
VIE
CV
CVN
Bila
```

Nhưng chức năng phải giữ:

```text
CVNSS/CVSS → Unicode tiếng Việt
```

### 6.2. Mode bị cấm trong IME Core Stable

Không đưa các mode sau vào bàn phím chính:

```text
VIETNAMESE_TO_CVNSS
CQN_TO_CVSS
Unicode encoder mode
Auto reverse mode
Smart bidirectional mode
```

Nếu cần, tạo app/tool riêng:

```text
BilaKey Converter Tool
BilaKey Lab
BilaKey Dashboard
```

Không gắn vào `BilaKeyImeService`.

---

## 7. Converter policy

### 7.1. Token có dấu tiếng Việt phải giữ nguyên

Nếu user nhập:

```text
chào
```

thì khi bấm Space:

```text
chào
```

Không được:

```text
chaol
```

Điều này ngăn lỗi gọi nhầm chiều chuyển ngược.

### 7.2. Token ASCII mới cần chuyển

Các token như sau mới đưa vào lõi CVNSS/CVSS → Unicode:

```text
chuw
wias
Chaol
banr
Tizb
Vidf
```

### 7.3. Token lẫn ký tự ngoài chữ

Token có dấu câu hoặc ký tự đặc biệt phải được tách trước khi convert:

```text
chuw,  → chữ,
wias.  → nghĩa.
```

Không convert cả chuỗi `chuw,` như một token duy nhất nếu converter không hỗ trợ dấu câu đi kèm.

---

## 8. UI policy: phần được phép sửa mà không động core

Các phiên bản sau được phép sửa:

```text
icon BilaKey
màu nền bàn phím
màu phím
bo góc
font size
dòng giới thiệu
màn hình hướng dẫn
layout phím
vị trí phím
versionName
README
workflow artifact name
```

Nhưng không được sửa:

```text
composing buffer
handleSpace
commitBuffer
handleBackspace
CvnssConverter core
InputConnection transaction
mode chuyển đổi
candidate conversion direction
```

Nếu sửa các phần cấm, phiên bản đó phải đổi nhãn từ:

```text
UI update
```

sang:

```text
CORE change
```

và phải chạy gate test đầy đủ.

---

## 9. Candidate/suggestion policy

Nếu có suggestion strip, phải tuân thủ:

```text
Candidate chỉ được đề xuất tiếng Việt Unicode.
Không đề xuất chuỗi CVNSS ngược.
Không gọi converter chiều Unicode → CVNSS.
Không commit candidate nếu candidate không thuộc token hiện tại.
```

Ví dụ đúng:

```text
raw: banr
candidate: bạn
```

Ví dụ sai:

```text
raw: bạn
candidate: banr
```

Suggestion là tính năng phụ. Nếu suggestion gây rủi ro cho core, hãy tắt suggestion.

---

## 10. Chuẩn kiểm thử bắt buộc

### 10.1. Gate test tối thiểu

Mọi build APK phải pass:

```text
Chaol Space
→ Chào

Chaol Space banr Space
→ Chào bạn

chuw Space
→ chữ

chuw Space wias Space
→ chữ nghĩa

chào Space
→ chào

Space Space Space
→ chỉ một khoảng trắng hợp lệ
```

### 10.2. Gate test chống lỗi cũ

Các lỗi cũ cấm tái xuất hiện:

```text
ChaolChào
cbạn
cban
chuwias
wias nuốt chữ
chào → chaol
Space tạo nhiều khoảng trắng
Backspace xóa mất từ trước
```

### 10.3. Gate test dài

Gõ liên tục:

```text
Chaol banr toi laf Long
```

Kỳ vọng:

```text
Chào bạn toi là Long
```

Tùy bảng chuyển đổi, `toi` có thể giữ nguyên nếu chưa có rule dấu, nhưng không được dính chữ, mất chữ, hoặc đảo chiều.

### 10.4. Gate test dấu câu

```text
chuw, wias.
```

Kỳ vọng:

```text
chữ, nghĩa.
```

### 10.5. Gate test Backspace

```text
Chaol Space Backspace
```

Kỳ vọng tùy chính sách:

```text
Hoặc xóa một ký tự sau cùng
Hoặc phục hồi Chaol để sửa
```

Nhưng tuyệt đối không xóa từ trước đó.

---

## 11. Unit test converter

Tạo file test tối thiểu:

```java
assertEquals("Chào", CvnssConverter.cvnssToUnicodeText("Chaol"));
assertEquals("chào", CvnssConverter.cvnssToUnicodeText("chaol"));
assertEquals("bạn", CvnssConverter.cvnssToUnicodeText("banr"));
assertEquals("chữ", CvnssConverter.cvnssToUnicodeText("chuw"));
assertEquals("nghĩa", CvnssConverter.cvnssToUnicodeText("wias"));
assertEquals("Tiếng Việt", CvnssConverter.cvnssToUnicodeText("Tizb Vidf"));
assertEquals("chào", CvnssConverter.cvnssToUnicodeText("chào"));
```

Nếu những test này fail, không được build APK release.

---

## 12. Static source gate

Tạo `tools/verify_source.py` để chặn pattern nguy hiểm.

### 12.1. Pattern cần chặn trong `BilaKeyImeService.java`

```text
getTextBeforeCursor(50
getTextBeforeCursor(100
deleteSurroundingText(before.length()
unicodeToCvnss
cqnToCvss
VIETNAMESE_TO_CVNSS
commitText(String.valueOf(ch)
```

### 12.2. Pattern được phép có kiểm soát

```text
getTextBeforeCursor(1, 0)
deleteSurroundingText(1, 0)
```

`getTextBeforeCursor(1,0)` chỉ dùng trong `commitSingleSpace`.  
`deleteSurroundingText(1,0)` chỉ dùng trong Backspace.

---

## 13. Build SOP bằng GitHub Actions

### 13.1. Trước khi build

Chạy:

```bat
git rev-parse --show-toplevel
git status
```

Đường dẫn Git root phải đúng thư mục source hiện tại. Không được để Git root trỏ về:

```text
C:\Users\Admin
```

nếu source nằm trong thư mục con.

### 13.2. Push đúng source

```bat
rmdir /s /q .git 2>nul
git init
git add .
git commit -m "BilaKey Core Stable build"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/CVNSS/BilaKey-Android-IME.git
git push -u origin main --force
```

### 13.3. Chạy workflow

Workflow phải có:

```yaml
on:
  workflow_dispatch:
  push:
    branches:
      - main
```

Chạy:

```bat
gh workflow run bilakey-mini-255k.yml --repo CVNSS/BilaKey-Android-IME --ref main
```

### 13.4. Kiểm tra commit build thật sự

```bat
for /f "delims=" %i in ('gh run list --repo CVNSS/BilaKey-Android-IME --workflow bilakey-mini-255k.yml --limit 1 --json databaseId --jq ".[0].databaseId"') do set RUN_ID=%i

gh run view %RUN_ID% --repo CVNSS/BilaKey-Android-IME --json headSha --jq ".headSha"
git rev-parse HEAD
```

Hai SHA phải giống nhau.

### 13.5. Tải APK đúng run

```bat
gh run watch %RUN_ID% --repo CVNSS/BilaKey-Android-IME

rmdir /s /q dist 2>nul
mkdir dist
gh run download %RUN_ID% --repo CVNSS/BilaKey-Android-IME -D dist
dir dist /s
```

Không tải artifact nếu không chỉ rõ `RUN_ID`.

---

## 14. Build fingerprint policy

Mỗi APK phải hiển thị trong `MainActivity`:

```text
BilaKey Core Stable
IME rule: Space commits composing token only
Build: vX.Y.Z
```

Mục đích: tránh nhầm APK cũ khi test trên Appetize hoặc điện thoại.

Nếu mở app không thấy fingerprint đúng, không test tiếp. Đó là APK sai.

---

## 15. Appetize / thiết bị test SOP

Trước khi test:

```text
1. Gỡ bản BilaKey cũ.
2. Upload/cài APK mới.
3. Reset session Appetize nếu dùng Appetize.
4. Bật BilaKey trong Android Settings.
5. Chọn đúng BilaKey làm bàn phím hiện tại.
6. Mở app nhập text đơn giản để test.
```

Không test trên link Appetize cũ nếu chưa chắc build mới đã được upload vào đúng app/publicKey.

---

## 16. Versioning SOP

Dùng 3 nhóm version:

```text
CORE
UI
BUILD
```

Ví dụ:

```text
v1.0.5-core-stable
v1.0.6-ui-blue
v1.0.7-build-github-actions
v1.0.8-ui-icon
v1.0.9-core-token-fix
```

Quy tắc:

```text
Nếu sửa BilaKeyImeService hoặc CvnssConverter → CORE.
Nếu sửa layout/icon/màu/chữ → UI.
Nếu sửa Gradle/GitHub Actions/script → BUILD.
```

Không gọi một bản là UI update nếu nó sửa core.

---

## 17. Branching SOP

Nhánh ổn định:

```text
main
```

Nhánh sửa giao diện:

```text
ui/*
```

Nhánh sửa core:

```text
core/*
```

Nhánh thử nghiệm:

```text
lab/*
```

Không merge `lab/*` vào `main` nếu chưa qua gate test.

---

## 18. Code review checklist

Trước khi merge, reviewer phải xác nhận:

```text
[ ] Không có chuyển ngược Unicode → CVNSS trong IME.
[ ] Space chỉ commit composing token.
[ ] Không deleteSurroundingText vùng dài trong Space.
[ ] Không commitText từng ký tự khi đang gõ VIE.
[ ] composing được clear sau commit.
[ ] Backspace không xóa lan token trước.
[ ] Unit test converter pass.
[ ] Manual IME test pass.
[ ] Build fingerprint đúng.
[ ] APK build từ đúng commit SHA.
```

---

## 19. Release checklist

Trước khi phát hành:

```text
[ ] Source đúng thư mục.
[ ] Git root đúng.
[ ] Commit message đúng version.
[ ] Workflow chạy success.
[ ] headSha của run trùng local HEAD.
[ ] Artifact tải bằng đúng RUN_ID.
[ ] APK mở lên thấy đúng fingerprint.
[ ] Test Chaol/banr pass.
[ ] Test chuw/wias pass.
[ ] Test chào không bị chaol.
[ ] Test Space nhiều lần pass.
[ ] Test Appetize pass.
[ ] Ghi SHA-256 của APK.
```

---

## 20. Rollback SOP

Nếu bản mới lỗi:

```text
1. Dừng phân phối APK mới.
2. Ghi lỗi tái hiện tối thiểu.
3. Quay lại tag core stable gần nhất.
4. Build lại từ tag đó.
5. Upload APK rollback.
6. Không sửa nóng trực tiếp trên main.
```

Lệnh gợi ý:

```bat
git tag
git checkout tags/v1.0.5-core-stable
git checkout -b rollback/v1.0.5
```

---

## 21. Phân loại lỗi và nguyên nhân

### 21.1. `ChaolChào`

Nguyên nhân:

```text
Raw token đã bị commit từng ký tự.
Sau đó Space commit thêm Unicode.
```

Sửa:

```text
Không commitText từng ký tự.
Chỉ setComposingText khi gõ.
```

---

### 21.2. `cbạn` / `cban`

Nguyên nhân:

```text
Buffer không clear hoặc ký tự c còn sót từ token trước.
```

Sửa:

```text
Clear composing sau Space.
Không đọc text trước con trỏ làm nguồn token.
```

---

### 21.3. `chuw Space wias Space → nghĩa`

Nguyên nhân:

```text
Space hoặc guard xóa cả text đã commit.
```

Sửa:

```text
Space chỉ commit composing token.
Không deleteSurroundingText vùng dài.
```

---

### 21.4. `chào → chaol`

Nguyên nhân:

```text
IME gọi nhầm chiều Unicode → CVNSS.
```

Sửa:

```text
IME chỉ dùng CVNSS/CVSS → Unicode.
```

---

## 22. Chính sách dung lượng APK

Dung lượng nhỏ là tốt nhưng không được đánh đổi core.

Ưu tiên theo thứ tự:

```text
1. Đúng giao dịch IME.
2. Không mất chữ khi gõ.
3. Không dính chữ.
4. Không chuyển sai chiều.
5. Offline.
6. Nhẹ.
```

Không chấp nhận bản 45 KB nếu fail gate test.  
Chấp nhận bản 260 KB nếu pass toàn bộ core gate.  
Dung lượng không phải tiêu chí thay thế chất lượng lõi.

---

## 23. Chuẩn bảo mật và quyền riêng tư

BilaKey Core Stable nên giữ nguyên tắc:

```text
Không Internet.
Không ghi log nội dung người dùng.
Không upload thói quen gõ.
Không thu thập clipboard.
Không đọc text ngoài phạm vi IME cần thiết.
Không xin quyền thừa.
```

Manifest mặc định không cần:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Nếu sau này thêm AI/suggestion/cloud sync, đó là sản phẩm khác và phải có policy riêng.

---

## 24. Định nghĩa “Core Stable”

Một bản được gọi là Core Stable khi:

```text
[ ] Chỉ một chiều CVNSS/CVSS → Unicode trong IME.
[ ] Space chỉ commit token composing.
[ ] Không tái xử lý text đã commit.
[ ] Không xóa vùng trước con trỏ trong Space.
[ ] Không commit raw từng ký tự.
[ ] Converter pass unit test.
[ ] IME pass manual gate test.
[ ] Build reproducible bằng GitHub Actions.
[ ] APK có fingerprint version.
```

Nếu thiếu một điều kiện, chỉ được gọi là:

```text
experimental
lab
prototype
UI draft
```

không được gọi là stable.

---

## 25. Câu kết chuẩn cho repository

Đặt đoạn này trong README:

> BilaKey Core Stable follows a strict IME transaction boundary: Space commits only the current composing token. Previously committed text is never deleted, re-read, or reprocessed by the IME core. This rule prevents double-commit, swallowed-word, sticky-prefix, and wrong-direction conversion bugs.

Bản tiếng Việt:

> BilaKey Core Stable tuân thủ ranh giới giao dịch IME nghiêm ngặt: Space chỉ commit token đang composing. Text đã commit trước đó không bao giờ bị xóa, đọc lại hoặc xử lý lại bởi lõi IME. Quy tắc này ngăn lỗi commit trùng, nuốt từ, dính ký tự và chuyển sai chiều.

---

## 26. Tài liệu tham chiếu

- Android Developers — Create an input method: `InputMethodService`, IME UI, input handling.
- Android Developers — `InputConnection`: `commitText`, `setComposingText`, `getTextBeforeCursor`, `deleteSurroundingText`.
- GitHub Docs — Workflow syntax for GitHub Actions.
- GitHub CLI Manual — `gh workflow run`, `gh run download`.
- BilaKey internal contract — Core Reuse Contract / Stable Token Compose rules.

---

## 27. Kết luận vận hành

Từ thời điểm áp dụng SOP này:

```text
Mọi phiên bản sau của BilaKey chỉ được sửa hình thức nếu không mở issue CORE.
Mọi sửa đổi core phải có nhánh core riêng, test riêng, review riêng.
Mọi APK phát hành phải chứng minh build đúng commit và pass gate test.
```

Lõi BilaKey không được đánh đổi sự ổn định để lấy “thông minh giả”.  
Bộ gõ tốt nhất là bộ gõ không làm mất chữ của người dùng.
