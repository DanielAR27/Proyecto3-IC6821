import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Modal,
  Image,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

const OwnerSelectionModal = ({ 
  visible, 
  owners, 
  selectedOwner, 
  onSelectOwner, 
  onClose 
}) => {
  const { theme } = useTheme();

  const renderOwnerItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.ownerItem,
        selectedOwner?._id === item._id && styles.ownerItemSelected
      ]}
      onPress={() => {
        onSelectOwner(item);
        onClose();
      }}
    >
      <Image 
        source={{ uri: item.profile_image }} 
        style={styles.ownerAvatar}
      />
      <View style={styles.ownerInfo}>
        <Text style={[styles.ownerName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.ownerEmail, { color: theme.textSecondary }]}>{item.email}</Text>
      </View>
      {selectedOwner?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Seleccionar Propietario
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={owners}
            keyExtractor={(item) => item._id}
            renderItem={renderOwnerItem}
            style={styles.ownersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={50} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No hay propietarios disponibles
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  ownersList: {
    padding: 20,
  },
  ownerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  ownerItemSelected: {
    backgroundColor: theme.background,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  ownerEmail: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
});

export default OwnerSelectionModal;