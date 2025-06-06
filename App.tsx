import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import {
  Button,
  ScrollView,
  TamaguiProvider,
  Text,
  View,
  XStack,
  YStack,
} from 'tamagui'
import { CheckboxWithLabel } from './src/components/CheckboxWithLabel'
import { Header } from './src/components/Header'
import { LegendItem } from './src/components/LegendItem'
import config from './tamagui.config'
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

// const config = createTamagui(baseConfig)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

interface StockDataPoint {
  timestamp: string // UNIX timestamp as string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockDataResponse {
  symbol: string
  data: StockDataPoint[]
}

const API_URL =
  'https://mock.apidog.com/m1/892843-874692-default/marketdata/history/AAPL'

const COLORS = {
  open: '#0A0A7C',
  high: '#E8618C',
  low: '#22CCB2',
  close: '#7F55E0',
}

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <StatusBar style="auto" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* queryClient must be ready before use */}
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <AppInternal />
          </GestureHandlerRootView>
        </QueryClientProvider>
      </SafeAreaView>
    </TamaguiProvider>
  )
}

const AppInternal = () => {
  const [showOpen, toggleShowOpen] = useState(true)
  const [showClose, toggleShowClose] = useState(true)
  const [showLow, toggleShowLow] = useState(true)
  const [showHigh, toggleShowHigh] = useState(true)

  // Add shared values for pinch gesture
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['aapl-data'],
    queryFn: async () => {
      const res = await fetch(API_URL)
      const json = await res.json()
      return json.data as StockDataPoint[]
    },
  })

  // Reset zoom function
  const resetZoom = () => {
    scale.value = 1
    savedScale.value = 1
  }

  // Create pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale
    })
    .onEnd(() => {
      savedScale.value = scale.value
    })

  // Create animated style for scaling
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const open = data?.map((d) => ({
    value: d.open,
    label: new Date(Number(d.timestamp) * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  }))

  const close = data?.map((d) => ({ value: d.close }))
  const low = data?.map((d) => ({ value: d.low }))
  const high = data?.map((d) => ({ value: d.high }))

  return (
    <ScrollView>
      <YStack f={1} p="$4" bg="#f5f5f7">
        <Header title="AAPL Market Data" />
        <YStack bg="#e5e7eb" br={16} p="$3">
          <XStack jc={'space-between'}>
            <LegendItem color={COLORS.open} label="Open" />
            <LegendItem color={COLORS.high} label="High" />
            <LegendItem color={COLORS.low} label="Low" />
            <LegendItem color={COLORS.close} label="Close" />
          </XStack>
          {data && (
            <GestureDetector gesture={pinchGesture}>
              <Animated.View style={animatedStyle}>
                <LineChart
                  data={open}
                  data2={close}
                  data3={low}
                  data4={high}
                  color1={showOpen ? COLORS.open : 'transparent'}
                  color2={showClose ? COLORS.close : 'transparent'}
                  color3={showLow ? COLORS.low : 'transparent'}
                  color4={showHigh ? COLORS.high : 'transparent'}
                  height={220}
                  yAxisLabelPrefix="$"
                  curved
                />
              </Animated.View>
            </GestureDetector>
          )}
        </YStack>
        <YStack mt="$4">
          <Text fontWeight="700" mb="$2">
            Display
          </Text>
          <YStack gap="$2">
            <CheckboxWithLabel
              checked={showOpen}
              onCheckedChange={() => toggleShowOpen(!showOpen)}
              label="Open"
            />
            <CheckboxWithLabel
              checked={showClose}
              onCheckedChange={() => toggleShowClose(!showClose)}
              label="Close"
            />
            <CheckboxWithLabel
              checked={showLow}
              onCheckedChange={() => toggleShowLow(!showLow)}
              label="Low"
            />
            <CheckboxWithLabel
              checked={showHigh}
              onCheckedChange={() => toggleShowHigh(!showHigh)}
              label="High"
            />
          </YStack>
        </YStack>
        <Button
          mt="$4"
          bg="#888"
          color="#fff"
          onPress={resetZoom}
          disabled={isFetching}
          br={16}
          px={24}
          py={12}
        >
          Reset Zoom
        </Button>
      </YStack>
    </ScrollView>
  )
}
