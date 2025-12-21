import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';

interface CategoryPillProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.pill, active ? styles.active : styles.inactive]}
    onPress={onPress}
  >
    <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
  },
  active: {
    backgroundColor: colors.primary,
  },
  inactive: {
    backgroundColor: colors.lightGray,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textActive: {
    color: colors.white,
  },
  textInactive: {
    color: colors.darkText,
  },
});

export default CategoryPill;
