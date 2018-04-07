import React from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import { graphql, ApolloProvider, compose } from 'react-apollo';
import { StackNavigator } from 'react-navigation';

import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from "aws-appsync/lib/link/auth-link";
import * as AWS from 'aws-sdk';

import awsconfig from './aws-exports';
import AllEvents from './Components/AllEvents'
import AddEvent from "./Components/AddEvent";

import ListEvents from "./queries/ListEvents";
import DeleteEvent from "./mutations/DeleteEvent";
import CreateEvent from "./mutations/CreateEvent";

console.disableYellowBox = true;

const client = new AWSAppSyncClient({
  url: awsconfig.graphqlEndpoint,
  region: awsconfig.region,
  auth: {type: AUTH_TYPE.API_KEY, apiKey: awsconfig.apiKey}
});

_button = function(navigation){
  if(Platform.OS === 'ios'){
    return <Button title='Create' color='#ffffff' onPress={()=> navigation.navigate('AddEvent')} />
  }else {
    return <Button title='Create' onPress={()=> navigation.navigate('AddEvent')} />
  }
}

const App = StackNavigator({
  AllEvents : { 
    screen : (props) => <AllEventWithData {...props}/>,
    navigationOptions: ({navigation}) => ({
      title: 'Upcoming Events',
      headerRight: this._button(navigation),
      headerStyle:{
        backgroundColor:'#42a1f4',
      },
      headerTitleStyle:{
        color: '#ffffff'
      },
      headerTintColor:'#ffffff'
    })
  },
  AddEvent: {
    screen: (props) => <AddEventData {...props} />,
     navigationOptions: ({navigation, screenProps}) => {
      return {
        title: 'Create Event',
        headerStyle:{
          backgroundColor:'#42a1f4'
        },
        headerTitleStyle:{
          color: '#ffffff'
        },
        headerTintColor:'#ffffff'
      };
    }
  }
});

const WithProvider = () => (
<ApolloProvider client={client}>
    <Rehydrated>
        <App />
    </Rehydrated>
</ApolloProvider>
);

export default WithProvider;

const AllEventWithData = compose(
  graphql(ListEvents, {
      options: {
        fetchPolicy: 'cache-and-network'
      },
      props: (props) => ({
        events: props.data.listEvents ? props.data.listEvents.items : [],
      })
  }),
  graphql(DeleteEvent, {
    options:{
      fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
        onDelete: (event) => {
          props.mutate({
            variables: { id: event.id },
            optimisticResponse: () => ({ deleteEvent: { ...event, __typename: 'Event', comments: {__typename:"CommentConnection",items:[], nextToken:null} } }),
          })
        }
    }),
    options: {
      refetchQueries: [{ query: ListEvents }],
      update: (dataProxy, { data: { deleteEvent: { id } } }) => {
        const query = ListEvents;
        const data = dataProxy.readQuery({ query });
        data.listEvents.items = data.listEvents.items.filter(event => event.id !== id);
        dataProxy.writeQuery({ query, data });
      }
    }
  }),
)(AllEvents);

const AddEventData = compose(
  graphql(CreateEvent, {
    options:{
      fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
        onAdd: event => {
          props.mutate({
            variables: event,
            optimisticResponse: () => ({ createEvent: { ...event, __typename: 'Event', comments: {__typename:"CommentConnection",items:[], nextToken:null} }}),
          });
       }
    }),
    options: {
      refetchQueries: [{ query: ListEvents }],
      update: (dataProxy, { data: { createEvent } }) => {
        const query = ListEvents;
        const data = dataProxy.readQuery({ query });
        data.listEvents.items.push(createEvent);
        dataProxy.writeQuery({ query, data });
      }
    }
  })
)(AddEvent);

const styles = StyleSheet.create({
  container: {
      flex: 1,
      flexDirection: 'column',
      backgroundColor: '#fff',
      alignItems: 'stretch',
      justifyContent: 'center',
  },
});
