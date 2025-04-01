import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function Layout() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
          headerShadowVisible: true,
          animation: "fade",
          animationDuration: 200,
        }}
      >
        <Stack.Screen 
          name="student" 
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
            animation: "slide_from_bottom", 
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: "Login",
            headerShown: false,
            animation: "fade",
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: "Register", 
            headerShown: false,
            animation: "fade",
          }} 
        />
        <Stack.Screen 
          name="student-head" 
          options={{ 
            headerShown: false,
            animation: "slide_from_right",
          }} 
        />
      </Stack>
    </>
  );
}