import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";

const HISTORY_KEY = "signbridge.history.v1";
type HistoryItem = { id: string; text: string; createdAt: string };

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((value) => setItems(value ? JSON.parse(value) : [])).catch(() => setItems([]));
  }, []));

  const clearHistory = async () => { await AsyncStorage.removeItem(HISTORY_KEY); setItems([]); };
  const speak = (text: string) => { Speech.stop(); Speech.speak(text, { language: "en-US", rate: 0.9 }); };

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background" className="px-5"><View style={styles.content}><View style={styles.header}><View><Text style={styles.eyebrow}>SIGNBRIDGE</Text><Text style={styles.title}>History</Text></View>{items.length > 0 && <Pressable onPress={clearHistory}><Text style={styles.clear}>Clear all</Text></Pressable>}</View><Text style={styles.subtitle}>Messages you chose to speak stay on this device.</Text>{items.length === 0 ? <View style={styles.empty}><MaterialIcons name="history" size={34} color="#8DE1C0" /><Text style={styles.emptyTitle}>No saved messages</Text><Text style={styles.emptyText}>Your spoken messages will appear here for quick replay.</Text></View> : <View style={styles.list}>{items.map((item) => <View key={item.id} style={styles.item}><View style={styles.itemText}><Text style={styles.message}>{item.text}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text></View><Pressable onPress={() => speak(item.text)} style={styles.play}><MaterialIcons name="play-arrow" size={22} color="#071A2B" /></Pressable></View>)}</View>}</View></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { flex: 1, paddingTop: 18, gap: 14 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }, eyebrow: { color: "#8DE1C0", fontSize: 10, fontWeight: "800", letterSpacing: 1.8 }, title: { color: "#F4FAF8", fontSize: 29, fontWeight: "800", marginTop: 4 }, clear: { color: "#FF9696", fontSize: 13, fontWeight: "800", padding: 6 }, subtitle: { color: "#A9BEC8", fontSize: 14, lineHeight: 21 }, empty: { flex: 1, minHeight: 280, alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 30 }, emptyTitle: { color: "#F4FAF8", fontSize: 19, fontWeight: "800" }, emptyText: { color: "#A9BEC8", textAlign: "center", lineHeight: 19 }, list: { gap: 10, marginTop: 8 }, item: { backgroundColor: "#102B40", borderRadius: 17, borderWidth: 1, borderColor: "#2B4A5D", padding: 15, flexDirection: "row", alignItems: "center", gap: 12 }, itemText: { flex: 1, gap: 6 }, message: { color: "#F4FAF8", fontSize: 18, fontWeight: "700" }, date: { color: "#6E8B99", fontSize: 11 }, play: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#8DE1C0", alignItems: "center", justifyContent: "center" } });
