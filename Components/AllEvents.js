import React, { Component } from "react";
import moment from "moment";
import { ScrollView, Separator, View, Button, Text, TextInput, Alert, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Swipeout from 'react-native-swipeout';

export default class AllEvents extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: {}
        }
    }

    static defaultProps = {
        events: [],
        onDelete: () => null,
        onEdit: () => null,
    }

    handleDelete = async (event) => {
        const confirm = await new Promise((resolve, reject) => {
            Alert.alert('Confirm delete', 'Are you sure?', [
                { text: 'OK', onPress: () => resolve(true) },
                { text: 'Cancel', onPress: () => resolve(false) },
            ], { cancelable: false });
        });
        if (confirm) {
            this.props.onDelete(event);
        }
    }

    renderEvents = (event) => {
        var swipeoutBtns = [
            {
                text: 'Delete',
                backgroundColor:'#f44242',
                color:'#ffffff',
                onPress: ()=> {
                    this.handleDelete(event);
                }
            }
        ]
        return (
            (
                <Swipeout right={swipeoutBtns}
                    key={event.id}
                    style={styles.swipableItem}
                    autoClose={true}>
                    <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('EventComments', { eventId: event.id })}>
                        <View style={styles.item}>
                            <View>
                                <Text style={styles.whenStyle}>{moment.utc(event.when).format('MMM Do')}</Text>
                                <Text style={styles.dayStyle}>{moment.utc(event.when).format('ddd')}</Text>
                            </View>
                            <View style={styles.rowSeparator} />
                            <View style={styles.itemColumn}>
                                <Text style={styles.eventHeader}>{event.name}</Text>
                                <Text style={styles.eventTime}>{moment.utc(event.when).format('HH:mm A')}</Text>
                                <Text style={styles.eventWhere}>{event.where}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Swipeout>
            )
        );
    }

    render() {
        const { events, error } = this.props;

        if (error) {
            console.log(error.networkError.response && JSON.parse(error.networkError.response._bodyText).message);
            return <Text>{error.message}</Text>
        }

        return (
            <View style={styles.allEventPageStyle}>
                <ScrollView contentContainerStyle={styles.scroller} 
                    refreshing={true}>
                    <View style={styles.container}>
                        {[].concat(events).sort((a, b) => moment.utc(b.when) - moment.utc(a.when)).map(this.renderEvents)}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    rowSeparator:{
        borderLeftColor : '#42a1f4',
        borderLeftWidth: 2,
    },
    whenStyle:{
        color: '#1b1d21',
        marginLeft: 2,
        fontSize: 20,
        padding: 5
    },
    dayStyle:{
        color: '#1b1d21',
        marginLeft: 2,
        fontSize: 15,
        padding: 5
    },
    header:{
        padding: 10,
        flexDirection: 'row',
        alignItems : 'center',
        backgroundColor: '#42a1f4',
    },
    createButton:{
        flex:1,
    },
    headerText:{
        fontSize: 30,
        flex:1,
        color: '#FFFFFF',
        alignItems: 'flex-start',
    },
    eventHeader:{
        marginLeft: 12,
        fontSize: 20,
    },
    eventTime:{
        marginLeft: 12,
        fontSize: 13,
    },
    eventWhere:{
        marginLeft: 12,
        fontSize: 13,
    },
    eventCommentsCount:{
        color: '#C1C1C1',
        marginLeft: 12,
        fontSize: 10,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        margin: 2,
    },
    item: {
        flex:1,
        flexDirection: 'row',
        paddingTop: 10
    },
    itemColumn: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    scroller: {
        flexGrow:1,
        padding: 2,
    },
    allEventPageStyle:{
        flexGrow:1,
        backgroundColor: '#FFFFFF'
    },
    swipableItem:{
        width:'100%',
        backgroundColor:'#ffffff',
    }
});