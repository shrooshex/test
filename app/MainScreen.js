/**
 * @format
 * @flow strict-local
 */
import React, {useRef, useState} from 'react';
import {RNCamera} from 'react-native-camera';
import {
    View,
    Animated,
    StyleSheet,
    Dimensions,
    PanResponder,
    Text,
    ImageBackground,
    TouchableWithoutFeedback, ActivityIndicator
} from "react-native";

const {height, width} = Dimensions.get('window');
const zoomLevel = 4;
const sense = 1.2;
const circleSize = 75 / zoomLevel
const getMaxOffsets = () => {
    const offsetFactor = (zoomLevel - 1) / 2;
    return {
        y: height * offsetFactor / zoomLevel,
        x: width * offsetFactor / zoomLevel,
    }
}
const {x, y} = getMaxOffsets();
const MainScreen = () => {
    const [imageLoaded, setImageLoaded] = useState(true);
    const [offsetX, setOffsetX] = useState(x);
    const [offsetY, setOffsetY] = useState(y);
    const [displayPlaceholder, setDisplayPlaceHolder] = useState(false);
    const [placeholderX, setPlaceholderX] = useState(0);
    const [placeholderY, setPlaceholderY] = useState(0);
    const _handleStartShouldSetPanResponder = (e, gestureState) => {
        return true;
    }
    const touch = useRef(
        new Animated.ValueXY({x: 20, y: 90})
    ).current;
    const runAnimation = (newLocationX, newLocationY) => {
        setDisplayPlaceHolder(true);
        setPlaceholderX(newLocationX);
        setPlaceholderY(newLocationY);
        Animated.timing(touch, {
            toValue: {
                x: newLocationX,
                y: newLocationY
            },
            duration: 500,
            useNativeDriver: false,
        }).start(() => {
            setDisplayPlaceHolder(false);
        })
    }
    const handlePress = (event) => {
        let newLocationX = event.nativeEvent.locationX - circleSize / 2;
        let newLocationY = event.nativeEvent.locationY - circleSize / 2;
        if (newLocationX < circleSize) {
            newLocationX = circleSize / 4
        }
        if (newLocationX > width - circleSize) {
            newLocationX = width - circleSize
        }
        if (newLocationY > height - circleSize) {
            newLocationY = height - circleSize
        }
        if (newLocationY < circleSize) {
            newLocationY = circleSize / 4
        }
        runAnimation(newLocationX, newLocationY);
    }

    const _handleMoveShouldSetPanResponder = (e, gestureState) => {
        return true;
    }
    const _handlePanResponderGrant = (e, gestureState) => {
        return true;
    }

    const _handlePanResponderMove = (e, gestureState) => {
        let newOffsetX = offsetX + gestureState.dx / zoomLevel * sense;
        let newOffsetY = offsetY + gestureState.dy / zoomLevel * sense;
        if (newOffsetX > x) {
            newOffsetX = x;
        }
        if (newOffsetY > y) {
            newOffsetY = y;
        }
        if (newOffsetX < x * -1) {
            newOffsetX = x * -1;
        }
        if (newOffsetY < y * -1) {
            newOffsetY = y * -1;
        }
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    }
    const _handlePanResponderEnd = (e, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
    }
    const onPanResponderTerminate = (e, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
    }
    const onShouldBlockNativeResponder = (e, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
    }
    const gestureHandlers = PanResponder.create({
        onStartShouldSetPanResponder: _handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: _handleMoveShouldSetPanResponder,
        onPanResponderGrant: _handlePanResponderGrant,
        onPanResponderMove: _handlePanResponderMove,
        onPanResponderRelease: _handlePanResponderEnd,
        onPanResponderTerminate: onPanResponderTerminate,
        onPanResponderTerminationRequest: false,
        onShouldBlockNativeResponder: (evt) => false,
    });
    return (
        <View style={styles.wrapper} {...gestureHandlers.panHandlers}>
            {imageLoaded ? <View style={styles.loading}>
                <ActivityIndicator size='large'/>
            </View> : null}
            <TouchableWithoutFeedback onPress={handlePress}>
                <ImageBackground resizeMode={'stretch'}
                                 style={[{
                                     width: width,
                                     height: height,
                                     transform: [
                                         {scale: zoomLevel},
                                         {translateX: offsetX},
                                         {translateY: offsetY},
                                     ],
                                 }]}
                                 onLoad={() => {
                                     setImageLoaded(false)
                                 }}
                                 source={require('../assets/background.jpeg')}>
                    {!imageLoaded ? <Animated.View style={[styles.circle, {top: touch.y, left: touch.x}]}>
                        <RNCamera
                            type={RNCamera.Constants.Type.front}
                            style={styles.camera}
                            flashMode={RNCamera.Constants.FlashMode.on}
                            androidCameraPermissionOptions={{
                                title: 'Permission to use camera',
                                message: 'We need your permission to use your camera',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                            androidRecordAudioPermissionOptions={{
                                title: 'Permission to use audio recording',
                                message: 'We need your permission to use your audio',
                                buttonPositive: 'Ok',
                                buttonNegative: 'Cancel',
                            }}
                        >
                            {({camera, status, recordAudioPermissionStatus}) => {
                                if (status !== 'READY') return <View style={styles.permissions}><Text>P</Text></View>;
                            }}
                        </RNCamera>
                    </Animated.View> : null}
                    {displayPlaceholder ? <View style={[styles.placeholder, {
                        top: placeholderY,
                        left: placeholderX,
                    }]}/> : null}
                </ImageBackground>
            </TouchableWithoutFeedback>
        </View>
    );
}
const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    camera: {
        width: circleSize,
        height: circleSize,
    },
    circle: {
        backgroundColor: 'green',
        position: 'absolute',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'orange',
        borderWidth: 1,
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
    },
    placeholder: {
        position: 'absolute',
        width: circleSize,
        height: circleSize,
        borderRadius: circleSize / 2,
        borderColor: 'white',
        borderWidth: 1,
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    permissions: {flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}
});
export default MainScreen;
