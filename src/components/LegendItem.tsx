import { View } from 'react-native'
import { Text, XStack } from 'tamagui'

interface LegendItemProps {
  color: string
  label: string
}

export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <XStack alignItems="center">
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 16,
          backgroundColor: color,
          marginRight: 4
        }}
      />
      <Text>{label}</Text>
    </XStack>
  )
}