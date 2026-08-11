import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '@/stores/useStore';
import { theme } from '@/constants/theme';
import { safeBack } from '@/lib/utils/navigation';

interface PreferenceOption {
  label: string;
  value: string;
}

const PreferenceOptionRow = ({ option, selected, onPress }: { option: PreferenceOption; selected: boolean; onPress: () => void }) => (
  <TouchableOpacity style={styles.modalOption} onPress={onPress}>
    <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>
      {option.label}
    </Text>
    {selected && (
      <MaterialCommunityIcons name="check" size={20} color={theme.colors.teal} />
    )}
  </TouchableOpacity>
);

interface UnitModalProps {
  visible: boolean;
  title: string;
  options: PreferenceOption[];
  currentValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const UnitModal = ({ visible, title, options, currentValue, onSelect, onClose }: UnitModalProps) => (
  <Modal visible={visible} transparent animationType="slide">
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.modalCloseText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{title}</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        data={options}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <PreferenceOptionRow
            option={item}
            selected={currentValue === item.value}
            onPress={() => {
              onSelect(item.value);
              onClose();
            }}
          />
        )}
        style={styles.modalList}
      />
    </SafeAreaView>
  </Modal>
);

export default function PreferencesScreen() {
  const router = useRouter();
  const { userPreferences, setUserPreferences } = useStore();
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showTimeFormatModal, setShowTimeFormatModal] = useState(false);

  const weightUnits: PreferenceOption[] = [
    { label: 'Kilograms (kg)', value: 'kg' },
    { label: 'Pounds (lb)', value: 'lb' },
  ];

  const milkUnits: PreferenceOption[] = [
    { label: 'Milliliters (ml)', value: 'ml' },
    { label: 'Fluid Ounces (fl oz)', value: 'fl_oz' },
  ];

  const handleUnitChange = (key: string, value: string) => {
    setUserPreferences({ [key]: value as any });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => safeBack(router, '/settings')}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Preferences</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Units Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurement Units</Text>

          {/* Weight */}
          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => setShowUnitModal(true)}
          >
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="weight-kilogram" size={20} color={theme.colors.teal} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Weight</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Milk Volume */}
          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => setShowTimeFormatModal(true)}
          >
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="water" size={20} color={theme.colors.mint} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Milk Volume</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.milkUnit === 'ml' ? 'Milliliters (ml)' : 'Fluid Ounces (fl oz)'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Temperature */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="thermometer" size={20} color={theme.colors.peach} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Temperature</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Time & Format Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time & Format</Text>

          {/* Time Format */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={theme.colors.lavender} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Time Format</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.timeFormat === '12h' ? '12-hour (AM/PM)' : '24-hour'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {/* Week Start */}
          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.teal} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Week Starts On</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.startOfWeek === 'monday' ? 'Monday' : 'Sunday'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          {/* Theme */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons name="palette-outline" size={20} color={theme.colors.teal} />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceName}>Theme</Text>
                <Text style={styles.preferenceValue}>
                  {userPreferences.theme === 'system' ? 'System' : userPreferences.theme === 'light' ? 'Light' : 'Dark'}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <UnitModal
        visible={showUnitModal}
        title="Weight Unit"
        options={weightUnits}
        currentValue={userPreferences.weightUnit}
        onSelect={(value: string) => handleUnitChange('weightUnit', value)}
        onClose={() => setShowUnitModal(false)}
      />

      <UnitModal
        visible={showTimeFormatModal}
        title="Milk Volume Unit"
        options={milkUnits}
        currentValue={userPreferences.milkUnit}
        onSelect={(value: string) => handleUnitChange('milkUnit', value)}
        onClose={() => setShowTimeFormatModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.card,
    ...theme.shadows.small,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  preferenceValue: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  modalCloseText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  modalOptionTextSelected: {
    fontWeight: '600' as const,
    color: theme.colors.teal,
  },
});
