import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  StatusBar,
  Image,
  Pressable,
  FlatList
} from 'react-native'

import Animated, { Easing, Extrapolate } from 'react-native-reanimated';
import { PanGestureHandler, ScrollView, State } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Vector from 'react-native-vector-icons/Entypo'
import { useValue, useClock, usePanGestureHandler, onScrollEvent, interpolateColor } from 'react-native-redash'

const { height, width } = Dimensions.get('screen');

const {
  Clock,
  eq,
  cond,
  not,
  clockRunning,
  startClock,
  stopClock,
  timing,
  spring,
  Value,
  useCode,
  set,
  block,
  interpolate,
  and,
  event,
  divide,
  diff,
  add,
  multiply,
  lessThan,
  greaterThan,
  debug,
  decay,
  diffClamp,
  call
} = Animated

const KEYBOARD_HEIGHT = height * .25
const NUMERIC_KEY_SIZE = KEYBOARD_HEIGHT * .2
const KEYBOARD_PADDING = 16
const NUMERIC_KEYS_PADDING = 8
const QUICK_STAKE_KEY_HEIGHT = KEYBOARD_HEIGHT * .156
const QUICK_STAKE_KEY_WIDTH = (width * .18)
const QUICK_STAKES = (QUICK_STAKE_KEY_WIDTH * 2) + (KEYBOARD_PADDING) + NUMERIC_KEYS_PADDING
const NUMERIC_KEYS = (NUMERIC_KEY_SIZE * 4) + (NUMERIC_KEYS_PADDING * 4) + KEYBOARD_PADDING
const PLACE_BUTTON_WIDTH = (QUICK_STAKE_KEY_WIDTH * 2) + NUMERIC_KEYS_PADDING

const numericKeys = [1,2,3,'.',4,5,6,0,7,8,9,'x']
const quickStakes = [
  {
    id: 1,
    amount: 5,
    color: "#E476FF"
  },
  {
    id: 2,
    amount: 10,
    color: "#59D7FF"
  },
  {
    id: 3,
    amount: 50,
    color: "#FDCB4A"
  },
  {
    id: 4,
    amount: 100,
    color: "#88FF7E"
  }
]

const runSpring = (clock, value, startValue) => {
  const state = {
    finished: new Value(0),
    position: startValue,
    velocity: new Value(0),
    time: new Value(0)
  }

  const config = {
    toValue: new Value(value),
    damping: 20,
    mass: .5,
    stiffness: 100,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  };

  return block([spring(clock, state, config),
      cond(eq(state.finished, 1),
      [
        stopClock(clock),
        set(state.finished, 0)
      ]
    ),
    state.position
  ])
}

//Scenario 1
//Start pos, user swipes up -> lock keyboard
//Start pos, user swipes down -> snap to second pos
//Second pos, user swipes down -> return to second pos
//Second pos, user swipes up -> snap to first pos

const interaction = (value, position, state, modifyScroll) => {
 const dragging = new Value(0)
 const layout = new Value(1)
 const start = new Value(0)
 const clock = new Clock()

 return block([
   cond(
     eq(state, State.ACTIVE),
    [
      cond(and(greaterThan(value, 0), eq(layout, 1)),
        set(layout, 2),
        cond(and(lessThan(value, 0), eq(layout, 2)),
        set(layout, 1)
      ))
    ],
  ),
  cond(
    eq(state, State.END),
    [
      cond(eq(layout, 1),
        [
          startClock(clock),
          runSpring(clock,0,position)
        ],
      ),
      cond(eq(layout, 2),
        [
          startClock(clock),
          runSpring(clock,90,position),
        ],
      ),
      set(start, position),
    ],
  ),
  [
    position
  ]
 ])
}

export default NotSure = () =>  {
  const positionY = new Value(0)

  const {
    translation,
    state
  } = usePanGestureHandler();

  const onGestureEvent = event(
		[{
			nativeEvent: {
				translationY: translation.y,
        state: state
			},
		}],
	)

  const _transY = interaction(translation.y, positionY, state)

  const opacity = interpolate(positionY, {
    inputRange: [0, 120],
    outputRange: [0,1]
  })

  const keysOpacity = interpolate(positionY, {
    inputRange: [0, 60],
    outputRange: [1,0]
  })

  return ( <View style={styles.container}>
      <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onGestureEvent}
      >
        <Animated.View style={[styles.betslip, {
          transform:
          [
            {
              translateY: _transY,
            }
          ]}]}>
          <View style={styles.scrollable} />
          <Animated.View style={[styles.wrapper,{opacity: keysOpacity}]}>
            <View style={styles.keys}>
              {numericKeys.map((btn, i) => {
                return (
                  <Pressable style={styles.numericKey} key={i}>
                    <Text style={styles.numericKeyText}>{btn}</Text>
                  </Pressable>
                )
              })}
            </View>
            <View style={styles.actions}>
              <View style={styles.quickStakes}>
              {quickStakes.map(item => {
                return (
                  <Pressable style={styles.quickStake} key={item.id}>
                    <Text style={styles.plusIcon}>+</Text>
                    <Text style={[styles.numericKeyText, {color: item.color}]}>{item.amount}</Text>
                  </Pressable>
                )
              })}
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
      <View style={[styles.minimisableContent]}>
        <Animated.View style={{opacity: opacity}}>
          <Pressable style={styles.cancelButton}>
            <Icon size={28} color={'#FFF'} name={'delete-forever'} />
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
        <Pressable style={styles.placeButton}>
          <Vector size={18} color={'#000'} name={'check'} />
          <Text style={styles.placeText}>Place</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  betslip: {
    height: KEYBOARD_HEIGHT,
    width: width,
    backgroundColor: '#181818',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  scrollable: {
    alignSelf: 'center',
    width: 24,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,.2)',
    marginTop: 5
  },
  keys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 16,
    paddingLeft: 16,
    width: NUMERIC_KEYS,
  },
  numericKey: {
    width: NUMERIC_KEY_SIZE,
    height: NUMERIC_KEY_SIZE,
    backgroundColor: 'rgba(255,255,255,.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: NUMERIC_KEY_SIZE / 2,
    marginRight: NUMERIC_KEYS_PADDING,
    marginBottom: 8
  },
  quickStakes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 16,
    marginLeft: NUMERIC_KEYS_PADDING,
    width: QUICK_STAKES
  },
  quickStake: {
    width: QUICK_STAKE_KEY_WIDTH,
    height: QUICK_STAKE_KEY_HEIGHT,
    backgroundColor: 'rgba(255,255,255,.1)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8
  },
  plusIcon: {
    marginRight: 1,
    color: 'white',
    opacity: .2
  },
  numericKeyText: {
    color: 'white'
  },
  wrapper: {
    flexDirection: 'row'
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  minimisableContent: {
    position: 'absolute',
    width: width,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: (NUMERIC_KEY_SIZE) - 5
  },
  cancelButton: {
    height: NUMERIC_KEY_SIZE,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 10,
    marginLeft: NUMERIC_KEY_SIZE / 2
  },
  cancelText: {
    color: 'white',
  },
  placeButton: {
    width: PLACE_BUTTON_WIDTH,
    height: NUMERIC_KEY_SIZE,
    backgroundColor: "#FFB80C",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  placeText: {
    color: 'black',
    marginLeft: 5
  },
})
