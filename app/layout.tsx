import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { MusicLibraryProvider } from "@/contexts/MusicLibraryContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="now-playing"
          options={{
            headerShown: false,
            presentation: "card",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    // Hide splash ONLY after everything is mounted
    await SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <MusicLibraryProvider>
            <MusicPlayerProvider>
              <RootLayoutNav />
            </MusicPlayerProvider>
          </MusicLibraryProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}


