package com.cvnss.bilakey;

import android.inputmethodservice.InputMethodService;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * BilaKey Core Stable IME.
 *
 * HARD RULE:
 *   Space commits only the current composing token.
 *   Space never reads, deletes, rewrites, or reprocesses committed text before the cursor.
 */
public final class BilaKeyImeService extends InputMethodService {
    private static final String CORE_FINGERPRINT = "BilaKey Core Stable v1.2.2 · TOKEN-COMPOSE";
    private static final long BACKSPACE_REPEAT_DELAY_MS = 420L;
    private static final long BACKSPACE_REPEAT_INTERVAL_MS = 55L;

    private final StringBuilder composing = new StringBuilder();
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean shiftOnce = false;
    private boolean capsLock = false;
    private boolean backspaceRepeating = false;

    private LinearLayout keyboardRoot;
    private Button shiftKey;
    private TextView stateLine;

    private final Runnable repeatBackspace = new Runnable() {
        @Override public void run() {
            if (!backspaceRepeating) return;
            handleBackspaceOnce();
            handler.postDelayed(this, BACKSPACE_REPEAT_INTERVAL_MS);
        }
    };

    @Override
    public View onCreateInputView() {
        keyboardRoot = new LinearLayout(this);
        keyboardRoot.setOrientation(LinearLayout.VERTICAL);
        keyboardRoot.setPadding(dp(6), dp(6), dp(6), dp(6));
        keyboardRoot.setBackgroundColor(0xff0b3d91);

        stateLine = new TextView(this);
        stateLine.setText(CORE_FINGERPRINT + " · CVNSS→Unicode");
        stateLine.setTextColor(0xffffffff);
        stateLine.setGravity(Gravity.CENTER);
        stateLine.setTextSize(12);
        keyboardRoot.addView(stateLine, new LinearLayout.LayoutParams(-1, dp(24)));

        addRow("1234567890", false);
        addRow("qwertyuiop", true);
        addRow("asdfghjkl", true);
        addSpecialLetterRow();
        addControlRow();
        refreshShiftLabel();
        return keyboardRoot;
    }

    @Override
    public void onStartInputView(android.view.inputmethod.EditorInfo info, boolean restarting) {
        super.onStartInputView(info, restarting);
        composing.setLength(0);
        shiftOnce = shouldStartCapitalized();
        capsLock = false;
        refreshShiftLabel();
    }

    private void addRow(String chars, boolean letters) {
        LinearLayout row = row();
        for (int i = 0; i < chars.length(); i++) {
            char c = chars.charAt(i);
            Button b = key(String.valueOf(c));
            b.setOnClickListener(v -> handleCharacter(c));
            row.addView(b, keyParams(1.0f));
        }
        keyboardRoot.addView(row, new LinearLayout.LayoutParams(-1, dp(46)));
    }

    private void addSpecialLetterRow() {
        LinearLayout row = row();
        shiftKey = key("⇧");
        shiftKey.setOnClickListener(v -> handleShift());
        row.addView(shiftKey, keyParams(1.35f));

        for (char c : "zxcvbnm".toCharArray()) {
            Button b = key(String.valueOf(c));
            b.setOnClickListener(v -> handleCharacter(c));
            row.addView(b, keyParams(1.0f));
        }

        Button del = key("⌫");
        del.setOnClickListener(v -> handleBackspaceOnce());
        del.setOnLongClickListener(v -> {
            backspaceRepeating = true;
            handler.postDelayed(repeatBackspace, BACKSPACE_REPEAT_DELAY_MS);
            return true;
        });
        del.setOnTouchListener((v, event) -> {
            if (event.getAction() == android.view.MotionEvent.ACTION_UP || event.getAction() == android.view.MotionEvent.ACTION_CANCEL) {
                backspaceRepeating = false;
                handler.removeCallbacks(repeatBackspace);
            }
            return false;
        });
        row.addView(del, keyParams(1.35f));
        keyboardRoot.addView(row, new LinearLayout.LayoutParams(-1, dp(46)));
    }

    private void addControlRow() {
        LinearLayout row = row();
        Button info = key("BilaKey");
        info.setOnClickListener(v -> commitLiteral("BilaKey"));
        row.addView(info, keyParams(1.6f));

        Button comma = key(",");
        comma.setOnClickListener(v -> commitCurrentTokenThen(","));
        row.addView(comma, keyParams(0.8f));

        Button space = key("Space");
        space.setOnClickListener(v -> handleSpace());
        row.addView(space, keyParams(4.4f));

        Button dot = key(".");
        dot.setOnClickListener(v -> commitCurrentTokenThen("."));
        row.addView(dot, keyParams(0.8f));

        Button enter = key("↵");
        enter.setOnClickListener(v -> commitCurrentTokenThen("\n"));
        row.addView(enter, keyParams(1.3f));

        keyboardRoot.addView(row, new LinearLayout.LayoutParams(-1, dp(48)));
    }

