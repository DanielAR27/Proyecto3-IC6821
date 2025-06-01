import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const PaymentMethodsScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const { theme } = useTheme();
  const [balance, setBalance] = useState(0);
  const [cards, setCards] = useState([]);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });

  const styles = createStyles(theme);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Cargar balance
      const savedBalance = await AsyncStorage.getItem(`@balance_${user._id}`);
      if (savedBalance) {
        setBalance(parseFloat(savedBalance));
      }
      
      // Cargar tarjetas
      const savedCards = await AsyncStorage.getItem(`@cards_${user._id}`);
      if (savedCards) {
        setCards(JSON.parse(savedCards));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    }
  };

  const saveBalance = async (newBalance) => {
    try {
      await AsyncStorage.setItem(`@balance_${user._id}`, newBalance.toString());
      setBalance(newBalance);
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  };

  const saveCards = async (cardList) => {
    try {
      await AsyncStorage.setItem(`@cards_${user._id}`, JSON.stringify(cardList));
      setCards(cardList);
    } catch (error) {
      console.error('Error saving cards:', error);
    }
  };

  const handleAddMoney = async () => {
    const addAmount = parseFloat(amount);
    
    if (isNaN(addAmount) || addAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }
    
    if (addAmount > 100000) {
      Alert.alert('Error', 'El monto máximo a recargar es ₡100,000');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simular proceso de pago
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newBalance = balance + addAmount;
      await saveBalance(newBalance);
      
      setShowAddMoneyModal(false);
      setAmount('');
      
      Alert.alert('¡Éxito!', `Se han agregado ₡${addAmount.toLocaleString()} a tu billetera`);
    } catch (error) {
      console.error('Error adding money:', error);
      Alert.alert('Error', 'No se pudo completar la recarga');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text) => {
    // Remover espacios y caracteres no numéricos
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Agregar espacios cada 4 dígitos
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      formattedValue = value.replace(/[^0-9]/g, '');
      if (field === 'expiryMonth' && parseInt(formattedValue) > 12) return;
      if (formattedValue.length > 2) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length > 4) return;
    }
    
    setCardForm(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateCard = () => {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = cardForm;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Número de tarjeta inválido');
      return false;
    }
    
    if (!cardHolder.trim()) {
      Alert.alert('Error', 'Nombre del titular es requerido');
      return false;
    }
    
    if (!expiryMonth || !expiryYear || parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      Alert.alert('Error', 'Fecha de vencimiento inválida');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'CVV inválido');
      return false;
    }
    
    return true;
  };

  const handleAddCard = async () => {
    if (!validateCard()) return;
    
    try {
      setLoading(true);
      
      // Simular validación de tarjeta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCard = {
        id: Date.now().toString(),
        last4: cardForm.cardNumber.slice(-4),
        brand: detectCardBrand(cardForm.cardNumber),
        holder: cardForm.cardHolder,
        expiry: `${cardForm.expiryMonth}/${cardForm.expiryYear}`,
        isDefault: cards.length === 0 || cardForm.isDefault
      };
      
      let updatedCards = [...cards, newCard];
      
      // Si esta tarjeta es default, desmarcar las demás
      if (newCard.isDefault) {
        updatedCards = updatedCards.map(card => ({
          ...card,
          isDefault: card.id === newCard.id
        }));
      }
      
      await saveCards(updatedCards);
      
      setShowAddCardModal(false);
      setCardForm({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        isDefault: false
      });
      
      Alert.alert('¡Éxito!', 'Tarjeta agregada correctamente');
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'No se pudo agregar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  const detectCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return 'Tarjeta';
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'Eliminar Tarjeta',
      '¿Estás seguro de que quieres eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const updatedCards = cards.filter(card => card.id !== cardId);
            
            // Si se elimina la tarjeta default y quedan más, hacer la primera default
            if (updatedCards.length > 0 && !updatedCards.some(card => card.isDefault)) {
              updatedCards[0].isDefault = true;
            }
            
            await saveCards(updatedCards);
          }
        }
      ]
    );
  };

  const handleSetDefaultCard = async (cardId) => {
    const updatedCards = cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    }));
    
    await saveCards(updatedCards);
  };

  const getCardIcon = (brand) => {
    switch (brand) {
      case 'Visa':
        return 'card';
      case 'Mastercard':
        return 'card';
      case 'Amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Métodos de Pago</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Billetera Virtual */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <Ionicons name="wallet" size={32} color={theme.primary} />
            <Text style={styles.walletTitle}>Mi Billetera</Text>
          </View>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>₡{balance.toLocaleString()}</Text>
          <TouchableOpacity 
            style={styles.addMoneyButton}
            onPress={() => setShowAddMoneyModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.addMoneyText}>Recargar Saldo</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjetas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarjetas Guardadas</Text>
            <TouchableOpacity onPress={() => setShowAddCardModal(true)}>
              <Ionicons name="add-circle" size={28} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {cards.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="card-outline" size={48} color={theme.textSecondary} />
              <Text style={styles.emptyText}>No tienes tarjetas guardadas</Text>
              <TouchableOpacity 
                style={styles.addCardButton}
                onPress={() => setShowAddCardModal(true)}
              >
                <Text style={styles.addCardButtonText}>Agregar Tarjeta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardInfo}>
                  <Ionicons name={getCardIcon(card.brand)} size={32} color={theme.text} />
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardBrand}>{card.brand} •••• {card.last4}</Text>
                    <Text style={styles.cardExpiry}>Vence {card.expiry}</Text>
                    {card.isDefault && (
                      <Text style={styles.defaultCardText}>Tarjeta principal</Text>
                    )}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!card.isDefault && (
                    <TouchableOpacity 
                      onPress={() => handleSetDefaultCard(card.id)}
                      style={styles.cardActionButton}
                    >
                      <Ionicons name="star-outline" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => handleDeleteCard(card.id)}
                    style={styles.cardActionButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Recargar Saldo */}
      <Modal
        visible={showAddMoneyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddMoneyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Recargar Billetera</Text>
            
            <Text style={styles.modalLabel}>Monto a recargar (₡)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.quickAmounts}>
              {[5000, 10000, 20000, 50000].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>
                    ₡{quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddMoneyModal(false);
                  setAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleAddMoney}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Procesando...' : 'Recargar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Agregar Tarjeta */}
      <Modal
        visible={showAddCardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número de tarjeta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={theme.textSecondary}
                  value={cardForm.cardNumber}
                  onChangeText={(value) => handleCardInputChange('cardNumber', value)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Titular de la tarjeta</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre como aparece en la tarjeta"
                  placeholderTextColor={theme.textSecondary}
                  value={cardForm.cardHolder}
                  onChangeText={(value) => handleCardInputChange('cardHolder', value)}
                  autoCapitalize="characters"
                />
              </View>
              
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Mes</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor={theme.textSecondary}
                    value={cardForm.expiryMonth}
                    onChangeText={(value) => handleCardInputChange('expiryMonth', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 5 }]}>
                  <Text style={styles.label}>Año</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="AA"
                    placeholderTextColor={theme.textSecondary}
                    value={cardForm.expiryYear}
                    onChangeText={(value) => handleCardInputChange('expiryYear', value)}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor={theme.textSecondary}
                    value={cardForm.cvv}
                    onChangeText={(value) => handleCardInputChange('cvv', value)}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.defaultCheckbox}
                onPress={() => handleCardInputChange('isDefault', !cardForm.isDefault)}
              >
                <Ionicons 
                  name={cardForm.isDefault ? 'checkbox' : 'square-outline'} 
                  size={24} 
                  color={theme.primary} 
                />
                <Text style={styles.checkboxText}>Establecer como tarjeta principal</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleAddCard}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Agregando...' : 'Agregar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Billetera
  walletCard: {
    backgroundColor: theme.primary,
    borderRadius: 16,
    padding: 25,
    marginBottom: 30,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addMoneyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Tarjetas
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  emptyCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 10,
    marginBottom: 20,
  },
  addCardButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  addCardButtonText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardItem: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginLeft: 15,
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  cardExpiry: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  defaultCardText: {
    fontSize: 12,
    color: theme.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
  },
  cardActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  
  // Modales
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 10,
  },
  amountInput: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAmountButton: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  quickAmountText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  defaultCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: theme.text,
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.primary,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  });
export default PaymentMethodsScreen;