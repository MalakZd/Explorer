import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import colors from '../theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onFilterPress }) => (
  <View style={styles.container}>
    <Feather name="search" size={20} color={colors.darkText} style={styles.iconLeft} />
    <TextInput
      style={styles.input}
      placeholder="Search places"
      placeholderTextColor={colors.darkText}
      value={value}
      onChangeText={onChangeText}
    />
    <TouchableOpacity onPress={onFilterPress} style={styles.iconRight}>
      <Ionicons name="filter" size={20} color={colors.darkText} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    marginVertical: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.darkText,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default SearchBar;