    private LinearLayout row() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER);
        return row;
    }

    private Button key(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextSize(16);
        b.setAllCaps(false);
        b.setTextColor(0xff0b3d91);
        b.setBackgroundColor(0xffffffff);
        b.setPadding(0, 0, 0, 0);
        return b;
    }

    private LinearLayout.LayoutParams keyParams(float weight) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, -1, weight);
        lp.setMargins(dp(2), dp(2), dp(2), dp(2));
        return lp;
    }

    private void handleCharacter(char rawCh) {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;
        char ch = applyShift(rawCh);
        composing.append(ch);
        ic.setComposingText(composing.toString(), 1);
        if (shiftOnce && !capsLock) {
            shiftOnce = false;
            refreshShiftLabel();
        }
    }

    private char applyShift(char ch) {
        if ((shiftOnce || capsLock) && Character.isLetter(ch)) return Character.toUpperCase(ch);
        return ch;
    }

    private void handleSpace() {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;
        if (composing.length() == 0) {
            commitSingleSpace(ic);
            return;
        }
        String raw = composing.toString();
        String converted = CvnssConverter.cvnssToUnicodeText(raw).trim();

        // TOKEN-ONLY COMMIT: commit only the current composing token; never touch earlier committed words.
        ic.beginBatchEdit();
        ic.commitText(converted + " ", 1);
        ic.endBatchEdit();

        composing.setLength(0);
        shiftOnce = shouldStartCapitalized();
        refreshShiftLabel();
    }

    private void commitCurrentTokenThen(String suffix) {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;
        if (composing.length() > 0) {
            String converted = CvnssConverter.cvnssToUnicodeText(composing.toString()).trim();
            ic.beginBatchEdit();
            ic.commitText(converted + suffix, 1);
            ic.endBatchEdit();
            composing.setLength(0);
        } else {
            ic.commitText(suffix, 1);
        }
        if (".\n!?".contains(suffix)) shiftOnce = true;
        refreshShiftLabel();
    }

    private void commitLiteral(String text) {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;
        commitCurrentTokenThen("");
        ic.commitText(text, 1);
    }

    private void commitSingleSpace(InputConnection ic) {
        // The only permitted cursor lookbehind: one character only, for duplicate-space prevention.
        CharSequence before = ic.getTextBeforeCursor(1, 0);
        if (before != null && before.length() > 0 && Character.isWhitespace(before.charAt(0))) return;
        ic.commitText(" ", 1);
    }

    private void handleBackspaceOnce() {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return;
        if (composing.length() > 0) {
            composing.deleteCharAt(composing.length() - 1);
            if (composing.length() > 0) {
                ic.setComposingText(composing.toString(), 1);
            } else {
                ic.finishComposingText();
            }
            return;
        }
        ic.deleteSurroundingText(1, 0);
    }

    private void handleShift() {
        if (!shiftOnce && !capsLock) shiftOnce = true;
        else if (shiftOnce && !capsLock) { shiftOnce = false; capsLock = true; }
        else { shiftOnce = false; capsLock = false; }
        refreshShiftLabel();
    }

    private void refreshShiftLabel() {
        if (shiftKey == null) return;
        if (capsLock) shiftKey.setText("⇧⇧");
        else if (shiftOnce) shiftKey.setText("⇧");
        else shiftKey.setText("⇩");
    }

    private boolean shouldStartCapitalized() {
        InputConnection ic = getCurrentInputConnection();
        if (ic == null) return true;
        CharSequence before = ic.getTextBeforeCursor(2, 0);
        if (before == null || before.length() == 0) return true;
        char last = before.charAt(before.length() - 1);
        if (last == '.' || last == '!' || last == '?' || last == '\n') return true;
        if (Character.isWhitespace(last) && before.length() >= 2) {
            char prev = before.charAt(before.length() - 2);
            return prev == '.' || prev == '!' || prev == '?' || prev == '\n';
        }
        return false;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Hardware/Appetize keyboard guard: consume printable ASCII so the editor cannot receive raw text first.
        if (event == null) return super.onKeyDown(keyCode, event);
        int unicode = event.getUnicodeChar();
        if (unicode >= 32 && unicode <= 126) {
            char ch = (char) unicode;
            if (Character.isLetterOrDigit(ch)) {
                handleCharacter(Character.toLowerCase(ch));
                return true;
            }
            if (ch == ' ') { handleSpace(); return true; }
            if (ch == '.' || ch == ',' || ch == '!' || ch == '?' || ch == ';' || ch == ':') {
                commitCurrentTokenThen(String.valueOf(ch));
                return true;
            }
        }
        if (keyCode == KeyEvent.KEYCODE_DEL) { handleBackspaceOnce(); return true; }
        if (keyCode == KeyEvent.KEYCODE_ENTER) { commitCurrentTokenThen("\n"); return true; }
        return super.onKeyDown(keyCode, event);
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + 0.5f);
    }
}
