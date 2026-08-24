import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Speech from "expo-speech";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const DEMO_LETTERS = ["H", "E", "L", "L", "O"];

type Mode = "Translate" | "Practice";

export default function HomeScreen() {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>("Translate");
  const [message, setMessage] = useState("");
  const [lastLetter, setLastLetter] = useState("—");
  const [status, setStatus] = useState("Waiting for a hand");
  const [demoIndex, setDemoIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const wordCount = useMemo(() => message.trim() ? message.trim().split(/\s+/).length : 0, [message]);

  useEffect(() => () => { Speech.stop(); }, []);

  const addLetter = (letter: string) => {
    setLastLetter(letter);
    setStatus("Letter detected");
    setMessage((current) => current + letter);
  };

  const handleDemoDetect = () => {
    addLetter(DEMO_LETTERS[demoIndex]);
    setDemoIndex((current) => (current + 1) % DEMO_LETTERS.length);
  };

  const speakMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Nothing to speak", "Add a few letters or a word first.");
      return;
    }
    await Speech.stop();
    setSpeaking(true);
    Speech.speak(message.trim(), { language: "en-US", rate: 0.9, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) });
  };

  const permissionContent = !permission ? (
    <View style={styles.cameraFallback}>
      <Text style={styles.cameraFallbackTitle}>Starting camera…</Text>
      <Text style={styles.cameraFallbackText}>Preparing a private camera workspace.</Text>
    </View>
  ) : !permission.granted ? (
    <View style={styles.cameraFallback}>
      <View style={styles.cameraIconCircle}><IconSymbol name="camera.fill" size={28} color={colors.primary} /></View>
      <Text style={styles.cameraFallbackTitle}>Camera access helps you communicate</Text>
      <Text style={styles.cameraFallbackText}>SignBridge uses your camera to read hand alphabet shapes. Your camera view stays in this session.</Text>
      <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]} onPress={requestPermission}>
        <Text style={styles.primaryButtonText}>Allow camera access</Text>
      </Pressable>
    </View>
  ) : Platform.OS === "web" ? (
    <View style={styles.cameraFallback}>
      <View style={styles.cameraIconCircle}><IconSymbol name="camera.fill" size={28} color={colors.primary} /></View>
      <Text style={styles.cameraFallbackTitle}>Camera preview is ready on your phone</Text>
      <Text style={styles.cameraFallbackText}>Open the Expo preview on a physical device to use the live camera. You can still explore the message controls here.</Text>
    </View>
  ) : (
    <CameraView style={StyleSheet.absoluteFill} facing="front" />
  );

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><IconSymbol name="hand.raised.fill" size={19} color={colors.background} /></View>
            <View><Text style={styles.eyebrow}>SIGNBRIDGE</Text><Text style={styles.title}>Translate</Text></View>
          </View>
          <View style={styles.privacyPill}><View style={styles.liveDot} /><Text style={styles.privacyText}>Private session</Text></View>
        </View>

        <View style={styles.modeSwitcher}>
          {(["Translate", "Practice"] as Mode[]).map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeItem, mode === item && styles.modeItemActive]}>
              <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {mode === "Practice" ? (
          <View style={styles.practiceCard}>
            <Text style={styles.cardEyebrow}>PRACTICE LETTER</Text>
            <Text style={styles.practiceLetter}>{DEMO_LETTERS[demoIndex]}</Text>
            <Text style={styles.practiceText}>Hold the handshape steady inside the guide, then tap Demo detect to try the flow.</Text>
            <Pressable onPress={handleDemoDetect} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Mark as recognized</Text></Pressable>
          </View>
        ) : null}

        <View style={styles.cameraShell}>
          <View style={styles.cameraPreview}>{permissionContent}<View style={styles.cameraOverlay} pointerEvents="none"><View style={styles.cornerTL} /><View style={styles.cornerTR} /><View style={styles.cornerBL} /><View style={styles.cornerBR} /></View><View style={styles.statusPill}><View style={[styles.statusDot, { backgroundColor: status === "Letter detected" ? colors.primary : colors.warning }]} /><Text style={styles.statusText}>{status}</Text></View></View>
          <View style={styles.cameraFooter}><View><Text style={styles.cameraFooterLabel}>CURRENT LETTER</Text><Text style={styles.currentLetter}>{lastLetter}</Text></View><View style={styles.holdHint}><IconSymbol name="hand.raised.fill" size={16} color={colors.primary} /><Text style={styles.holdHintText}>Show one hand{`\n`}and hold steady</Text></View></View>
        </View>

        <View style={styles.messageHeader}><View><Text style={styles.cardEyebrow}>YOUR MESSAGE</Text><Text style={styles.messageMeta}>{wordCount === 0 ? "Start signing to build a message" : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}</Text></View><Pressable onPress={() => { setMessage(""); setLastLetter("—"); setStatus("Waiting for a hand"); }}><Text style={styles.clearText}>Clear</Text></Pressable></View>
        <View style={styles.messageCard}><Text style={[styles.messageText, !message && styles.messagePlaceholder]}>{message || "Your letters will appear here"}</Text><View style={styles.messageLine} /></View>

        <View style={styles.controls}><Pressable accessibilityLabel="Delete last character" onPress={() => setMessage((current) => current.slice(0, -1))} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><IconSymbol name="delete.left" size={22} color={colors.foreground} /></Pressable><Pressable accessibilityLabel="Add a space" onPress={() => setMessage((current) => current + " ")} style={({ pressed }) => [styles.spaceButton, pressed && styles.pressed]}><Text style={styles.spaceButtonText}>Space</Text></Pressable><Pressable accessibilityLabel="Demo detect next letter" onPress={handleDemoDetect} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}><IconSymbol name="sparkles" size={22} color={colors.foreground} /></Pressable></View>
        <Pressable accessibilityLabel="Speak message aloud" onPress={speakMessage} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><IconSymbol name={speaking ? "speaker.wave.2.fill" : "play.fill"} size={18} color={colors.background} /><Text style={styles.primaryButtonText}>{speaking ? "Speaking…" : "Speak message"}</Text></Pressable>
        <Text style={styles.disclaimer}>Prototype mode uses a demo letter stepper. A production handshape model can be connected through the recognition adapter.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 18, paddingBottom: 28, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#8DE1C0", alignItems: "center", justifyContent: "center" },
  eyebrow: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: "#F4FAF8", fontSize: 25, fontWeight: "700", letterSpacing: -0.5 },
  privacyPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: "#102B40" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#8DE1C0" },
  privacyText: { color: "#A9BEC8", fontSize: 11, fontWeight: "600" },
  modeSwitcher: { flexDirection: "row", backgroundColor: "#102B40", padding: 4, borderRadius: 14 },
  modeItem: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 11 },
  modeItemActive: { backgroundColor: "#8DE1C0" },
  modeText: { color: "#A9BEC8", fontWeight: "700", fontSize: 13 },
  modeTextActive: { color: "#071A2B" },
  practiceCard: { backgroundColor: "#102B40", borderRadius: 22, padding: 20, alignItems: "center", gap: 9, borderWidth: 1, borderColor: "#2B4A5D" },
  cardEyebrow: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  practiceLetter: { color: "#F4FAF8", fontSize: 78, lineHeight: 88, fontWeight: "800" },
  practiceText: { color: "#A9BEC8", textAlign: "center", fontSize: 13, lineHeight: 19 },
  cameraShell: { overflow: "hidden", borderRadius: 24, backgroundColor: "#102B40", borderWidth: 1, borderColor: "#2B4A5D" },
  cameraPreview: { height: 270, backgroundColor: "#0B2236", overflow: "hidden", justifyContent: "center", alignItems: "center" },
  cameraFallback: { paddingHorizontal: 24, alignItems: "center", gap: 9, maxWidth: 330 },
  cameraIconCircle: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  cameraFallbackTitle: { color: "#F4FAF8", fontSize: 17, lineHeight: 22, textAlign: "center", fontWeight: "700" },
  cameraFallbackText: { color: "#A9BEC8", fontSize: 12, lineHeight: 18, textAlign: "center" },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, margin: 35 },
  cornerTL: { position: "absolute", top: 0, left: 0, width: 30, height: 30, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "#8DE1C0", borderTopLeftRadius: 8 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 30, height: 30, borderTopWidth: 2, borderRightWidth: 2, borderColor: "#8DE1C0", borderTopRightRadius: 8 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: "#8DE1C0", borderBottomLeftRadius: 8 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 2, borderRightWidth: 2, borderColor: "#8DE1C0", borderBottomRightRadius: 8 },
  statusPill: { position: "absolute", top: 14, left: 14, flexDirection: "row", gap: 7, alignItems: "center", backgroundColor: "rgba(7,26,43,0.82)", borderRadius: 18, paddingHorizontal: 11, paddingVertical: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { color: "#F4FAF8", fontSize: 11, fontWeight: "700" },
  cameraFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  cameraFooterLabel: { color: "#A9BEC8", fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  currentLetter: { color: "#8DE1C0", fontSize: 28, fontWeight: "800", marginTop: 2 },
  holdHint: { flexDirection: "row", alignItems: "center", gap: 8 },
  holdHintText: { color: "#A9BEC8", fontSize: 11, lineHeight: 16 },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 3 },
  messageMeta: { color: "#A9BEC8", fontSize: 12, marginTop: 3 },
  clearText: { color: "#FF8D8D", fontSize: 13, fontWeight: "700", padding: 6 },
  messageCard: { backgroundColor: "#102B40", borderRadius: 20, padding: 18, minHeight: 94, borderWidth: 1, borderColor: "#2B4A5D" },
  messageText: { color: "#F4FAF8", fontSize: 24, lineHeight: 32, fontWeight: "700" },
  messagePlaceholder: { color: "#587384", fontSize: 18, fontWeight: "500" },
  messageLine: { height: 2, width: 34, backgroundColor: "#8DE1C0", borderRadius: 1, marginTop: 14 },
  controls: { flexDirection: "row", gap: 10 },
  iconButton: { flex: 1, height: 48, borderRadius: 15, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center" },
  spaceButton: { flex: 2, height: 48, borderRadius: 15, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center" },
  spaceButtonText: { color: "#F4FAF8", fontWeight: "700", fontSize: 14 },
  primaryButton: { height: 54, borderRadius: 17, backgroundColor: "#8DE1C0", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 9 },
  primaryButtonText: { color: "#071A2B", fontSize: 16, fontWeight: "800" },
  secondaryButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14, backgroundColor: "#183C52" },
  secondaryButtonText: { color: "#8DE1C0", fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  disclaimer: { color: "#6E8B99", fontSize: 10, lineHeight: 15, textAlign: "center", paddingHorizontal: 10 },
});
