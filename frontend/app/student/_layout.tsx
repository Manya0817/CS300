import { Stack } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { StatusBar } from "react-native";

export default function StudentLayout() {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user is signed in, redirect to login
        router.replace("/login");
      } else {
        // Check if user role is student
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role !== "student") {
          // Not a student, redirect to login
          router.replace("/login");
        }
      }
    });
    
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4C1D95" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#4C1D95",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#F9FAFB",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="dashboard"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            headerTitle: "My Profile",
            headerStyle: { backgroundColor: "#4C1D95" },
            headerTintColor: "#fff",
            presentation: "card"
          }}
        />
        <Stack.Screen
          name="timetable"
          options={{
            
            headerTitle: "Class Timetable",
            headerStyle: { backgroundColor: "#22C55E" },
            headerShown: false,
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "700",
            }
          }}
        />
        <Stack.Screen
          name="exams"
          options={{
            headerTitle: "Exam Schedule",
            headerShown: false,
            headerStyle: { backgroundColor: "#F59E0B" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "700",
            }
          }}
        />
         <Stack.Screen
          name="events"
          options={{
            headerTitle: "Events",
            headerShown: false,
            headerStyle: { backgroundColor: "#F59E0B" },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "700",
            }
          }}
        />
        
<Stack.Screen
  name="notifications"
  options={{
    headerShown: false,
    animation: 'slide_from_right',
  }}
/>  
      </Stack>
    </>
  );
}