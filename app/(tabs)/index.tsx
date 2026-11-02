import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";

const HISTORY_KEY = "signbridge.history.v1";
const SETTINGS_KEY = "signbridge.settings.v1";
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

type HistoryItem = { id: string; text: string; createdAt: string };

export default function TranslateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [message, setMessage] = useState("");
  const [lastLetter, setLastLetter] = useState("—");
  const [speaking, setSpeaking] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recognitionMode, setRecognitionMode] = useState<"manual" | "camera">("manual");

  const wordCount = useMemo(() => (message.trim() ? message.trim().split(/\s+/).length : 0), [message]);

  useEffect(() => () => { Speech.stop(); }, []);

  const addLetter = (letter: string) => {
    setMessage((current) => current + letter);
    setLastLetter(letter);
  };

  const saveAndSpeak = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert("Add a message first", "Choose letters below or use the camera workspace before speaking.");
      return;
    }
    let rate = 0.9;
    let saveHistory = true;
    try {
      const rawSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (rawSettings) {
        const settings = JSON.parse(rawSettings) as { rate?: number; saveHistory?: boolean };
        rate = typeof settings.rate === "number" ? settings.rate : rate;
        saveHistory = settings.saveHistory !== false;
      }
      if (saveHistory) {
        const existing = await AsyncStorage.getItem(HISTORY_KEY);
        const history: HistoryItem[] = existing ? JSON.parse(existing) : [];
        const next = [{ id: `${Date.now()}`, text, createdAt: new Date().toISOString() }, ...history].slice(0, 30);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      }
    } catch {
      // Speech should still work when local preference or history storage is unavailable.
    }
    await Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: "en-US",
      rate,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const clearMessage = () => {
    setMessage("");
    setLastLetter("—");
  };

  const cameraContent = !cameraOpen ? (
    <View style={styles.cameraEmpty}>
      <View style={styles.cameraIcon}><MaterialIcons name="photo-camera" size={28} color="#071A2B" /></View>
      <Text style={styles.cameraTitle}>Camera recognition is optional</Text>
      <Text style={styles.cameraText}>Open the camera when you are ready. The letter buttons below remain available if recognition is not yet enabled on this device.</Text>
      <Pressable style={styles.mintButton} onPress={async () => {
        if (Platform.OS === "web") {
          Alert.alert("Use a phone for camera mode", "The live camera is available in the Android or iOS build.");
          return;
        }
        if (!permission?.granted) {
          const result = await requestPermission();
          if (!result.granted) return;
        }
        setCameraOpen(true);
        setRecognitionMode("camera");
      }}>
        <Text style={styles.mintButtonText}>{permission?.granted ? "Open camera" : "Enable camera"}</Text>
      </Pressable>
    </View>
  ) : Platform.OS === "web" ? (
    <View style={styles.cameraEmpty}><MaterialIcons name="smartphone" size={30} color="#8DE1C0" /><Text style={styles.cameraTitle}>Open the Android or iOS build</Text><Text style={styles.cameraText}>Camera access is intentionally disabled in the web preview.</Text></View>
  ) : (
    <CameraView style={StyleSheet.absoluteFill} facing="front" />
  );

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.brandRow}><View style={styles.brandMark}><MaterialIcons name="back-hand" size={20} color="#071A2B" /></View><View><Text style={styles.eyebrow}>SIGNBRIDGE</Text><Text style={styles.title}>Translate</Text></View></View>
          <View style={styles.privatePill}><View style={styles.liveDot} /><Text style={styles.privateText}>On device</Text></View>
        </View>

        <View style={styles.intro}><Text style={styles.introTitle}>Turn signs into a voice.</Text><Text style={styles.introText}>Build a message one letter at a time, then let SignBridge speak it aloud.</Text></View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraHeader}><View><Text style={styles.sectionLabel}>RECOGNITION</Text><Text style={styles.cameraMode}>{recognitionMode === "camera" ? "Camera workspace" : "Manual fallback"}</Text></View><Pressable onPress={() => { setCameraOpen(false); setRecognitionMode("manual"); }}><Text style={styles.switchText}>{cameraOpen ? "Close" : "Why?"}</Text></Pressable></View>
          <View style={styles.cameraPreview}>{cameraContent}<View style={styles.guide} pointerEvents="none"><View style={styles.cornerTL} /><View style={styles.cornerTR} /><View style={styles.cornerBL} /><View style={styles.cornerBR} /></View></View>
          <View style={styles.cameraFooter}><View><Text style={styles.sectionLabel}>LAST LETTER</Text><Text style={styles.lastLetter}>{lastLetter}</Text></View><Text style={styles.cameraHint}>{recognitionMode === "camera" ? "Hold one hand inside the guide" : "Tap a letter below to compose"}</Text></View>
        </View>

        <View style={styles.messageHeader}><View><Text style={styles.sectionLabel}>YOUR MESSAGE</Text><Text style={styles.messageMeta}>{wordCount ? `${wordCount} ${wordCount === 1 ? "word" : "words"}` : "No words yet"}</Text></View><Pressable onPress={clearMessage}><Text style={styles.clearText}>Clear</Text></Pressable></View>
        <View style={styles.messageCard}><Text style={[styles.messageText, !message && styles.placeholder]}>{message || "Your message will appear here"}</Text><View style={styles.messageAccent} /></View>

        <View style={styles.quickControls}><Pressable style={styles.controlButton} onPress={() => setMessage((current) => current.slice(0, -1))}><MaterialIcons name="backspace" size={21} color="#F4FAF8" /><Text style={styles.controlText}>Delete</Text></Pressable><Pressable style={styles.controlButtonWide} onPress={() => setMessage((current) => `${current}${current && !current.endsWith(" ") ? " " : ""}`)}><MaterialIcons name="space-bar" size={21} color="#F4FAF8" /><Text style={styles.controlText}>Space</Text></Pressable></View>

        <Text style={styles.sectionLabel}>LETTER BOARD</Text>
        <View style={styles.letterGrid}>{LETTERS.map((letter) => <Pressable key={letter} onPress={() => addLetter(letter)} style={({ pressed }) => [styles.letterButton, pressed && styles.pressed]}><Text style={styles.letterText}>{letter}</Text></Pressable>)}</View>

        <Pressable style={({ pressed }) => [styles.speakButton, pressed && styles.pressed]} onPress={saveAndSpeak}><MaterialIcons name={speaking ? "volume-up" : "play-arrow"} size={21} color="#071A2B" /><Text style={styles.speakText}>{speaking ? "Speaking…" : "Speak message"}</Text></Pressable>
        <Text style={styles.privacyNote}>Messages are stored only on this device when you tap Speak. Live recognition is designed to remain on-device.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 28, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#8DE1C0", alignItems: "center", justifyContent: "center" },
  eyebrow: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: "#F4FAF8", fontSize: 25, fontWeight: "700" },
  privatePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#102B40", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 18 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8DE1C0" },
  privateText: { color: "#A9BEC8", fontSize: 11, fontWeight: "700" },
  intro: { gap: 5, marginTop: 8 },
  introTitle: { color: "#F4FAF8", fontSize: 28, fontWeight: "800", letterSpacing: -0.6 },
  introText: { color: "#A9BEC8", fontSize: 14, lineHeight: 21, maxWidth: 340 },
  cameraCard: { backgroundColor: "#102B40", borderRadius: 23, borderWidth: 1, borderColor: "#2B4A5D", overflow: "hidden" },
  cameraHeader: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  cameraMode: { color: "#F4FAF8", fontSize: 16, fontWeight: "700", marginTop: 3 },
  switchText: { color: "#8DE1C0", fontSize: 13, fontWeight: "800" },
  cameraPreview: { height: 220, backgroundColor: "#0B2236", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  cameraEmpty: { alignItems: "center", gap: 8, paddingHorizontal: 28, maxWidth: 350 },
  cameraIcon: { width: 55, height: 55, borderRadius: 28, backgroundColor: "#8DE1C0", justifyContent: "center", alignItems: "center", marginBottom: 2 },
  cameraTitle: { color: "#F4FAF8", fontWeight: "800", fontSize: 16, textAlign: "center" },
  cameraText: { color: "#A9BEC8", fontSize: 12, lineHeight: 18, textAlign: "center" },
  mintButton: { marginTop: 5, paddingHorizontal: 17, paddingVertical: 10, borderRadius: 13, backgroundColor: "#8DE1C0" },
  mintButtonText: { color: "#071A2B", fontWeight: "800", fontSize: 13 },
  guide: { ...StyleSheet.absoluteFillObject, margin: 30 },
  cornerTL: { position: "absolute", top: 0, left: 0, width: 28, height: 28, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "#8DE1C0", borderTopLeftRadius: 8 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 28, height: 28, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#8DE1C0", borderTopRightRadius: 8 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 28, height: 28, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: "#8DE1C0", borderBottomLeftRadius: 8 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderBottomWidth: 2, borderRightWidth: 2, borderColor: "#8DE1C0", borderBottomRightRadius: 8 },
  cameraFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 15 },
  lastLetter: { color: "#8DE1C0", fontSize: 27, fontWeight: "800", marginTop: 2 },
  cameraHint: { color: "#A9BEC8", fontSize: 11, lineHeight: 16, textAlign: "right", maxWidth: 160 },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 3 },
  messageMeta: { color: "#A9BEC8", fontSize: 12, marginTop: 3 },
  clearText: { color: "#FF9696", fontSize: 13, fontWeight: "800", padding: 6 },
  messageCard: { minHeight: 92, backgroundColor: "#102B40", borderRadius: 19, borderWidth: 1, borderColor: "#2B4A5D", padding: 17 },
  messageText: { color: "#F4FAF8", fontSize: 24, fontWeight: "800", lineHeight: 31 },
  placeholder: { color: "#587384", fontSize: 17, fontWeight: "600" },
  messageAccent: { width: 34, height: 2, borderRadius: 1, backgroundColor: "#8DE1C0", marginTop: 13 },
  quickControls: { flexDirection: "row", gap: 10 },
  controlButton: { flex: 1, height: 46, borderRadius: 14, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  controlButtonWide: { flex: 2, height: 46, borderRadius: 14, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  controlText: { color: "#F4FAF8", fontSize: 13, fontWeight: "800" },
  letterGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  letterButton: { width: 37, height: 37, borderRadius: 11, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center" },
  letterText: { color: "#F4FAF8", fontWeight: "800", fontSize: 14 },
  speakButton: { height: 54, borderRadius: 17, backgroundColor: "#8DE1C0", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 2 },
  speakText: { color: "#071A2B", fontSize: 16, fontWeight: "900" },
  privacyNote: { color: "#6E8B99", fontSize: 10, lineHeight: 15, textAlign: "center", paddingHorizontal: 12 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
});
