package com.cvnss.bilakey;

public final class TestCvnssConverter {
    public static void main(String[] args) {
        expect("chuw", "chữ");
        expect("wias", "nghĩa");
        expect("chuw wias", "chữ nghĩa");
        expect("Chaol", "Chào");
        expect("banr", "bạn");
        expect("Tizb Vidf", "Tiếng Việt");
        expect("chào", "chào");
        System.out.println("PASS: CvnssConverter core tests");
    }
    private static void expect(String raw, String expected) {
        String got = CvnssConverter.cvnssToUnicodeText(raw);
        if (!expected.equals(got)) throw new AssertionError(raw + " => " + got + " expected " + expected);
    }
}
