package com.cvnss.bilakey;

import android.app.Activity;
import android.os.Bundle;
import android.provider.Settings;
import android.content.Intent;
import android.view.Gravity;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public final class MainActivity extends Activity {
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(20), dp(24), dp(20), dp(24));
        root.setBackgroundColor(0xff0b3d91);

        TextView title = text("BilaKey", 32, true);
        root.addView(title, new LinearLayout.LayoutParams(-1, -2));

        TextView sub = text("Gõ nhanh bằng CVNSS4.0, xuất chuẩn tiếng Việt", 18, false);
        root.addView(sub, new LinearLayout.LayoutParams(-1, -2));

        TextView core = text("Core Stable v1.2.2 · Space chỉ commit token đang composing · Không tái xử lý text đã commit", 14, false);
        core.setPadding(0, dp(18), 0, dp(18));
        root.addView(core, new LinearLayout.LayoutParams(-1, -2));

        TextView desc = text("BilaKey là bàn phím hệ thống Android dạng IME, tối giản và tập trung vào một mục tiêu: nhập chuỗi CVNSS4.0, bấm Space, và xuất ra tiếng Việt Unicode.\n\nỨng dụng không dùng Internet, không thu thập dữ liệu, không có server.", 15, false);
        desc.setGravity(Gravity.LEFT);
        root.addView(desc, new LinearLayout.LayoutParams(-1, -2));

        Button settings = new Button(this);
        settings.setText("Mở cài đặt bàn phím Android");
        settings.setAllCaps(false);
        settings.setOnClickListener(v -> startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)));
        root.addView(settings, new LinearLayout.LayoutParams(-1, dp(52)));

        setContentView(root);
    }

    private TextView text(String s, int sp, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(sp);
        t.setTextColor(0xffffffff);
        t.setGravity(Gravity.CENTER);
        if (bold) t.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        return t;
    }

    private int dp(int v) { return (int)(v * getResources().getDisplayMetrics().density + 0.5f); }
}
