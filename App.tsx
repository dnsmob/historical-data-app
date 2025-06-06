import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import {
  Button,
  ScrollView,
  TamaguiProvider,
  Text,
  XStack,
  YStack,
} from 'tamagui'
import { CheckboxWithLabel } from './src/components/CheckboxWithLabel'
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
  open: '#00008B',
  close: '#7B68EE',
  low: '#20B2AA',
  high: '#FF69B4',
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInternal />
    </QueryClientProvider>
  )
}

const AppInternal = () => {
  const [visibleLines, setVisibleLines] = useState({
    open: true,
    close: true,
    low: false,
    high: false,
  })

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['aapl-data'],
    queryFn: async () => {
      const res = await fetch(API_URL)
      const json = await res.json()
      return json.data as StockDataPoint[]
    },
  })

  const handleToggle = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Prepare chart data
  const chartLines = [
    visibleLines.open && {
      data: data?.map((d: any) => ({
        value: d.open,
        label: new Date(Number(d.timestamp) * 1000).toLocaleDateString(),
      })),
      color: COLORS.open,
      label: 'Open',
    },
    visibleLines.close && {
      data: data?.map((d: any) => ({
        value: d.close,
        label: new Date(Number(d.timestamp) * 1000).toLocaleDateString(),
      })),
      color: COLORS.close,
      label: 'Close',
    },
    visibleLines.low && {
      data: data?.map((d: any) => ({
        value: d.low,
        label: new Date(Number(d.timestamp) * 1000).toLocaleDateString(),
      })),
      color: COLORS.low,
      label: 'Low',
    },
    visibleLines.high && {
      data: data?.map((d: any) => ({
        value: d.high,
        label: new Date(Number(d.timestamp) * 1000).toLocaleDateString(),
      })),
      color: COLORS.high,
      label: 'High',
    },
  ].filter(Boolean)

  return (
    <TamaguiProvider config={config}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <YStack f={1} p="$4" bg="#f5f5f7">
            <XStack ai="center" mb="$4">
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: '#000',
                  borderRadius: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}
              >
                {/* Replace with Image if you want the Apple logo */}
                <Text color="#fff" fontSize={32}>
                  
                </Text>
              </View>
              <Text fontSize={28} fontWeight="700">
                AAPL Market Data
              </Text>
            </XStack>
            <YStack bg="#e5e7eb" br={16} p="$3">
              {data && (
                <LineChart
                  data={chartLines.map((line) => line.data)}
                  color={chartLines.map((line) => line.color)}
                  thickness={3}
                  hideDataPoints
                  yAxisLabelPrefix="$"
                  xAxisLabelTextStyle={{ fontSize: 10 }}
                  yAxisTextStyle={{ fontSize: 10 }}
                  showLegend
                  legendLabels={chartLines.map((line) => line.label)}
                  height={220}
                  noOfSections={5}
                  isAnimated
                />
              )}
            </YStack>
            <YStack mt="$4">
              <Text fontWeight="700" mb="$2">
                Display
              </Text>
              <YStack gap="$2">
                <CheckboxWithLabel
                  checked={visibleLines.open}
                  onCheckedChange={() => handleToggle('open')}
                  label="Open"
                />
                <CheckboxWithLabel
                  checked={visibleLines.close}
                  onCheckedChange={() => handleToggle('close')}
                  label="Close"
                />
                <CheckboxWithLabel
                  checked={visibleLines.low}
                  onCheckedChange={() => handleToggle('low')}
                  label="Low"
                />
                <CheckboxWithLabel
                  checked={visibleLines.high}
                  onCheckedChange={() => handleToggle('high')}
                  label="High"
                />
              </YStack>
            </YStack>
            <Button
              mt="$4"
              bg="#888"
              color="#fff"
              onPress={() => refetch()}
              disabled={isFetching}
              br={16}
              px={24}
              py={12}
            >
              Reset Zoom
            </Button>
            <StatusBar style="auto" />
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </TamaguiProvider>
  )
}
