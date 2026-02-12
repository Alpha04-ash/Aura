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
import { Colors, Spacing, Typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { MotiView, MotiText } from 'moti';
import { ArrowRight, Mail, Lock, User, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export const RegisterScreen = ({ navigation }: any) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !name) {
            Alert.alert('Incomplete', 'Please fill in all fields to begin.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsLoading(true);
        try {
            await register(name, email, password);
        } catch (error: any) {
            Alert.alert('Registration Failed', error.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Mesh Gradient Background */}
            <View style={styles.backgroundDecor}>
                <View style={[styles.blurCircle, { backgroundColor: '#818CF8', top: -100, right: -100, opacity: 0.4 }]} />
                <View style={[styles.blurCircle, { backgroundColor: '#C084FC', bottom: -100, left: -100, opacity: 0.4 }]} />
                <View style={[styles.blurCircle, { backgroundColor: '#F472B6', top: '40%', left: '30%', width: 200, height: 200, opacity: 0.2 }]} />
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
                                    <Sparkles size={32} color={Colors.primary} fill={Colors.gray[100]} />
                                </View>
                                <Text style={styles.title}>Join Shipyard</Text>
                                <Text style={styles.subtitle}>Unlock your full potential with AI-driven clarity.</Text>
                            </MotiView>

                            <MotiView
                                from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 100 }}
                                style={styles.card}
                            >
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <View style={styles.inputWrapper}>
                                        <User size={20} color={Colors.primary} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. Marcus Aurelius"
                                            placeholderTextColor={Colors.text.muted}
                                            value={name}
                                            onChangeText={setName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

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
                                    onPress={handleRegister}
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
                                                <Text style={styles.buttonText}>Create Account</Text>
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
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.footerText}>
                                        Already a member? <Text style={styles.footerLink}>Sign In</Text>
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
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
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
