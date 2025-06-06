import { View } from 'react-native'
import { Text, XStack } from 'tamagui'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
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
        <Text color="#fff" fontSize={32}>
          
        </Text>
      </View>
      <Text fontSize={28} fontWeight="700">
        {title}
      </Text>
    </XStack>
  )
}
