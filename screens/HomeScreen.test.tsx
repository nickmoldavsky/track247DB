import React from "react";
import { render } from "@testing-library/react-native";

//import HomeScreen from "./HomeScreen";
import LocationScreen from "./LocationScreen";

describe("Counter", () => {
//   it("renders correctly HomeScreen", () => {
//     render(<LocationScreen />);
//   });

  it("1 + 1 should equals 2", () => {
    expect(1 + 1).toEqual(2);
  });

  it.todo("renders correctly");

  it.todo("shows an initial state of 0");

  it.todo("increments by 1 each time increment is pressed");

  it.todo("decrements by 1 each time decrement is pressed");
});
