import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@rneui/themed";

const LoadingComponent = (props) => {
  return (
    <View style={styles.container}>
      
      <View style={styles.row}>
        <Skeleton circle width={40} height={40} />
        <Skeleton style={styles.item} animation={props.animation} width={300} height={40} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={40} height={40} />
        <Skeleton style={styles.item} animation={props.animation} width={300} height={40} />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    margin: 10,
    
  }
});

export default LoadingComponent;
