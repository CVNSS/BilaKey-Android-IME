@echo off
cd /d "%~dp0"
python tools\verify_source.py
javac -encoding UTF-8 -d out app\src\main\java\com\cvnss\bilakey\CvnssConverter.java tools\TestCvnssConverter.java
java -cp out com.cvnss.bilakey.TestCvnssConverter
gradle clean assembleDebug --no-daemon
