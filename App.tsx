import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface StockDataPoint {
  timestamp: string; // UNIX timestamp as string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockDataResponse {
  symbol: string;
  data: StockDataPoint[];
}

const API_URL = 'https://mock.apidog.com/m1/892843-874692-default/marketdata/history/AAPL';

const COLORS = {
  open: '#0A0A7C',
  high: '#E8618C', 
  low: '#22CCB2',
  close: '#7F55E0',
};

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function AppInternal() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['aapl-data'],
    queryFn: async (): Promise<StockDataPoint[]> => {
      const response = await fetch(API_URL);
      const json: StockDataResponse = await response.json();
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  // Prepare chart data
  const chartData = data?.map((d, index) => ({
    value: d.open,
    label: index % 20 === 0 ? new Date(Number(d.timestamp) * 1000).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }) : '',
  })) || [];

  const highData = data?.map(d => ({ value: d.high })) || [];
  const lowData = data?.map(d => ({ value: d.low })) || [];
  const closeData = data?.map(d => ({ value: d.close })) || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.appleIcon}>🍎</Text>
          </View>
          <Text style={styles.title}>AAPL Market Data</Text>
        </View>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {/* Legend */}
          <View style={styles.legend}>
            <LegendItem color={COLORS.open} label="Open" />
            <LegendItem color={COLORS.high} label="High" />
            <LegendItem color={COLORS.low} label="Low" />
            <LegendItem color={COLORS.close} label="Close" />
          </View>

          {/* Chart */}
          {data && (
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                data2={closeData}
                data3={lowData}
                data4={highData}
                color1={COLORS.open}
                color2={COLORS.close}
                color3={COLORS.low}
                color4={COLORS.high}
                height={300}
                width={320}
                curved
                hideDataPoints
                yAxisLabelPrefix="$"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInternal />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appleIcon: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  chartContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  chartWrapper: {
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
});
