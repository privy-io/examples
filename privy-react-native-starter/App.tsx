import React from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {PrivyProvider, usePrivy, createPrivyClient, useLoginWithOAuth} from '@privy-io/expo';
import {PrivyElements, useLogin} from '@privy-io/expo/ui';

const PRIVY_APP_ID = '<your-app-id>';
const PRIVY_CLIENT_ID = '<your-client-id>';

const privyClient = createPrivyClient({
  appId: PRIVY_APP_ID,
  clientId: PRIVY_CLIENT_ID,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
});

const LoginScreen = () => {
  const {login} = useLogin();
  const {login: loginWithOAuth, state} = useLoginWithOAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privy React Native Starter</Text>
      <Text style={styles.sub}>
        Configure your Privy app ID and client ID in App.tsx to enable login.
      </Text>
      <Button
        title="Continue with Email"
        onPress={() => login({loginMethods: ['email']})}
      />
      <Button
        title="Continue with SMS"
        onPress={() => login({loginMethods: ['sms']})}
      />
      <View style={styles.divider} />
      <Button
        title="Continue with Google"
        disabled={state.status === 'loading'}
        onPress={() => loginWithOAuth({provider: 'google'})}
      />
    </View>
  );
};

const UserScreen = () => {
  const {user, logout} = usePrivy();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signed in</Text>
      <Text style={styles.sub}>{user?.id}</Text>
      <Button title="Log out" onPress={logout} />
    </View>
  );
};

const Home = () => {
  const {isReady, user} = usePrivy();

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.sub}>Loading...</Text>
      </View>
    );
  }

  return user ? <UserScreen /> : <LoginScreen />;
};

const App = () => (
  <SafeAreaView style={styles.container}>
    <PrivyProvider appId={PRIVY_APP_ID} clientId={PRIVY_CLIENT_ID} client={privyClient}>
      <Home />
      <PrivyElements />
    </PrivyProvider>
  </SafeAreaView>
);

export default App;
