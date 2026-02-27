import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InboxScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Inbox</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Notifications and updates
        </Text>
        <View className="mt-8 flex-1 items-center justify-center">
          <Text className="text-sm text-muted-foreground">
            No notifications yet
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
