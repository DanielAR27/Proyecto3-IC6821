import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import FavoriteButton from "../../components/FavoriteButton";
import AddToCartButton from "../../components/AddToCartButton";
import { getToppingsByRestaurant } from "../../services/toppingService";

const ProductDetailScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { canAddToCart, restaurant: cartRestaurant } = useCart();
  const { product, restaurant } = route.params || {};

  // Estados
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [availableToppings, setAvailableToppings] = useState([]);
  const [selectedAddToppings, setSelectedAddToppings] = useState([]);
  const [selectedRemoveToppings, setSelectedRemoveToppings] = useState([]);
  const [specialNotes, setSpecialNotes] = useState("");
  const [showAddToppings, setShowAddToppings] = useState(false);
  const [showRemoveToppings, setShowRemoveToppings] = useState(false);

  // Ingredientes base reales del producto
  const baseIngredients = product?.base_ingredients || [];

  console.log("Product in ProductDetailScreen:", product);
  console.log("Base ingredients from product:", product?.base_ingredients);
  console.log("Processed baseIngredients:", baseIngredients);

  useEffect(() => {
    loadToppings();
  }, []);

  const loadToppings = async () => {
    try {
      setLoading(true);
      if (restaurant?._id) {
        const toppings = await getToppingsByRestaurant(restaurant._id, {
          is_available: true,
          compatible_with_product: product._id,
        });
        setAvailableToppings(toppings);
      }
    } catch (error) {
      console.error("Error loading toppings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₡${price?.toLocaleString("es-CR") || "0"}`;
  };

  const calculateTotalPrice = () => {
    let total = product.price * quantity;

    // Agregar precio de toppings adicionales
    selectedAddToppings.forEach((topping) => {
      total += topping.price * quantity;
    });

    return total;
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToppings = (topping) => {
    const isSelected = selectedAddToppings.find((t) => t._id === topping._id);

    if (isSelected) {
      // Remover topping
      setSelectedAddToppings((prev) =>
        prev.filter((t) => t._id !== topping._id)
      );
    } else {
      // Agregar topping
      setSelectedAddToppings((prev) => [...prev, topping]);
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    const isSelected = selectedRemoveToppings.includes(ingredient);

    if (isSelected) {
      setSelectedRemoveToppings((prev) =>
        prev.filter((ing) => ing !== ingredient)
      );
    } else {
      setSelectedRemoveToppings((prev) => [...prev, ingredient]);
    }
  };

  // Preparar los toppings para el carrito (convertir formato)
  const prepareToppingsForCart = () => {
    return selectedAddToppings.map((topping) => ({
      id: topping._id,
      name: topping.name,
      price: topping.price,
    }));
  };

  // Preparar las instrucciones especiales completas
  const prepareSpecialInstructions = () => {
    let instructions = [];

    // Agregar ingredientes a remover
    if (selectedRemoveToppings.length > 0) {
      instructions.push(`Sin: ${selectedRemoveToppings.join(", ")}`);
    }

    // Agregar notas especiales
    if (specialNotes.trim()) {
      instructions.push(specialNotes.trim());
    }

    return instructions.join(" | ");
  };

  // Preparar producto para el carrito
  const prepareProductForCart = () => {
    return {
      ...product,
      restaurant_id: restaurant?._id || product.restaurant_id,
      restaurant_name: restaurant?.name || product.restaurant_name,
    };
  };

  const handleAddToCartSuccess = () => {
    Alert.alert(
      "¡Agregado al carrito!",
      `${product.name} ha sido agregado a tu carrito.`,
      [
        { text: "Seguir comprando", style: "cancel" },
        { text: "Ver carrito", onPress: () => navigation.navigate("Cart") },
      ]
    );
  };

  // Verificar si se puede agregar al carrito
  const canAddProductToCart = () => {
    const productForCart = prepareProductForCart();
    return canAddToCart(productForCart);
  };

  // Mostrar advertencia si hay productos de otro restaurante
  const showRestaurantWarning = () => {
    if (!canAddProductToCart() && cartRestaurant) {
      return (
        <View
          style={[
            styles.warningContainer,
            { backgroundColor: "#FFF3CD", borderColor: "#FFEAA7" },
          ]}
        >
          <Ionicons name="warning-outline" size={20} color="#856404" />
          <Text style={[styles.warningText, { color: "#856404" }]}>
            Tienes productos de {cartRestaurant.name} en tu carrito. Al agregar
            este producto se vaciará el carrito actual.
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Personalizar producto
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image_url || "https://via.placeholder.com/300x200",
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {product.is_featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Destacado</Text>
            </View>
          )}
        </View>

        {/* Información básica */}
        <View style={[styles.infoSection, { backgroundColor: theme.surface }]}>
          <View style={styles.productTitleRow}>
            <Text style={[styles.productName, { color: theme.text }]}>
              {product.name}
            </Text>
            <FavoriteButton
              type="product"
              item={product}
              restaurant={restaurant}
              size="medium"
            />
          </View>
          <Text
            style={[styles.productDescription, { color: theme.textSecondary }]}
          >
            {product.description}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.productPrice, { color: theme.primary }]}>
              {formatPrice(product.price)}
            </Text>
            <View style={styles.prepTimeContainer}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.textSecondary}
              />
              <Text style={[styles.prepTime, { color: theme.textSecondary }]}>
                {product.preparation_time} min
              </Text>
            </View>
          </View>
        </View>

        {/* Advertencia de restaurante diferente */}
        {showRestaurantWarning()}

        {/* Ingredientes base */}
        {baseIngredients.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Ingredientes base
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
            >
              Este producto incluye:
            </Text>
            <View style={styles.ingredientsList}>
              {baseIngredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.success}
                  />
                  <Text style={[styles.ingredientText, { color: theme.text }]}>
                    {ingredient}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quitar ingredientes */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowRemoveToppings(!showRemoveToppings)}
          >
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                ¿Desea quitar ingredientes?
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                Selecciona los ingredientes que no quieres
              </Text>
            </View>
            <Ionicons
              name={showRemoveToppings ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {showRemoveToppings && (
            <View style={styles.optionsList}>
              {baseIngredients.length > 0 ? (
                baseIngredients.map((ingredient, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionItem,
                      { borderColor: theme.border },
                      selectedRemoveToppings.includes(ingredient) &&
                        styles.selectedOption,
                    ]}
                    onPress={() => handleRemoveIngredient(ingredient)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.text },
                        selectedRemoveToppings.includes(ingredient) && {
                          color: theme.primary,
                        },
                      ]}
                    >
                      {ingredient}
                    </Text>
                    {selectedRemoveToppings.includes(ingredient) && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text
                  style={[styles.noOptionsText, { color: theme.textSecondary }]}
                >
                  Este producto no tiene ingredientes base definidos
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Agregar ingredientes */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowAddToppings(!showAddToppings)}
          >
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                ¿Desea agregar ingredientes?
              </Text>
              <Text
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                Personaliza tu producto con extras
              </Text>
            </View>
            <Ionicons
              name={showAddToppings ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {showAddToppings && (
            <View style={styles.optionsList}>
              {availableToppings.map((topping) => (
                <TouchableOpacity
                  key={topping._id}
                  style={[
                    styles.optionItem,
                    { borderColor: theme.border },
                    selectedAddToppings.find((t) => t._id === topping._id) &&
                      styles.selectedOption,
                  ]}
                  onPress={() => handleAddToppings(topping)}
                >
                  <View style={styles.toppingInfo}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.text },
                        selectedAddToppings.find(
                          (t) => t._id === topping._id
                        ) && { color: theme.primary },
                      ]}
                    >
                      {topping.name}
                    </Text>
                    <Text
                      style={[
                        styles.toppingPrice,
                        { color: theme.textSecondary },
                      ]}
                    >
                      +{formatPrice(topping.price)}
                    </Text>
                  </View>
                  {selectedAddToppings.find((t) => t._id === topping._id) && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
              {availableToppings.length === 0 && (
                <Text
                  style={[styles.noOptionsText, { color: theme.textSecondary }]}
                >
                  No hay ingredientes adicionales disponibles
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Notas especiales */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notas especiales
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Alergias, preferencias o instrucciones especiales
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Ej: Sin cebolla, extra cocido, alergia a maní..."
            placeholderTextColor={theme.textSecondary}
            value={specialNotes}
            onChangeText={setSpecialNotes}
            multiline
            maxLength={200}
          />
          <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
            {specialNotes.length}/200
          </Text>
        </View>
      </ScrollView>

      {/* Footer con cantidad y botón de agregar al carrito */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.surface, borderTopColor: theme.border },
        ]}
      >
        <View style={styles.quantitySection}>
          <Text style={[styles.quantityLabel, { color: theme.text }]}>
            Cantidad
          </Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: theme.border }]}
              onPress={() => handleQuantityChange("decrease")}
              disabled={quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity <= 1 ? theme.textSecondary : theme.primary}
              />
            </TouchableOpacity>
            <Text style={[styles.quantityText, { color: theme.text }]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: theme.border }]}
              onPress={() => handleQuantityChange("increase")}
            >
              <Ionicons name="add" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usar el nuevo AddToCartButton */}
        <AddToCartButton
          product={prepareProductForCart()}
          quantity={quantity}
          toppings={prepareToppingsForCart()}
          specialInstructions={prepareSpecialInstructions()}
          onSuccess={handleAddToCartSuccess}
          style={styles.addToCartButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 250,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoSection: {
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
  },
  prepTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  prepTime: {
    fontSize: 14,
    marginLeft: 4,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  ingredientsList: {
    marginTop: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  ingredientText: {
    fontSize: 16,
    marginLeft: 8,
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderColor: "#3498db",
  },
  optionText: {
    fontSize: 16,
  },
  toppingInfo: {
    flex: 1,
  },
  toppingPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  noOptionsText: {
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    textAlign: "right",
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  addToCartButton: {},
});

export default ProductDetailScreen;
