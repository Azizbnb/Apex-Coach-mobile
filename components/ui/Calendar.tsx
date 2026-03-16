import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/lib/constants';

interface CalendarProps {
  selectedDate?: Date;
  markedDates?: string[]; // ISO date strings (YYYY-MM-DD)
  onSelectDate?: (date: Date) => void;
  className?: string;
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Simple calendar component — Sprint 2+.
 * Will be enhanced with workout tracking markers.
 */
export function Calendar({
  selectedDate = new Date(),
  markedDates = [],
  onSelectDate,
  className = '',
}: CalendarProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1);
  // Monday-based: 0=Mon, 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = selectedDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const markedSet = new Set(markedDates);

  return (
    <View className={`bg-apex-black-800 rounded-xl p-4 border border-apex-black-700 ${className}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={() => onSelectDate?.(new Date(year, month - 1, 1))}
          className="p-2"
        >
          <ChevronLeft size={20} color={colors.black[400]} />
        </Pressable>
        <Text className="text-white font-semibold capitalize">{monthName}</Text>
        <Pressable
          onPress={() => onSelectDate?.(new Date(year, month + 1, 1))}
          className="p-2"
        >
          <ChevronRight size={20} color={colors.black[400]} />
        </Pressable>
      </View>

      {/* Day labels */}
      <View className="flex-row mb-2">
        {DAYS.map((day) => (
          <View key={day} className="flex-1 items-center">
            <Text className="text-apex-black-400 text-xs">{day}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {Array.from({ length: startOffset }, (_, i) => (
          <View key={`empty-${i}`} className="w-[14.28%] h-10" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const dayNum = i + 1;
          const date = new Date(year, month, dayNum);
          const iso = toISODate(date);
          const isSelected = toISODate(selectedDate) === iso;
          const isMarked = markedSet.has(iso);

          return (
            <Pressable
              key={dayNum}
              onPress={() => onSelectDate?.(date)}
              className={`w-[14.28%] h-10 items-center justify-center rounded-lg ${
                isSelected ? 'bg-apex-lime-500' : ''
              }`}
            >
              <Text
                className={`text-sm ${
                  isSelected ? 'text-apex-black-900 font-bold' : 'text-white'
                }`}
              >
                {dayNum}
              </Text>
              {isMarked && !isSelected && (
                <View className="w-1 h-1 rounded-full bg-apex-lime-500 mt-0.5" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
