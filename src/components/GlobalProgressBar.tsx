import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing, Colors } from '../theme';
import { StorageService } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export const GlobalProgressBar = () => {
    const { theme, colors } = useTheme();
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [animatedWidth] = useState(new Animated.Value(0));

    const loadProgress = async () => {
        try {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const schedule = await StorageService.getSchedule(dateStr);

            if (schedule.length === 0) {
                setProgress(0);
            } else {
                const completed = schedule.filter(t => t.status === 'completed').length;
                const percent = Math.round((completed / schedule.length) * 100);
                setProgress(percent);
            }
        } catch (e) {
            console.error('Failed to load progress', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadProgress();
        }, [])
    );

    useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const isDark = theme === 'dark';

    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    const ProgressContent = ({ progress, widthInterpolated, colors, isDark }: any) => (
        <View style={styles.content}>
            {/* Progress Section - Left Side & Bigger */}
            <View style={styles.progressWrapper}>
                <View style={styles.textRow}>
                    <Text style={[styles.label, { color: colors.text.secondary }]}>
                        Today's Focus
                    </Text>
                    <Text style={[styles.percentage, { color: colors.primary }]}>
                        {progress}%
                    </Text>
                </View>
                <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Animated.View
                        style={[
                            styles.fill,
                            {
                                width: widthInterpolated,
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary,
                                shadowOpacity: 0.5,
                                shadowRadius: 6,
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Day Name - Right Side */}
            <Text style={[styles.dayText, { color: colors.text.primary, opacity: isDark ? 0.8 : 0.6 }]}>
                {dayName}
            </Text>
        </View>
    );

    const containerStyle = Platform.OS === 'web'
        ? [styles.blurContainer, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' } as any]
        : styles.blurContainer;

    return (
        <View style={[styles.container, Platform.OS === 'web' && styles.webSticky]}>
            {Platform.OS === 'ios' ? (
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurContainer}>
                    <ProgressContent
                        progress={progress}
                        widthInterpolated={widthInterpolated}
                        colors={colors}
                        isDark={isDark}
                    />
                </BlurView>
            ) : (
                <View style={containerStyle}>
                    <ProgressContent
                        progress={progress}
                        widthInterpolated={widthInterpolated}
                        colors={colors}
                        isDark={isDark}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 100,
    },
    webSticky: {
        position: 'sticky' as any,
        top: 0,
    },
    blurContainer: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg, // Check: Increased vertical padding for "bigger" feel
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Push to edges
    },
    dayText: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginLeft: Spacing.lg, // Margin left to separate from bar
    },
    progressWrapper: {
        flex: 1,
        maxWidth: 600, // Make it LONGER (was 400)
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 13, // Revert to smaller size
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    percentage: {
        fontSize: 14, // Revert to smaller size
        fontWeight: '700',
    },
    track: {
        height: 6, // Revert to thinner bar
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    }
});
