import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/lib/constants';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 24,
  onRate,
  className = '',
}: StarRatingProps) {
  return (
    <View className={`flex-row gap-1 ${className}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starNumber = i + 1;
        const isFilled = starNumber <= rating;

        const star = (
          <Star
            key={starNumber}
            size={size}
            color={isFilled ? colors.lime[500] : colors.black[600]}
            fill={isFilled ? colors.lime[500] : 'transparent'}
          />
        );

        if (onRate) {
          return (
            <Pressable key={starNumber} onPress={() => onRate(starNumber)}>
              {star}
            </Pressable>
          );
        }

        return star;
      })}
    </View>
  );
}
