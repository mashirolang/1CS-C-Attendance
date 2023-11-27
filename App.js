import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransitionPresets } from "@react-navigation/stack";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Splash from "./screens/Splash";
import MainNavigator from "./screens/MainNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

const Stack = createNativeStackNavigator();

function App() {
  const [fontsLoaded] = useFonts({
    "Montserrat-Bold": require("./fonts/Montserrat-Bold.ttf"),
    "Montserrat-Regular": require("./fonts/Montserrat-Regular.ttf"),
    "NunitoSans-Regular": require("./fonts/NunitoSans-Regular.ttf"),
  });

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            ...TransitionPresets.SlideFromRightIOS,
          }}
        >
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainNavigator" component={MainNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
