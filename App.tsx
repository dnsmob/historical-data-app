import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler'
import { LineChart } from 'react-native-gifted-charts'
import Animated, { useSharedValue } from 'react-native-reanimated'
import {
  Button,
  ScrollView,
  TamaguiProvider,
  Text,
  XStack,
  YStack,
} from 'tamagui'
import { CheckboxWithLabel } from './src/components/CheckboxWithLabel'
import { Header } from './src/components/Header'
import { LegendItem } from './src/components/LegendItem'
import config from './tamagui.config'

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

  const [zoomArray, setZoomArray] = useState<StockDataPoint[]>([])

  useEffect(() => {
    // console.log('data is stable')
    if (data && data.length > 0) {
      setZoomArray(data)
    }
  }, [data])

  // Reset zoom function
  const resetZoom = () => {
    scale.value = 1
    savedScale.value = 1
    setZoomArray(data ?? [])
  }

  // Create pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale
    })
    .onEnd(() => {
      if (scale.value < 1) {
        console.log('invalid')
        return
      }

      savedScale.value = scale.value

      const temp = data
        ?.map((entry, index) => {
          // skip every nth entry
          if (index % Math.round(scale.value) !== 0) {
            return null
          }

          return entry
        })
        .filter(Boolean) as StockDataPoint[]

      // console.log('🔍 ~ onEnd() callback ~ App.tsx:140 ~ temp:', temp.length)
      // crashing here 😱
      setTimeout(() => setZoomArray(temp))
    })

  const open = zoomArray?.map((d) => ({
    value: d.open,
    label: new Date(Number(d.timestamp) * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
    }),
  }))

  const close = zoomArray?.map((d) => ({ value: d.close }))
  const low = zoomArray?.map((d) => ({ value: d.low }))
  const high = zoomArray?.map((d) => ({ value: d.high }))

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
              <Animated.View>
                {zoomArray && (
                  <LineChart
                    data={open}
                    data2={close}
                    data3={low}
                    data4={high}
                    // very slow on large datasets
                    color1={showOpen ? COLORS.open : 'transparent'}
                    color2={showClose ? COLORS.close : 'transparent'}
                    color3={showLow ? COLORS.low : 'transparent'}
                    color4={showHigh ? COLORS.high : 'transparent'}
                    height={220}
                    yAxisLabelPrefix="$"
                    xAxisLabelTextStyle={{ fontSize: 10 }}
                    curved
                    hideDataPoints
                  />
                )}
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
