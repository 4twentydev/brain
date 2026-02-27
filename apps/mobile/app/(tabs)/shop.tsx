import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShopScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Shop Flow</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Work orders and production pipeline
        </Text>
        <View className="mt-8 flex-1 items-center justify-center">
          <Text className="text-sm text-muted-foreground">
            Shop Flow module — coming in Phase 3
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
