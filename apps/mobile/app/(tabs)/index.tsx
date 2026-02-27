import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Overview of your tasks, projects, and operations.
        </Text>

        <View className="mt-6 flex-row flex-wrap gap-3">
          {[
            { label: "Open Tasks", value: "—" },
            { label: "Active Projects", value: "—" },
            { label: "Work Orders", value: "—" },
            { label: "Machines Online", value: "—" },
          ].map((stat) => (
            <View
              key={stat.label}
              className="min-w-[45%] flex-1 rounded-lg border border-border bg-card p-4"
            >
              <Text className="text-xs text-muted-foreground">
                {stat.label}
              </Text>
              <Text className="mt-1 text-xl font-semibold text-foreground">
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 rounded-lg border border-border bg-card p-4">
          <Text className="text-sm font-medium text-muted-foreground">
            Recent Activity
          </Text>
          <Text className="mt-6 text-center text-sm text-muted-foreground">
            No activity yet
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
