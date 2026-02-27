import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wrench, Users, Truck, ShoppingCart, Package, Settings, LogOut } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Machines", icon: Wrench },
  { label: "Employees", icon: Users },
  { label: "Vendors", icon: Truck },
  { label: "Shopping", icon: ShoppingCart },
  { label: "Releases", icon: Package },
  { label: "Settings", icon: Settings },
];

export default function MoreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">More</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Additional modules and settings
        </Text>

        <View className="mt-6 space-y-1">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              className="flex-row items-center gap-3 rounded-md px-3 py-3"
              activeOpacity={0.7}
            >
              <item.icon size={20} color="#a1a1aa" />
              <Text className="text-sm font-medium text-foreground">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-6 border-t border-border pt-4">
          <TouchableOpacity
            onPress={() => supabase.auth.signOut()}
            className="flex-row items-center gap-3 rounded-md px-3 py-3"
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-sm font-medium text-destructive">
              Sign out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
