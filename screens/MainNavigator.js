// In App.js in a new project

import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransitionPresets } from "@react-navigation/stack";
import Main from "./Main";
import Scan from "./Scan";

const Stack = createNativeStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Scan" component={Scan} />
    </Stack.Navigator>
  );
}

export default MainNavigator;
