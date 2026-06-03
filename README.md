
# BilaKey Core Stable Android IME v1.2.2

**Core rule:** Space chỉ commit token đang composing. Mọi text đã commit là bất khả xâm phạm.

BilaKey là bàn phím hệ thống Android dạng IME, tối giản và tập trung vào một mục tiêu: nhập chuỗi CVNSS4.0/CVSS ASCII, bấm Space, và xuất ra tiếng Việt Unicode.

## Tính chất bản này

- Core Stable, một chiều CVNSS/CVSS → Unicode trong IME.
- Không Internet permission.
- Không dùng AndroidX/Material dependency.
- UI/UX được cải tiến nền xanh dương, phím trắng, icon chữ B.
- Source gate chặn lỗi `ChaolChào`, `cbạn`, `chuw wias` bị nuốt chữ.

## Build bằng GitHub Actions

```bat
cd /d "C:\Users\Admin\BilaKey_CoreStable_Android_IME_v1_2_2_Source\BilaKey_CoreStable_Android_IME_v1_2_2_Source"
BUILD_APK_ON_GITHUB.cmd
```

APK sẽ nằm trong `dist` sau khi workflow thành công.

## Test bắt buộc

```text
chuw Space                    → chữ
chuw Space wias Space         → chữ nghĩa
Chaol Space banr Space        → Chào bạn
chào Space                    → chào
```
