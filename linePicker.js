import React, { PureComponent } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  Text,
  FlatList
} from 'react-native'

const {width, height} = Dimensions.get('window');

const DATA = [
  1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
]

const itemWidth = width / 5

export default class Picker extends PureComponent {

  constructor() {
    super();

    this.state = {
      position: 0,
      activeItem: 0
    }
  }

  componentDidMount = () => {
    const length = DATA.length
    const startPos = (length / 2) * itemWidth

    this.setState({
      position: startPos,
    })
    setTimeout(() => {
      this.snapToItem(startPos, false)
    }, 100)
  }

  snapToItem = (position, animated) => {
    this.flatlistref.scrollToOffset({
       offset: position,
       animated: animated
    })
  }

  _renderLine = ({item, index}) => {
    const { current, position } = this.state
    const active = position > (itemWidth * (index - 1)) + 40 && position < (itemWidth * (index + 1)) - 40 ? true : false
    const offset = itemWidth * index

    console.log((itemWidth * (index - 1) + 40), (itemWidth * (index + 1)) - 40)

    return (
      <Pressable onPress={this.snapToItem.bind(this, offset, true)} style={{backgroundColor: active ? '#171717' : '#000', paddingVertical: 5, justifyContent: 'center', alignItems: 'center', width: itemWidth, height: 40}}>
        <Text style={{color: 'white'}}>{item}</Text>
      </Pressable>
    )
  }

  getItemLayout = (data, index) => (
    {
      length: itemWidth,
      offset: itemWidth * index,
      index
    }
  )

  onScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x

    this.setState({
      position: scrollPosition,
    })
  }

  render() {
    const { activeItem } = this.state

    const length = (DATA.length) * itemWidth
    const pickerWidth = length + (itemWidth * 4)

    return (  <View style={{flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', height: 40}}>
          <FlatList
            ref={ref => {this.flatlistref = ref}}
            data={DATA}
            renderItem={this._renderLine}
            firstItem={activeItem}
            horizontal={true}
            onScroll={e => this.onScroll(e)}
            snapToAlignment={'center'}
            snapToInterval={itemWidth}
            keyExtractor={(index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            decelerationRate={1}
            scrollEventThrottle={1}
            removeClippedSubviews={false}
            contentContainerStyle={{alignSelf: 'center', justifyContent: 'center', alignItems: 'center', height: 40, width: pickerWidth, marginRight: itemWidth * 2}}
          />
    </View>
    )
  }
}
