import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Skeleton } from "@rneui/themed";

const LoadingComponent = (props) => {
  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <Skeleton animation={props.animation} width={100} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={20} />
      </View>

      <View style={styles.row}>
        <Skeleton style={styles.item} animation={props.animation} width={300} height={10} />
      </View>
      
      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
      </View>

      <View style={styles.row}>
        <Skeleton circle width={20} height={20} />
        <Skeleton style={styles.item} animation={props.animation} width={250} height={50} />
        <Skeleton style={styles.item} animation={props.animation} width={50} height={50} />
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
