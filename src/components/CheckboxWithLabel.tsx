import { Check as CheckIcon } from '@tamagui/lucide-icons'
import { Checkbox, type CheckboxProps, Label, XStack } from 'tamagui'

export function CheckboxWithLabel({
  size,
  label = 'Accept terms and conditions',
  ...checkboxProps
}: CheckboxProps & { label?: string }) {
  const id = `checkbox-${(label || '').toString().slice(1)}`

  return (
    <XStack alignItems="center" gap="$4" bg="red">
      <Checkbox id={id} size={size} {...checkboxProps}>
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox>

      <Label size={size} htmlFor={id}>
        {label}
      </Label>
    </XStack>
  )
}
