import React from 'react';
import { StyleSheet, Text, View, Button, Platform } from 'react-native';
import AWSAppSyncClient from "aws-appsync";
import { Rehydrated } from 'aws-appsync-react';
import { AUTH_TYPE } from "aws-appsync/lib/link/auth-link";
import { graphql, ApolloProvider, compose } from 'react-apollo';
import * as AWS from 'aws-sdk';
import appSyncConfig from './aws-exports';
import { StackNavigator } from 'react-navigation';
import AllEvents from './Components/AllEvents'
import AddEvent from "./Components/AddEvent";
import EventComments from './Components/EventComments'
import ListEvents from './queries/ListEvents';
import CreateEvent from './queries/CreateEvent';
import DeleteEvent from './queries/DeleteEvent';
import GetEvent from './queries/GetEvent'
import SubscribeToEventComments from './queries/SubscribeToEventComments'
import CommentOnEvent from './queries/CommentOnEvent'
import uuidV4 from 'uuid/v4'

const client = new AWSAppSyncClient({
  url: appSyncConfig.aws_appsync_graphqlEndpoint,
  region: appSyncConfig.aws_appsync_region,
  auth: {
    type: appSyncConfig.aws_appsync_authenticationType,
    apiKey: appSyncConfig.aws_appsync_apiKey,
  }
});

_button = function (navigation) {
  if (Platform.OS === 'ios') {
    return <Button title='Create' color='#ffffff' onPress={() => navigation.navigate('AddEvent')} />
  } else {
    return <Button title='Create' onPress={() => navigation.navigate('AddEvent')} />
  }
}

const App = StackNavigator({
  AllEvents: {
    screen: (props) => <AllEventWithData {...props} />,
    navigationOptions: ({ navigation }) => ({
      title: 'Upcoming Events',
      headerRight: this._button(navigation),
      headerStyle: {
        backgroundColor: '#42a1f4',
      },
      headerTitleStyle: {
        color: '#ffffff'
      },
      headerTintColor: '#ffffff'
    })
  },
  AddEvent: {
    screen: (props) => <AddEventData {...props} />,
    navigationOptions: ({ navigation, screenProps }) => {
      return {
        title: 'Create Event',
        headerStyle: {
          backgroundColor: '#42a1f4'
        },
        headerTitleStyle: {
          color: '#ffffff'
        },
        headerTintColor: '#ffffff'
      };
    }
  },
  EventComments: {
    screen: (props) => (
      <EventCommentsWithSubscription
        {...props}
        eventId={props.navigation.state.params.eventId}
      />
    ),
    navigationOptions: ({ navigation, screenProps }) => {
      return {
        title: 'Comments',
        headerStyle: {
          backgroundColor: '#42a1f4'
        },
        headerTitleStyle: {
          color: '#ffffff'
        },
        headerTintColor: '#ffffff'
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
    options: {
      fetchPolicy: 'cache-and-network'
    },
    props: (props) => ({
      onDelete: (event) => {
        props.mutate({
          variables: { id: event.id },
          optimisticResponse: () => ({ deleteEvent: { ...event, __typename: 'Event', comments: { __typename: "CommentConnection", items: [], nextToken: null } } }),
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
    options: {
      refetchQueries: [{ query: ListEvents }],
      update: (dataProxy, { data: { createEvent } }) => {
        const query = ListEvents;
        const data = dataProxy.readQuery({ query });
        data.listEvents = {
          ...data.listEvents,
          items: [
            ...data.listEvents.items,
            createEvent
          ]
        }
        dataProxy.writeQuery({ query, data });
      }
    },
    props: (props) => ({
      onAdd: event => {
        return props.mutate({
          variables: event,
          optimisticResponse: () => {
            return {
              createEvent: { ...event, __typename: 'Event', comments: { __typename: "CommentConnection", items: [], nextToken: null } }
            }
          },
        });
      }
    })
  })
)(AddEvent);

const EventCommentsWithSubscription = compose(
  graphql(CommentOnEvent, {
    options: props => ({
      fetchPolicy: 'cache-and-network',
      update: (proxy, { data: { commentOnEvent } }) => {
        const query = GetEvent;
        const variables = { eventId: props.eventId };
        const data = proxy.readQuery({ query, variables });
        data.getEvent = {
          ...data.getEvent,
          comments: {
            ...data.getEvent.comments,
            items: [
              ...data.getEvent.comments.items.filter(c => {
                return c.content !== commentOnEvent.content &&
                  c.createdAt !== commentOnEvent.createdAt &&
                  c.commentId !== commentOnEvent.commentId
              }),
              commentOnEvent,
            ]
          }
        };
        proxy.writeQuery({ query, data });
      },
    }),
    props: props => ({
      createComment: (comment) =>
        props.mutate({
          variables: comment,
          optimisticResponse: { commentOnEvent: { ...comment, __typename: 'Comment', commentId: uuidV4() } },
        })
    })
  }),
  graphql(GetEvent, {
    options: ({ eventId }) => ({
      fetchPolicy: 'cache-and-network',
      variables: {
        eventId,
      }
    }),
    props: props => {
      return {
        comments: props.data.getEvent ? props.data.getEvent.comments : [],
        subscribeToNewComments: () => {
          props.data.subscribeToMore({
            document: SubscribeToEventComments,
            variables: {
              eventId: props.ownProps.navigation.state.params.eventId,
            },
            updateQuery: (prev, { subscriptionData: { data: { subscribeToEventComments } } }) => {
              const res = {
                ...prev,
                getEvent: {
                  ...prev.getEvent,
                  comments: {
                    nextToken: null,
                    __typename: 'CommentConnections',
                    items: [
                      ...prev.getEvent.comments.items.filter(c => {
                        return (
                          c.content !== subscribeToEventComments.content &&
                          c.createdAt !== subscribeToEventComments.createdAt &&
                          c.commentId !== subscribeToEventComments.commentId
                        )
                      }),
                      subscribeToEventComments,
                    ]
                  }
                },
              };
              return res;
            }
          })
        }
      }
    }
  })
)(EventComments)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
});
