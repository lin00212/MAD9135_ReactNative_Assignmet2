import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  StatusBar,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from "react-native";
import UserAvatar from "react-native-user-avatar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function App() {
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = async (size = 10) => {
    try {
      const response = await axios.get(
        `https://random-data-api.com/api/v2/users?size=${size}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch users",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
  }, []);

  const addUser = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get("https://random-data-api.com/api/v2/users?size=1");
      const newUser = response.data;
      if (newUser && newUser.uid && newUser.first_name && newUser.last_name) {
        setUsers(prevUsers => [newUser, ...prevUsers]);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Added one new user successfully 👋",
        });
      } else {
        throw new Error("Invalid user data received");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.status === 429 ? "Too many requests. Please try again later." : "Failed to add new user 😢",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const Avatar = ({ size = 50, src, name }) => {
    if (src) {
      return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
    }
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: size / 3 }}>{name.split(' ').map(n => n[0]).join('')}</Text>
      </View>
    );
  };

  const renderItem = useCallback(({ item }) => {
    if (!item) return null;  //handle potential null/undefined items
    return (
      <View style={styles.itemContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.firstName}>{item.first_name}</Text>
          <Text style={styles.lastName}>{item.last_name}</Text>
        </View>
        <Avatar
          size={50}
          src={item.avatar}
          name={`${item.first_name} ${item.last_name}`}
        />
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item) => item.uid, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Welcome to the User List App</Text>
        </View>
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
        <TouchableOpacity style={styles.fab} onPress={addUser}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6e6fa",
  },

  header: {
    padding: 16,
    backgroundColor: "#6a5acd",
  },
  headerText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  users: {
    padding: 16,
    paddingBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  textContainer: {
    flex: 1,
  },
  firstName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastName: {
    fontSize: 14,
    color: "#666",
  },
  name: {
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6a5acd",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: "white",
  },
});