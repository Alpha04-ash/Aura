import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    Image,
    Platform,
    useWindowDimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Typography } from '../theme';
import { Zap, Wind, Brain, ChevronRight, Settings, Sparkles, Bookmark, Clock, MessageSquare } from 'lucide-react-native';
import { COACHES, Coach } from '../constants/coaches';
import { MotiView, MotiText } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export const DiscoveryScreen = () => {
    const navigation = useNavigation<any>();
    const { width } = useWindowDimensions();
    const { theme, colors } = useTheme();

    const isDesktop = width >= 768;
    const CARD_WIDTH = isDesktop ? 340 : width - 48; // Full width on mobile, grid on desktop
    const CARD_HEIGHT = 540;

    // Dynamic Styles
    const themeStyles = {
        container: { backgroundColor: colors.background },
        text: { color: colors.text.primary },
        textSecondary: { color: colors.text.secondary },
        card: { backgroundColor: colors.card },
        btnIcon: {
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'
        }
    };

    const handleSelectCoach = (coach: Coach) => {
        Haptics.selectionAsync();
        navigation.navigate('Chat', { coachId: coach.id });
    };

    const getIcon = (id: string, color: string) => {
        switch (id) {
            case 'marcus': return <Zap size={32} color={color} fill={color} fillOpacity={0.1} />;
            case 'elara': return <Wind size={32} color={color} />;
            case 'julian': return <Brain size={32} color={color} />;
            default: return <Sparkles size={32} color={color} />;
        }
    };

    const getGradient = (id: string) => {
        // We can adapt gradients for dark mode if desired, but these pastel/brand ones usually work okay.
        // Let's slightly darken them for dark mode if needed, or keep them as accent pops.
        if (theme === 'dark') {
            switch (id) {
                case 'marcus': return ['#1E1B4B', '#312E81'] as const;
                case 'elara': return ['#831843', '#9D174D'] as const;
                case 'julian': return ['#4C1D95', '#5B21B6'] as const;
                default: return ['#0F172A', '#1E293B'] as const;
            }
        }

        switch (id) {
            case 'marcus': return ['#EEF2FF', '#C7D2FE'] as const;
            case 'elara': return ['#FFF1F2', '#FECDD3'] as const;
            case 'julian': return ['#F5F3FF', '#DDD6FE'] as const;
            default: return ['#F8FAFC', '#F1F5F9'] as const;
        }
    };

    // Text color on cards needs to adapt to the gradient background.
    // Dark mode gradients are dark -> Text should be light.
    // Light mode gradients are light -> Text should be dark.
    const cardTextColor = theme === 'dark' ? '#F8FAFC' : colors.text.primary;
    const cardRoleColor = theme === 'dark' ? '#94A3B8' : colors.text.secondary;

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Ambient Mesh Background - Removed (Moved to DashboardLayout) */}

            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.headerSubtitle, themeStyles.textSecondary]}>Good Morning</Text>
                            <Text style={[styles.headerTitle, themeStyles.text]}>Who is your guide today?</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Settings')}
                                style={[styles.iconBtn, themeStyles.btnIcon]}
                            >
                                <Settings size={24} color={colors.text.primary} strokeWidth={1.5} />
                            </TouchableOpacity>
                        </View>
                    </View>



                    {/* Responsive Persona Grid */}
                    <View style={styles.galleryContainer}>
                        {COACHES.map((coach, index) => (
                            <MotiView
                                key={coach.id}
                                from={{ opacity: 0, scale: 0.95, translateY: 20 }}
                                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                                transition={{ type: 'spring', delay: index * 100 }}
                                style={[
                                    styles.cardWrapper,
                                    {
                                        width: CARD_WIDTH,
                                        height: CARD_HEIGHT,
                                        marginBottom: Spacing.xl,
                                        shadowColor: '#000'
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.95}
                                    onPress={() => handleSelectCoach(coach)}
                                    style={[styles.cardContainer, { backgroundColor: colors.card }]}
                                >
                                    <LinearGradient
                                        colors={getGradient(coach.id)}
                                        style={[styles.cardGradient, { borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)' }]}
                                    >
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.badge, { borderColor: coach.color, backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)' }]}>
                                                <Text style={[styles.badgeText, { color: coach.color }]}>AI PERSONA</Text>
                                            </View>

                                            <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderColor: coach.color }]}>
                                                {getIcon(coach.id, coach.color)}
                                            </View>
                                        </View>

                                        <View style={styles.cardContent}>
                                            <Text style={[styles.coachName, { color: cardTextColor }]}>{coach.name}</Text>
                                            <Text style={[styles.coachRole, { color: cardRoleColor }]}>{coach.role}</Text>
                                            <Text style={[styles.coachDescription, { color: cardTextColor, opacity: 0.8 }]}>
                                                {coach.description}
                                            </Text>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <TouchableOpacity
                                                style={[styles.primaryBtn, { backgroundColor: coach.color, shadowColor: theme === 'dark' ? '#000' : '#000' }]}
                                                onPress={() => handleSelectCoach(coach)}
                                                activeOpacity={0.9}
                                            >
                                                <Text style={styles.primaryBtnText}>Start Session</Text>
                                                <ChevronRight size={20} color={'#FFFFFF'} />
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundDecor: {
        // Removed
    },
    blurCircle: {
        // Removed
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    headerSubtitle: {
        ...Typography.caption,
        marginBottom: 4,
    },
    headerTitle: {
        ...Typography.h2,
        maxWidth: 200,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    galleryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.xl, // Native Gap for clean spacing
    },
    cardWrapper: {
        height: 540,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 12, // Higher elevation for premium feel
    },
    cardContainer: {
        flex: 1,
        borderRadius: 40, // Increased corner radius
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    cardHeader: {
        alignItems: 'center',
        marginTop: Spacing.md,
        width: '100%',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        borderWidth: 4,
        marginTop: Spacing.lg,
    },
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        marginBottom: Spacing.md,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    cardContent: {
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        width: '100%',
    },
    coachName: {
        ...Typography.h1,
        fontSize: 44, // Larger title
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -1,
    },
    coachRole: {
        ...Typography.bodyLarge,
        fontWeight: '600',
        marginBottom: Spacing.lg,
        textAlign: 'center',
        fontSize: 15,
        letterSpacing: 0.5,
        textTransform: 'uppercase', // Editorial touch
    },
    coachDescription: {
        ...Typography.body,
        fontSize: 16,
        lineHeight: 28, // More breathing room
        textAlign: 'center',
        maxWidth: 280,
    },
    cardFooter: {
        width: '100%',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    primaryBtn: {
        width: '100%',
        height: 64, // Taller button
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: Spacing.xs,
        letterSpacing: 0.5,
    },
    sectionTitle: {
        ...Typography.h3,
        marginBottom: Spacing.md,
        fontSize: 18,
    },
    essentialsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    essentialCard: {
        flex: 1,
        borderRadius: 24,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    essentialIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    essentialTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    essentialSubtitle: {
        fontSize: 12,
        marginTop: 2,
    }
});
