import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { MotiView } from 'moti';
import { ArrowRight, Mail, Lock, LogIn } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export const LoginScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Incomplete', 'Please fill in all fields.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Access Denied', 'Invalid credentials provided.');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Mesh Gradient Background */}
            <View style={styles.backgroundDecor}>
                <View style={[styles.blurCircle, { backgroundColor: '#818CF8', top: -100, left: -50, opacity: 0.4 }]} />
                <View style={[styles.blurCircle, { backgroundColor: '#34D399', bottom: -50, right: -100, opacity: 0.3 }]} />
                <View style={[styles.blurCircle, { backgroundColor: '#60A5FA', top: '30%', right: '20%', width: 250, height: 250, opacity: 0.25 }]} />
            </View>
            <View style={styles.frostOverlay} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            <MotiView
                                from={{ opacity: 0, translateY: 40 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                            >
                                <View style={styles.headerIcon}>
                                    <LogIn size={32} color={Colors.primary} />
                                </View>
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subtitle}>Resume your intellectual journey.</Text>
                            </MotiView>

                            <MotiView
                                from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 100 }}
                                style={styles.card}
                            >

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <Mail size={20} color={Colors.primary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="hello@example.com"
                                            placeholderTextColor={Colors.text.muted}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputWrapper}>
                                        <Lock size={20} color={Colors.primary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor={Colors.text.muted}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.9}
                                    style={styles.buttonContainer}
                                >
                                    <LinearGradient
                                        colors={['#6366F1', '#8B5CF6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color={Colors.white} />
                                        ) : (
                                            <>
                                                <Text style={styles.buttonText}>Sign In</Text>
                                                <ArrowRight size={20} color={Colors.white} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </MotiView>

                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 400, duration: 800 }}
                                style={styles.footer}
                            >
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.footerText}>
                                        New here? <Text style={styles.footerLink}>Create Account</Text>
                                    </Text>
                                </TouchableOpacity>
                            </MotiView>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    backgroundDecor: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blurCircle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        // @ts-ignore
        filter: 'blur(80px)',
    },
    frostOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.4)',
        // @ts-ignore
        backdropFilter: 'blur(30px)',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        alignSelf: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -1,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: Spacing.xl,
        lineHeight: 24,
        maxWidth: '80%',
        alignSelf: 'center',
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 32,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
        shadowColor: 'rgba(99, 102, 241, 0.2)',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        // @ts-ignore
        backdropFilter: 'blur(20px)',
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 56,
        paddingHorizontal: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    inputIcon: {
        marginRight: Spacing.sm,
        opacity: 0.8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
        fontWeight: '500',
        ...Platform.select({
            web: {
                outlineStyle: 'none',
            } as any,
        }),
    },
    buttonContainer: {
        marginTop: Spacing.sm,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    button: {
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        color: '#64748B',
        fontSize: 15,
    },
    footerLink: {
        color: '#6366F1',
        fontWeight: '700',
    },
});
