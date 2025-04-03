import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { StatusBar } from "react-native";

export default function StudentHeadLayout() {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.replace("/login");
      } else {
        // Check if user role is student-head
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role !== "student-head") {
          // Not a student-head, redirect to login
          router.replace("/login");
        }
      }
    });
    
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1E3A8A",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: "#F0F4F8",
          },
          animation: "fade_from_bottom",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="notifications" 
          options={{ 
            headerShown: false 
          }} 
        />
        
        <Stack.Screen 
          name="profile" 
          options={{ 
            headerTitle: "My Profile",
            headerStyle: { backgroundColor: "#1E3A8A" },
            headerTintColor: "#fff",
            headerBackVisible: false,
            presentation: "modal"
          }} 
        />
        <Stack.Screen 
          name="timetable" 
          options={{ 
            headerShown: false,
            headerTitle: "Class Timetable",
            headerStyle: { backgroundColor: "#0369A1" },
            headerTintColor: "#fff",
            headerBackVisible: false,
            headerTitleStyle: {
              fontWeight: "700",
            }
          }} 
        />
        <Stack.Screen 
          name="exams" 
          options={{ 
            headerShown: false,
            headerTitle: "Exam Schedule",
            headerStyle: { backgroundColor: "#B91C1C" },
            headerTintColor: "#fff",
            headerBackVisible: false,
            headerTitleStyle: {
              fontWeight: "700",
            }
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            headerShown: false,
            headerTitle: "Manage Events",
            headerStyle: { backgroundColor: "#4D7C0F" },
            headerTintColor: "#fff",
            headerBackVisible: false,
            headerTitleStyle: {
              fontWeight: "700",
            }
          }} 
        />
      </Stack>
    </>
  );
}