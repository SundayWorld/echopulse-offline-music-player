import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: "Not Found",
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
      }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen not found</Text>
        <Text style={styles.subtitle}>This page doesn&apos;t exist</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Library</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  link: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: COLORS.text,
  },
});