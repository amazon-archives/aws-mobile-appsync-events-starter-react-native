import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native'

import moment from 'moment'

export default class EventComments extends React.Component {
  state = {
    comment: ''
  }
  componentDidMount() {
    this.props.subscribeToNewComments()
  }
  onChangeText = (val) => {
    this.setState({
      comment: val
    })
  }
  addComment = () => {
    if (this.state.comment === '') return
    const { eventId } = this.props.navigation.state.params
    const comment = {
      content: this.state.comment,
      eventId: eventId,
      createdAt: moment.utc().format(),
    }
    this.props.createComment(comment)
    this.setState({ comment: '' })
  }
  render() {
    const { items = [] } = this.props.comments
    return (
      <View style={styles.wrapper}>
        <ScrollView contentContainerStyle={styles.contentContainerStyle}>
          <View style={styles.container}>
            {
              items.map((comment, index) => (
                <View key={index} style={styles.commentContainer}>
                  <Text style={styles.comment}>{comment.content}</Text>
                  <Text style={styles.date}>{moment(comment.createdAt).format("MMM Do YYYY")}</Text>
                </View>
              ))
            }
          </View>
        </ScrollView>
        <TextInput
          onChangeText={val => this.onChangeText(val)}
          placeholder='Comment'
          style={styles.input}
          autoCapitalize='none'
          value={this.state.comment}
          autoCorrect={false}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={this.addComment}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Add Comment</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  contentContainerStyle: {
    paddingTop: 10
  },
  commentContainer: {
    margin: 10,
    marginTop: 0,
    borderBottomColor: '#c6c6c6',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  comment: {
    fontSize: 20,
    marginBottom: 8
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#a8a8a8'
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
  },
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#42a1f4',
  },
  buttonText: {
    color: 'white',
    fontSize: 19
  },
  input: {
    height: 50,
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#42a1f4',
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 50,
    left: 0,
    paddingHorizontal: 8
  },
  container: {
    paddingBottom: 100,
  }
})