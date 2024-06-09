import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import type { MultiStepAuthProviderType } from "../../../../wallets/in-app/core/authentication/type.js";
import type { Wallet } from "../../../../wallets/interfaces/wallet.js";
import { parseTheme } from "../../../core/design-system/CustomThemeProvider.js";
import type { ConnectButtonProps } from "../../../core/hooks/connection/ConnectButtonProps.js";
import {
  useActiveWallet,
  useDisconnect,
} from "../../../core/hooks/wallets/wallet-hooks.js";
import { ThemedButton } from "../components/button.js";
import { ThemedText } from "../components/text.js";
import { ConnectModal } from "./ConnectModal.js";

export type ModalState =
  | { screen: "base" }
  | { screen: "otp"; auth: MultiStepAuthProviderType; wallet: Wallet<"inApp"> }
  | { screen: "external_wallets" };

export function ConnectButton(props: ConnectButtonProps) {
  const theme = parseTheme(props.theme);
  const [visible, setVisible] = useState(false);
  const wallet = useActiveWallet();

  const fadeAnim = useRef(new Animated.Value(0)).current; // For background opacity
  const slideAnim = useRef(new Animated.Value(screenHeight)).current; // For bottom sheet position

  const openModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0 - navBarHeight, // - statusBarHeight,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
    ]).start(() => {
      setVisible(false);
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
    });
  };

  useEffect(() => {
    if (visible) {
      openModal();
    } else {
      closeModal();
    }
  }, [visible, openModal, closeModal]);

  return wallet ? (
    <ConnectedButton onClose={closeModal} {...props} />
  ) : (
    <View>
      <ThemedButton theme={theme} onPress={() => setVisible(true)}>
        <ThemedText
          theme={theme}
          type="defaultSemiBold"
          style={{ color: theme.colors.primaryButtonText }}
        >
          Connect Wallet
        </ThemedText>
      </ThemedButton>
      <Modal
        visible={visible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
          <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]} />
          <Animated.View
            style={[{ flex: 1, transform: [{ translateY: slideAnim }] }]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <Pressable style={styles.dismissArea} onPress={closeModal} />
              <View style={styles.bottomSheetContainer}>
                <ConnectModal {...props} theme={theme} onClose={closeModal} />
              </View>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ConnectedButton(props: ConnectButtonProps & { onClose: () => void }) {
  const theme = parseTheme(props.theme);
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  return (
    wallet && (
      <ThemedButton
        theme={theme}
        onPress={() => {
          props.onClose();
          disconnect(wallet);
        }}
      >
        <ThemedText
          theme={theme}
          type="defaultSemiBold"
          style={{ color: theme.colors.primaryButtonText }}
        >
          Disconnect
        </ThemedText>
      </ThemedButton>
    )
  );
}

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const screenHeight = Dimensions.get("window").height;
const displayHeight = Dimensions.get("screen").height;
const navBarHeight = displayHeight - screenHeight - statusBarHeight;
const modalHeight = 480;
const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    width: screenWidth,
    height: screenHeight,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  dismissArea: {
    width: "100%",
    flex: 1,
  },
  bottomSheetContainer: {
    height: modalHeight,
    width: screenWidth,
    flexDirection: "column",
  },
});
