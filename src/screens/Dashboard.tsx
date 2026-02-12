import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Colors } from '../theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StorageService, LifestyleLog, TimeBlock } from '../services/storage';
import * as Haptics from 'expo-haptics';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, theme } = useTheme();
    const [weeklyStats, setWeeklyStats] = useState<{ date: string, completion: number, studyHours: number, dayName: string }[]>([]);
    const [todayLog, setTodayLog] = useState<LifestyleLog>({
        date: new Date().toISOString().split('T')[0],
        skinCare: { morning: false, night: false },
        nutrition: { waterLiters: 0 },
        hairCare: { washDay: false }
    });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        const stats = await StorageService.getWeeklyStats();
        // Stats comes as [today, yesterday, ...]. We might want to reverse it for the chart if we want Mon -> Sun, 
        // but stats is actually "last 7 days". 
        // Let's reverse it to show chronological order: [6 days ago, ..., today]
        setWeeklyStats([...stats].reverse());

        const todayStr = new Date().toISOString().split('T')[0];
        const log = await StorageService.getLifestyle(todayStr);
        if (log) {
            setTodayLog(log);
        } else {
            // Reset for new day if not found
            setTodayLog({
                date: todayStr,
                skinCare: { morning: false, night: false },
                nutrition: { waterLiters: 0 },
                hairCare: { washDay: false }
            });
        }
    };

    const updateLifestyle = async (updates: Partial<LifestyleLog>) => {
        const newLog = { ...todayLog, ...updates };
        // Handle nested updates carefully if passed, but for now we'll do specific handlers
        setTodayLog(newLog);
        await StorageService.saveLifestyle(newLog);
        Haptics.selectionAsync();
    };

    const toggleSkinCare = async (period: 'morning' | 'night') => {
        const newSkinCare = { ...todayLog.skinCare, [period]: !todayLog.skinCare[period] };
        const newLog = { ...todayLog, skinCare: newSkinCare };
        setTodayLog(newLog);
        await StorageService.saveLifestyle(newLog);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const addWater = async () => {
        const newWater = parseFloat((todayLog.nutrition.waterLiters + 0.25).toFixed(2));
        const newLog = { ...todayLog, nutrition: { ...todayLog.nutrition, waterLiters: newWater } };
        setTodayLog(newLog);
        await StorageService.saveLifestyle(newLog);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const toggleHairCare = async () => {
        const newHair = { ...todayLog.hairCare, washDay: !todayLog.hairCare.washDay };
        const newLog = { ...todayLog, hairCare: newHair };
        setTodayLog(newLog);
        await StorageService.saveLifestyle(newLog);
        Haptics.selectionAsync();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { flexGrow: 1 }]} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl }}>
                <Text style={[styles.pageTitle, { color: colors.text.primary, marginBottom: 0 }]}>Dashboard</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Discovery')}
                    style={{ padding: 8 }}
                >
                    <Feather name="compass" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {/* Left Column */}
                <View style={styles.column}>
                    {/* Weekly Progress */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Weekly Progress</Text>
                        <View style={styles.progressList}>
                            {weeklyStats.map((stat, index) => (
                                <View key={stat.date} style={styles.progressRow}>
                                    <View style={styles.progressLabelRow}>
                                        <Text style={[styles.dayLabel, { color: colors.text.primary }]}>{stat.dayName.substr(0, 3)}</Text>
                                        <Text style={[styles.taskCount, { color: colors.text.secondary }]}>{stat.completion}%</Text>
                                    </View>
                                    <View style={[styles.progressBarBg, { backgroundColor: colors.gray[100] }]}>
                                        <View style={[styles.progressBarFill, {
                                            width: `${stat.completion}%`,
                                            backgroundColor: stat.completion >= 80 ? '#10B981' : colors.primary
                                        }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Skin Care */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons name="water-outline" size={20} color={Colors.primary[0]} />
                            <Text style={[styles.cardTitle, { color: colors.text.primary, marginLeft: 8 }]}>Skin Care</Text>
                        </View>

                        <View style={[styles.habitRow, { backgroundColor: colors.gray[50] }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Feather name="sun" size={18} color="#F59E0B" />
                                <Text style={[styles.habitLabel, { color: colors.text.primary }]}>Morning</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.circleCheck, todayLog.skinCare.morning && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' }]}
                                onPress={() => toggleSkinCare('morning')}
                            >
                                {todayLog.skinCare.morning && <Feather name="check" size={14} color="#FFF" />}
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.habitRow, { backgroundColor: colors.gray[50] }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Feather name="moon" size={18} color="#6366F1" />
                                <Text style={[styles.habitLabel, { color: colors.text.primary }]}>Night</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.circleCheck, todayLog.skinCare.night && { backgroundColor: '#6366F1', borderColor: '#6366F1' }]}
                                onPress={() => toggleSkinCare('night')}
                            >
                                {todayLog.skinCare.night && <Feather name="check" size={14} color="#FFF" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Right Column */}
                <View style={styles.column}>
                    {/* Study Hours */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Study Hours This Week</Text>
                        <Text style={[styles.cardSubtitle, { color: colors.text.secondary }]}>(Deep Work)</Text>

                        <View style={styles.chartContainer}>
                            {/* Y-Axis */}
                            <View style={styles.yAxis}>
                                {['4h', '3h', '2h', '1h', '0h'].map(label => (
                                    <Text key={label} style={[styles.axisLabel, { color: colors.text.muted }]}>{label}</Text>
                                ))}
                            </View>
                            {/* Chart Area */}
                            <View style={styles.chartArea}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', paddingHorizontal: 4 }}>
                                    {weeklyStats.map(stat => (
                                        <View key={stat.date} style={{ alignItems: 'center', width: 20 }}>
                                            <View style={{
                                                width: 8,
                                                height: `${Math.min((stat.studyHours / 4) * 100, 100)}%`,
                                                backgroundColor: colors.primary,
                                                borderRadius: 4,
                                                opacity: 0.8
                                            }} />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                        <View style={styles.xAxis}>
                            {weeklyStats.map(stat => (
                                <Text key={stat.date} style={[styles.axisLabel, { color: colors.text.muted, width: 24, textAlign: 'center' }]}>
                                    {stat.dayName.substr(0, 1)}
                                </Text>
                            ))}
                        </View>
                    </View>

                    {/* Streak Stats */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Streak Stats</Text>
                        <View style={styles.streakGrid}>
                            <View style={[styles.streakBox, { backgroundColor: colors.gray[50] }]}>
                                <Text style={[styles.streakNumber, { color: '#3B82F6' }]}>0</Text>
                                <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>Workout Days</Text>
                            </View>
                            <View style={[styles.streakBox, { backgroundColor: colors.gray[50] }]}>
                                <Text style={[styles.streakNumber, { color: '#3B82F6' }]}>0</Text>
                                <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>Study Days</Text>
                            </View>
                        </View>
                    </View>

                    {/* Nutrition & Hair Care Row */}
                    <View style={styles.row}>
                        {/* Nutrition */}
                        <View style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#10B981" />
                                <Text style={[styles.cardTitle, { color: colors.text.primary, marginLeft: 8 }]}>Nutrition</Text>
                            </View>
                            <View style={[styles.nutritionBox, { backgroundColor: colors.gray[50] }]}>
                                <Text style={[styles.hydrationNumber, { color: '#2563EB' }]}>{todayLog.nutrition.waterLiters} <Text style={{ fontSize: 16, color: colors.text.secondary }}>L</Text></Text>
                                <Text style={[styles.hydrationLabel, { color: colors.text.secondary }]}>Hydration</Text>
                                <TouchableOpacity onPress={addWater} style={[styles.addButton, { borderColor: colors.cardBorder }]}>
                                    <Text style={{ fontWeight: '600', color: colors.text.primary }}>+ 250ml</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Hair Care */}
                        <View style={[styles.card, { flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="star-face" size={20} color="#F59E0B" />
                                <Text style={[styles.cardTitle, { color: colors.text.primary, marginLeft: 8 }]}>Hair Care</Text>
                            </View>
                            <View style={styles.hairCareRow}>
                                <Text style={[styles.habitLabel, { color: colors.text.primary }]}>Wash Day?</Text>
                                <TouchableOpacity
                                    onPress={toggleHairCare}
                                    style={[
                                        styles.toggleBtn,
                                        { borderColor: colors.cardBorder },
                                        todayLog.hairCare.washDay && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                >
                                    <Text style={{ color: todayLog.hairCare.washDay ? '#FFF' : colors.text.primary }}>
                                        {todayLog.hairCare.washDay ? 'Yes' : 'No'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.xl,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: Spacing.xl,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.lg,
    },
    column: {
        flex: 1,
        minWidth: 300,
        gap: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    card: {
        borderRadius: 16,
        padding: Spacing.lg,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    cardSubtitle: {
        fontSize: 16,
        marginTop: -12,
        marginBottom: 16,
    },

    // Weekly Progress
    progressList: {
        gap: 16,
    },
    progressRow: {
        gap: 8,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    taskCount: {
        fontSize: 12,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },

    // Chart
    chartContainer: {
        flexDirection: 'row',
        height: 200,
        marginBottom: 8,
    },
    yAxis: {
        justifyContent: 'space-between',
        paddingRight: 12,
        paddingBottom: 20,
    },
    chartArea: {
        flex: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E2E8F0',
        justifyContent: 'flex-end',
    },
    baseline: {
        height: 2,
        width: '100%',
    },
    xAxis: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 30, // Offset for Y-axis
        paddingRight: 10,
    },
    axisLabel: {
        fontSize: 12,
    },

    // Habit Rows
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    habitLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    circleCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFF',
    },

    // Streak
    streakGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    streakBox: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        borderRadius: 12,
    },
    streakNumber: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    streakLabel: {
        fontSize: 14,
    },

    // Nutrition
    nutritionBox: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
    },
    hydrationNumber: {
        fontSize: 36,
        fontWeight: '700',
    },
    hydrationLabel: {
        fontSize: 14,
        marginBottom: 16,
    },
    addButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        backgroundColor: '#FFF',
    },

    // Hair Care
    hairCareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    toggleBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 6,
        borderWidth: 1,
    }
});
