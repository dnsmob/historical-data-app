import {
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
	Button,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from "react-native-gesture-handler";
import { GraphPoint, LineGraph } from "react-native-graph";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

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

const API_URL =
	"https://mock.apidog.com/m1/892843-874692-default/marketdata/history/AAPL";

const COLORS = {
	open: "#0A0A7C",
	high: "#E8618C",
	low: "#22CCB2",
	close: "#7F55E0",
};

function LegendItem({ color, label }: { color: string; label: string }) {
	return (
		<View style={styles.legendItem}>
			<View style={[styles.legendDot, { backgroundColor: color }]} />
			<Text style={styles.legendText}>{label}</Text>
		</View>
	);
}

const AppInternal = () => {
	// data loading
	const {
		data = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["aapl-data"],
		queryFn: async (): Promise<StockDataPoint[]> => {
			const response = await fetch(API_URL);
			const json: StockDataResponse = await response.json();
			return json.data;
		},
	});

	const [showOpen, setShowOpen] = useState(true);
	const [showClose, setShowClose] = useState(true);
	const [showHigh, setShowHigh] = useState(true);
	const [showLow, setShowLow] = useState(true);

	const scale = useSharedValue(1);
	const [savedScale, setSavedScale] = useState(1);

	const slicedData = useMemo(() => {
		return data.reduce<StockDataPoint[]>((acc, item, index) => {
			if (index % Math.ceil(savedScale) === 0) {
				acc.push(item);
			}
			return acc;
		}, []);
	}, [data, savedScale]);

	const yAxisValues = useMemo(() => {
		const { min, max } = slicedData.reduce(
			(acc, d) => {
				const values = [d.open, d.close, d.low, d.high];
				const localMin = Math.min(...values);
				const localMax = Math.max(...values);
				return {
					min: Math.min(acc.min, localMin),
					max: Math.max(acc.max, localMax),
				};
			},
			{ min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
		);

		// Guard against empty or flat data
		if (
			min === Number.POSITIVE_INFINITY ||
			max === Number.NEGATIVE_INFINITY ||
			min === max
		) {
			return [0, 1, 2, 3, 4]; // fallback values
		}

		const step = (max - min) / 4;

		return [
			Number.parseFloat(max.toFixed(2)),
			Number.parseFloat((min + step * 3).toFixed(2)),
			Number.parseFloat((min + step * 2).toFixed(2)),
			Number.parseFloat((min + step).toFixed(2)),
			Number.parseFloat(min.toFixed(2)),
		];
	}, [slicedData]);

	const openData = useMemo(
		() =>
			slicedData.map((d) => ({
				value: d.open,
				date: new Date(Number(d.timestamp) * 1000),
			})),
		[slicedData],
	);

	const closeData = useMemo(
		() =>
			slicedData.map((d) => ({
				value: d.close,
				date: new Date(Number(d.timestamp) * 1000),
			})),
		[slicedData],
	);

	const lowData = useMemo(
		() =>
			slicedData.map((d) => ({
				value: d.low,
				date: new Date(Number(d.timestamp) * 1000),
			})),
		[slicedData],
	);

	const highData = useMemo(
		() =>
			slicedData.map((d) => ({
				value: d.high,
				date: new Date(Number(d.timestamp) * 1000),
			})),
		[slicedData],
	);

	const pinchGesture = Gesture.Pinch()
		.onUpdate((event) => {
			scale.value = savedScale * event.scale;
		})
		.onEnd(() => {
			setSavedScale(scale.value);
		})
		.runOnJS(true);

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

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={styles.container}>
				<ScrollView style={styles.scrollView}>
					{/* Header */}
					<View style={styles.header}>
						<View style={styles.iconContainer}>
							<Text style={styles.appleIcon}>🍎</Text>
						</View>
						<Text style={styles.title}>AAPL Market Data</Text>
					</View>

					<GestureDetector gesture={pinchGesture}>
						<Animated.View style={[styles.chartContainer]}>
							{/* Legend */}
							<View style={styles.legend}>
								<LegendItem color={COLORS.open} label="Open" />
								<LegendItem color={COLORS.high} label="High" />
								<LegendItem color={COLORS.low} label="Low" />
								<LegendItem color={COLORS.close} label="Close" />
							</View>

							<View style={{ flexDirection: "row" }}>
								<View
									style={{
										width: 70,
										flexDirection: "column",
										justifyContent: "space-between",
										alignItems: "flex-end",
										borderRightWidth: 1,
										paddingRight: 10,
									}}
								>
									{yAxisValues.map((value) => (
										<Text key={value}>{`$${value}`}</Text>
									))}
								</View>
								<View style={{ flex: 1, height: 300 }}>
									{showOpen && (
										<LineGraph
											points={openData}
											color={COLORS.open}
											animated={false}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
											}}
										/>
									)}
									{showClose && (
										<LineGraph
											points={closeData}
											color={COLORS.close}
											animated={false}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
											}}
										/>
									)}
									{showHigh && (
										<LineGraph
											points={highData}
											color={COLORS.high}
											animated={false}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
											}}
										/>
									)}
									{showLow && (
										<LineGraph
											points={lowData}
											color={COLORS.low}
											animated={false}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
											}}
										/>
									)}
								</View>
							</View>
						</Animated.View>
					</GestureDetector>
					<View style={styles.checkboxGroup}>
						<CheckboxWithLabel
							label="Show Open"
							isChecked={showOpen}
							onToggle={() => setShowOpen(!showOpen)}
							color={COLORS.open}
						/>
						<CheckboxWithLabel
							label="Show High"
							isChecked={showHigh}
							onToggle={() => setShowHigh(!showHigh)}
							color={COLORS.high}
						/>
						<CheckboxWithLabel
							label="Show Low"
							isChecked={showLow}
							onToggle={() => setShowLow(!showLow)}
							color={COLORS.low}
						/>
						<CheckboxWithLabel
							label="Show Close"
							isChecked={showClose}
							onToggle={() => setShowClose(!showClose)}
							color={COLORS.close}
						/>
					</View>
					<TouchableOpacity
						style={styles.resetButton}
						onPress={() => {
							setSavedScale(1);
						}}
					>
						<Text style={styles.resetButtonText}>Reset Zoom</Text>
					</TouchableOpacity>
				</ScrollView>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

