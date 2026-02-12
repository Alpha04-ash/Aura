import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { MotiView, MotiText } from 'moti';
import { ArrowRight, Wind, Zap, Brain, Sparkles, Command } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Luminous Zen - Narrative Onboarding
export const OnboardingScreen = ({ navigation }: any) => {

    const handleEnter = () => {
        navigation.navigate('Register');
    };

    return (
        <View style={styles.container}>
            {/* 1. Ambient Animated Background */}
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
            />

            {/* Soft Mesh Gradients - "Subtle animated gradient drift" simulated */}
            <MotiView
                from={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0.8, scale: 1.1 }}
                transition={{ type: 'timing', duration: 10000, loop: true }}
                style={styles.backgroundDecor}
            >
                {/* Soft Indigo Blob */}
                <View style={[styles.blurCircle, { backgroundColor: '#818CF8', top: -150, left: -50, opacity: 0.3 }]} />
                {/* Rose Quartz Blob */}
                <View style={[styles.blurCircle, { backgroundColor: '#F472B6', bottom: -100, right: -100, opacity: 0.2 }]} />
                {/* Soft Violet Center */}
                <View style={[styles.blurCircle, { backgroundColor: '#C084FC', top: height * 0.4, left: -100, width: 400, height: 400, opacity: 0.2 }]} />
            </MotiView>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>

                    {/* Hero Section: "Clarity is the ultimate luxury" */}
                    <View style={styles.heroSection}>
                        <MotiView
                            from={{ opacity: 0, translateY: 20 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 1000 }}
                            style={styles.pillContainer}
                        >
                            <View style={styles.glassPill}>
                                <Sparkles size={12} color={Colors.primary} style={{ marginRight: 6 }} />
                                <Text style={styles.pillText}>The Luminous Engine for Focus</Text>
                            </View>
                        </MotiView>

                        <MotiText
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 1000, delay: 200 }}
                            style={styles.heroTitle}
                        >
                            Clarity is the{"\n"}Ultimate Luxury.
                        </MotiText>

                        <MotiText
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 1000, delay: 500 }}
                            style={styles.heroSubtitle}
                        >
                            Your personal board of directors for deep work,{"\n"}mindfulness, and creativity.
                        </MotiText>
                    </View>

                    {/* Personas Showcase - "Visual intro to the 3 AI personas" */}
                    <MotiView
                        from={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 1000, delay: 700 }}
                        style={styles.personaRow}
                    >
                        <View style={styles.personaCard}>
                            <View style={[styles.personaIcon, { backgroundColor: '#E0E7FF' }]}>
                                <Zap size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.personaName}>Marcus</Text>
                            <Text style={styles.personaRole}>Productivity Scientist</Text>
                        </View>

                        <View style={styles.personaCard}>
                            <View style={[styles.personaIcon, { backgroundColor: '#FCE7F3' }]}>
                                <Wind size={20} color={Colors.rose} />
                            </View>
                            <Text style={styles.personaName}>Elara</Text>
                            <Text style={styles.personaRole}>Mindfulness Guide</Text>
                        </View>

                        <View style={styles.personaCard}>
                            <View style={[styles.personaIcon, { backgroundColor: '#F3E8FF' }]}>
                                <Brain size={20} color={Colors.secondary} />
                            </View>
                            <Text style={styles.personaName}>Julian</Text>
                            <Text style={styles.personaRole}>Creative Strategist</Text>
                        </View>
                    </MotiView>

                    {/* Manifesto / Philosophy Block */}
                    <MotiView
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 1000, delay: 900 }}
                        style={styles.manifestoContainer}
                    >
                        <Text style={styles.manifestoText}>
                            Aura replaces noise with signal.{"\n"}
                            No expensive coaching. No generic chats.{"\n"}
                            Just pure, intelligent flow.
                        </Text>
                    </MotiView>

                    {/* Call To Action - "Enter the Flow" */}
                    <View style={styles.ctaContainer}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={handleEnter}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={Colors.gradients.primary}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.primaryBtnText}>Enter the Flow</Text>
                                <ArrowRight size={20} color={Colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.trustLabel}>
                            Trusted by high performers worldwide.
                        </Text>
                    </View>

                </SafeAreaView>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 120, // More breathing room at bottom
    },
    backgroundDecor: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blurCircle: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        // @ts-ignore
        filter: 'blur(80px)',
    },
    safeArea: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    heroSection: {
        marginTop: height * 0.1,
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        maxWidth: 600,
        width: '100%',
    },
    pillContainer: {
        marginBottom: Spacing.lg,
    },
    glassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        // @ts-ignore
        backdropFilter: 'blur(8px)',
    },
    pillText: {
        ...Typography.caption,
        color: Colors.primary,
        fontSize: 11,
    },
    heroTitle: {
        ...Typography.hero,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    heroSubtitle: {
        ...Typography.bodyLarge,
        textAlign: 'center',
        color: Colors.text.secondary,
    },
    personaRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
        marginTop: Spacing.mega,
        flexWrap: 'wrap',
        maxWidth: 600,
        paddingHorizontal: Spacing.md,
    },
    personaCard: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 24,
        padding: Spacing.lg,
        alignItems: 'center',
        width: 160,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
    personaIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    personaName: {
        ...Typography.h3,
        fontSize: 16,
        marginBottom: 2,
    },
    personaRole: {
        ...Typography.caption,
        fontSize: 10,
        textAlign: 'center',
        color: Colors.text.muted,
    },
    manifestoContainer: {
        marginTop: Spacing.mega,
        paddingHorizontal: Spacing.xl,
        maxWidth: 500,
    },
    manifestoText: {
        ...Typography.bodyLarge,
        fontSize: 20,
        textAlign: 'center',
        color: Colors.text.primary,
        fontWeight: '500',
        fontStyle: 'italic',
        opacity: 0.8,
    },
    ctaContainer: {
        marginTop: Spacing.mega,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: Spacing.xl,
    },
    primaryBtn: {
        width: '100%',
        maxWidth: 320,
        height: 64,
        borderRadius: 32,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 10,
        marginBottom: Spacing.xl, // Increased margin for bottom spacing
    },
    btnGradient: {
        flex: 1,
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
        marginRight: Spacing.sm,
    },
    trustLabel: {
        ...Typography.caption,
        fontSize: 11,
        color: Colors.text.muted,
        opacity: 0.7,
    },
});
