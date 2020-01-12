import React, { Component, Fragment } from 'react';
import { View, Text } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import Toolbar from '../components/toolbar';
import Gallery from '../components/gallery';
import styles from '../styles';

export default class CameraView extends Component {
    camera = null;
    state = {
        captures: [],
        // setting flash to be turned off by default
        flashMode: Camera.Constants.FlashMode.off,
        capturing: null,
        // start the back camera by default
        cameraType: Camera.Constants.Type.back,
        hasCameraPermission: null,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures] })
    };

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();

        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };

    handlePhotoUpload = (photo) => {
        const {navigate} = this.props.navigation;
        navigate('ImageView', { imageURI: photo })

        // var createFormData = function(photo,body){
        //     const data = new FormData();
    
        //     data.append("photo", {
        //       uri:
        //         Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", "")
        //     });
          
        //     Object.keys(body).forEach(key => {
        //       data.append(key, body[key]);
        //     });
          
        //     return data;
        // };

        // fetch("http://localhost:3000/api/upload", {
        //     method: "POST",
        //     body: createFormData(photo, { })
        //   })
        //     .then(response => {
        //       console.log("upload succes", response);
        //       alert("Upload success!");
        //     })
        //     .catch(error => {
        //       console.log("upload error", error);
        //       alert("Upload failed!");
        //       navigate('ImageView',{ imageURI: photo.uri})
        //     });
    };

    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };

    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures } = this.state;

        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied.</Text>;
        }

        return (
            <Fragment>
                 <View  style={{ flex: 1 }}>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />
                </View>
                {captures.length > 0 && <Gallery 
                    handlePhotoUpload={this.handlePhotoUpload} 
                    captures={captures}
                />}
                <Toolbar 
                    capturing={capturing}
                    flashMode={flashMode}
                    cameraType={cameraType}
                    setFlashMode={this.setFlashMode}
                    setCameraType={this.setCameraType}
                    onCaptureIn={this.handleCaptureIn}
                    onCaptureOut={this.handleCaptureOut}
                    onLongCapture={this.handleLongCapture}
                    onShortCapture={this.handleShortCapture}
                />
            </Fragment>
            
        );
    };
};