function CheckboxWithLabel({
	label,
	isChecked,
	onToggle,
	color,
}: { label: string; isChecked: boolean; onToggle: () => void; color: string }) {
	return (
		<TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
			<View style={[styles.checkbox, isChecked && { backgroundColor: color }]}>
				{isChecked && <Text style={styles.checkmark}>✓</Text>}
			</View>
			<Text style={styles.label}>{label}</Text>
		</TouchableOpacity>
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
	checkboxGroup: {
		// flexDirection: 'row',
		// flexWrap: 'wrap',
		// justifyContent: 'space-around',
		marginTop: 20,
	},
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: "#555",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	checkmark: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	label: {
		fontSize: 16,
	},

	container: {
		flex: 1,
		backgroundColor: "#f5f5f7",
	},
	scrollView: {
		flex: 1,
		padding: 16,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		paddingVertical: 10,
	},
	iconContainer: {
		width: 50,
		height: 50,
		backgroundColor: "#000",
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	appleIcon: {
		fontSize: 24,
		color: "#fff",
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: "#000",
	},
	chartContainer: {
		backgroundColor: "#E5E7EB",
		borderRadius: 16,
		padding: 16,
	},
	legend: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	legendDot: {
		width: 12,
		height: 12,
		borderRadius: 6,
		marginRight: 6,
	},
	legendText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#000",
	},
	chartWrapper: {
		alignItems: "center",
		backgroundColor: "#E5E7EB",
	},
	resetButton: {
		backgroundColor: "#888",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		alignSelf: "center",
		marginTop: 20,
	},
	resetButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
