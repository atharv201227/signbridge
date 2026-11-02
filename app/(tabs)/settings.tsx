import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

const SETTINGS_KEY = "signbridge.settings.v1";

type Settings = { rate: number; saveHistory: boolean };

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({ rate: 0.9, saveHistory: true });
  useEffect(() => { AsyncStorage.getItem(SETTINGS_KEY).then((value) => value && setSettings(JSON.parse(value))).catch(() => undefined); }, []);
  const update = (next: Settings) => { setSettings(next); AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => undefined); };
  const rateLabel = settings.rate < 0.85 ? "Slow" : settings.rate > 0.95 ? "Fast" : "Normal";

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-5"><View style={styles.content}><Text style={styles.eyebrow}>SIGNBRIDGE</Text><Text style={styles.title}>Settings</Text><Text style={styles.subtitle}>Keep the experience comfortable, private, and easy to understand.</Text><View style={styles.section}><Text style={styles.sectionLabel}>SPEECH</Text><View style={styles.row}><View style={styles.rowText}><Text style={styles.rowTitle}>Speech rate</Text><Text style={styles.rowSubtitle}>{rateLabel} · {settings.rate.toFixed(1)}×</Text></View><View style={styles.rateControls}><Pressable onPress={() => update({ ...settings, rate: Math.max(0.6, Number((settings.rate - 0.1).toFixed(1))) })} style={styles.rateButton}><Text style={styles.rateButtonText}>−</Text></Pressable><Pressable onPress={() => update({ ...settings, rate: Math.min(1.2, Number((settings.rate + 0.1).toFixed(1))) })} style={styles.rateButton}><Text style={styles.rateButtonText}>+</Text></Pressable></View></View></View><View style={styles.section}><Text style={styles.sectionLabel}>PRIVACY</Text><View style={styles.row}><View style={styles.rowText}><Text style={styles.rowTitle}>Save spoken messages</Text><Text style={styles.rowSubtitle}>Keep replayable history on this device</Text></View><Switch value={settings.saveHistory} onValueChange={(value) => update({ ...settings, saveHistory: value })} trackColor={{ false: "#2B4A5D", true: "#5DBD9D" }} thumbColor={settings.saveHistory ? "#8DE1C0" : "#A9BEC8"} /></View><Text style={styles.note}>Camera and recognition are intended to run on-device. SignBridge does not need an account to build or speak a message.</Text></View></View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, paddingTop: 18, gap: 8 }, eyebrow: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 }, title: { color: "#F4FAF8", fontSize: 29, fontWeight: "800", marginTop: 3 }, subtitle: { color: "#A9BEC8", fontSize: 14, lineHeight: 21, marginTop: 3, marginBottom: 12 }, section: { backgroundColor: "#102B40", borderRadius: 19, borderWidth: 1, borderColor: "#2B4A5D", padding: 16, gap: 14, marginTop: 8 }, sectionLabel: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, rowText: { flex: 1, gap: 4 }, rowTitle: { color: "#F4FAF8", fontSize: 16, fontWeight: "800" }, rowSubtitle: { color: "#A9BEC8", fontSize: 12, lineHeight: 17 }, rateControls: { flexDirection: "row", gap: 8 }, rateButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#183C52", alignItems: "center", justifyContent: "center" }, rateButtonText: { color: "#8DE1C0", fontSize: 23, lineHeight: 25, fontWeight: "800" }, note: { color: "#6E8B99", fontSize: 11, lineHeight: 17, marginTop: 4 } });
