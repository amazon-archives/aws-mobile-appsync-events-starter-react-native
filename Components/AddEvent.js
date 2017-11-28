import React, { Component } from "react";
import moment from "moment";
import { ScrollView,TouchableOpacity, View, Button, Text, TextInput, Alert, StyleSheet, Platform } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class AddEvent extends Component {

    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    static defaultProps = {
        onAdd: () => null
    }

    getInitialState = () => ({
        id: '',
        name: '',
        where: '',
        when: 'when',
        whenText: 'when',
        description: '',
        isDateTimePickerVisible: false,
        whenColor:'#C1C1C1',
    });

    handleChange = (field, value) => {
        this.setState({
            [field]: value
        });
    }

    _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });
    
    _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
    
    _handleDatePicked = (date) => {
        this.setState({
            when: date.toISOString(),
            whenText: moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a'),
            whenColor:'#000000',
        })
        this._hideDateTimePicker();
    };

    handleAdd = () => {
        const { id, name, where, when, description } = this.state;

        this.setState(this.getInitialState(), () => {
            this.props.onAdd({ id, name, where, when, description });
            this.props.navigation.goBack();
        });
    }

    handleCancel = () => {
        this.setState(this.getInitialState());
    }

    saveButton = ()=>{
        if(Platform.OS === 'ios'){
            return (
                <View style={styles.footer}>
                    <Button title="Save" color='#ffffff' onPress={this.handleAdd}/>
                </View>
            )
        }else{
            const saveButtonStyle = {
                backgroundColor: '#42a1f4',
                color: '#ffffff',
                height: 75,
                fontSize: 20,
            }
            return(<Button title="Save" style={saveButtonStyle} onPress={this.handleAdd}/>)
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.contentContainer}>
                    <TextInput autoFocus={true}
                        style={styles.eventName}
                        multiline={false}
                        value={this.state.name}
                        spellCheck={false}
                        onChangeText={this.handleChange.bind(this, 'name')} 
                        placeholderTextColor = "#C1C1C1"
                        placeholder="Event Name"/>
                    
                    <TextInput style={styles.eventWhere} 
                        value={this.state.where} 
                        onChangeText={this.handleChange.bind(this, 'where')} 
                        placeholder="Location"/>
                    
                    <TouchableOpacity onPress={this._showDateTimePicker}>
                        <Text style={styles.eventWhen} >{this.state.whenText}</Text>
                    </TouchableOpacity>
                    <DateTimePicker
                        mode='datetime'
                        isVisible={this.state.isDateTimePickerVisible}
                        onConfirm={this._handleDatePicked}
                        onCancel={this._hideDateTimePicker}/>

                    <TextInput style={styles.eventDescription} 
                        value={this.state.description} 
                        multiline={true}
                        onChangeText={this.handleChange.bind(this, 'description')} 
                        placeholder="More Info"/>
                </View>
                {this.saveButton()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer:{
        flex: 1,
    },
    footer:{
        height: 50,
        backgroundColor:'#42a1f4'
    },
    eventWhen:{
        backgroundColor:'#ffffff',
        color: '#C1C1C1',
        fontSize: 20,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#C1C1C1',
    },
    eventName:{
        fontSize: 40,
        padding : 10,
        marginBottom: 40,
        backgroundColor:'#ffffff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#C1C1C1'
    },
    eventDescription:{
        fontSize: 20,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#C1C1C1',
        backgroundColor:'#ffffff',
    },
    eventWhere:{
        fontSize: 20,
        padding: 10,
        borderTopWidth: 0.5,
        borderTopColor: '#C1C1C1',
        borderBottomWidth: 0.5,
        borderBottomColor: '#C1C1C1',
        backgroundColor:'#ffffff',
    },
    saveButton:{
        fontSize: 20,
    }
});