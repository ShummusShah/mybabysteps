import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

interface QuickLogRowProps {
  onFeed: () => void;
  onSleep: () => void;
  onNappy: () => void;
  onMore: () => void;
}

interface QuickLogButton {
  label: string;
  letter: string;
  icon: string;
  backgroundColor: string;
  accentColor: string;
  onPress: () => void;
}

export function QuickLogRow({ onFeed, onSleep, onNappy, onMore }: QuickLogRowProps) {
  const buttons: QuickLogButton[] = [
    {
      label: 'Feed',
      letter: 'F',
      icon: 'bottle-soda',
      backgroundColor: '#DDF7F3',
      accentColor: '#21B6AD',
      onPress: onFeed,
    },
    {
      label: 'Sleep',
      letter: 'S',
      icon: 'sleep',
      backgroundColor: '#EEE8FF',
      accentColor: '#8A73D6',
      onPress: onSleep,
    },
    {
      label: 'Nappy',
      letter: 'N',
      icon: 'water',
      backgroundColor: '#FFF0E8',
      accentColor: '#FF8B5C',
      onPress: onNappy,
    },
    {
      label: 'More',
      letter: 'M',
      icon: 'plus',
      backgroundColor: 'white',
      accentColor: '#77808F',
      onPress: onMore,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Log</Text>
      <View style={styles.row}>
        {buttons.map((button) => (
          <TouchableOpacity
            key={button.label}
            style={[
              styles.button,
              { backgroundColor: button.backgroundColor },
              button.label === 'More' && styles.moreButton,
            ]}
            onPress={button.onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonLetter, { color: button.accentColor }]}>
              {button.letter}
            </Text>
            <Text style={[styles.buttonLabel, { color: button.accentColor }]}>
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 62,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  moreButton: {
    borderWidth: 1,
    borderColor: '#E9EDF2',
  },
  buttonLetter: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  buttonLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
