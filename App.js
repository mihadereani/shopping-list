import React from 'react';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';
import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lists: [],
      uid: 0,
      loggedInText: 'Please wait, you are getting logged in',
    };

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: 'AIzaSyCroZxRzgAifRtXPxtOzzF03SAuhXdxExY',
        authDomain: 'chatapp-647e0.firebaseapp.com',
        projectId: 'chatapp-647e0',
        storageBucket: 'chatapp-647e0.appspot.com',
        messagingSenderId: '545610072431',
        appId: '1:545610072431:web:d63960cf1f06ea3d1de89a',
        measurementId: 'G-V8QYK48RJ2',
      });
    }
    this.referenceShoppinglistUser = null;
    this.addList = this.addList.bind(this);
  }

  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    this.setState({
      lists,
    });
  };

  addList() {
    // add a new list to the collection
    this.referenceShoppingLists.add({
      name: 'TestList',
      items: ['eggs', 'pasta', 'veggies'],
      uid: this.state.uid,
    });
  }

  componentDidMount() {
    // creating a references to shoppinglists collection
    this.referenceShoppingLists = firebase
      .firestore()
      .collection('shoppinglists');
    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }
      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: 'Hello there',
      });

      // create a reference to the active user's documents (shopping lists)
      this.referenceShoppinglistUser = firebase
        .firestore()
        .collection('shoppinglists')
        .where('uid', '==', this.state.uid);
      // listen for collection changes for current user
      this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(
        this.onCollectionUpdate
      );
    });
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.loggedInText}</Text>

        <Text style={styles.text}>All Shopping lists</Text>
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) => (
            <Text style={styles.item}>
              {item.name}: {item.items}
            </Text>
          )}
        />

        <Button
          onPress={() => {
            this.addList();
          }}
          title='Add something'
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    fontSize: 30,
  },
});

export default App;
