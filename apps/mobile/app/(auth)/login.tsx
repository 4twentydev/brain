import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 items-center justify-center bg-background px-6"
    >
      <View className="w-full max-w-sm space-y-8">
        <View className="items-center">
          <Text className="text-2xl font-bold text-foreground">Brain</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Sign in to your account
          </Text>
        </View>

        {error && (
          <View className="rounded-md bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="h-12 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              secureTextEntry
              className="h-12 rounded-md border border-input bg-muted px-3 text-sm text-foreground"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="h-12 items-center justify-center rounded-md bg-primary"
            activeOpacity={0.8}
          >
            <Text className="text-sm font-medium text-primary-foreground">
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Text className="text-primary">Sign up</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
