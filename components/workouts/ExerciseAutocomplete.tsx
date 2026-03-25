'use client'

import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { EXERCISES } from '@/lib/constants/exercises'
import { cn } from '@/lib/utils'

interface ExerciseAutocompleteProps {
  value: string
  onChange: (value: string) => void
}

export function ExerciseAutocomplete({ value, onChange }: ExerciseAutocompleteProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left"
        >
          <span className={cn('truncate', !value && 'text-muted-foreground')}>
            {value || 'Select exercise...'}
          </span>
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-[#111111] border-[#1a1a1a]" align="start">
        <Command>
          <CommandInput placeholder="Search exercises..." />
          <CommandList>
            <CommandEmpty>
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground mb-2">No match found</p>
                {value && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onChange(value)
                      setOpen(false)
                    }}
                  >
                    Use &quot;{value}&quot;
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {EXERCISES.map((exercise) => (
                <CommandItem
                  key={exercise}
                  value={exercise}
                  onSelect={(current) => {
                    onChange(current === value ? '' : current)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === exercise ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {exercise}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
