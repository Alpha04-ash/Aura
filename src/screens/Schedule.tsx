import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, Colors } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { StorageService, TimeBlock } from '../services/storage';
import { generateSchedule } from '../services/openai';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

import { COACHES } from '../constants/coaches';



// Local COACHES definition removed

export const ScheduleScreen = () => {
    return <ScheduleScreenContent />;
};

const ScheduleScreenContent = () => {
    const navigation = useNavigation();
    const { theme, colors } = useTheme();
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [coachId, setCoachId] = useState<string | null>(null);

    // Form State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingBlock, setEditingBlock] = useState<Partial<TimeBlock>>({});
    const [isAiModalVisible, setAiModalVisible] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationMode, setGenerationMode] = useState<'day' | 'week'>('day');
    const [isReviewModalVisible, setReviewModalVisible] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    // Confirmation Modal State
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
        isDestructive?: boolean;
    } | null>(null);

    const getFormattedDate = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };


    useEffect(() => {
        loadSchedule();
        loadCoach();
    }, [selectedDate]); // Reload if date changes (mock logic for now stays same)

    const loadSchedule = async () => {
        try {
            const dateStr = getFormattedDate(selectedDate);
            const saved = await StorageService.getSchedule(dateStr);
            setBlocks(saved || []);
        } catch (error) {
            console.error("Failed to load schedule:", error);
        }
    };

    const loadCoach = async () => {
        try {
            const savedCoach = await AsyncStorage.getItem('selected_coach_id');
            if (savedCoach) setCoachId(savedCoach);
        } catch (e) { console.log(e); }
    }

    const handleCoachSelect = async (id: string) => {
        setCoachId(id);
        await AsyncStorage.setItem('selected_coach_id', id);
        Haptics.selectionAsync();
        Alert.alert("Coach Updated", `${COACHES.find(c => c.id === id)?.name} is now monitoring your schedule.`);
    };

    // Helper to parse "HH:MM AM" or "HH:MM AM - HH:MM PM" into minutes for sorting
    const parseTime = (timeStr: string) => {
        try {
            // Extract start time if range
            const start = timeStr.split('-')[0].trim();
            const [time, modifier] = start.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            return hours * 60 + (minutes || 0);
        } catch (e) {
            return 0; // Fallback
        }
    };

    const handleSaveBlock = async () => {
        if (!editingBlock.activity?.trim() || !editingBlock.time) return;

        const newBlock: TimeBlock = {
            id: editingBlock.id || Date.now().toString(),
            time: editingBlock.time,
            activity: editingBlock.activity,
            isAiGenerated: editingBlock.isAiGenerated || false,
            category: editingBlock.category || 'Work',
            status: editingBlock.status || 'pending',
            description: editingBlock.description || ''
        };

        const filtered = blocks.filter(b => b.id !== newBlock.id);
        const updated = [...filtered, newBlock].sort((a, b) => parseTime(a.time) - parseTime(b.time));

        setBlocks(updated);
        await StorageService.saveSchedule(updated, getFormattedDate(selectedDate));
        setEditModalVisible(false);
        setEditingBlock({});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleDeleteBlock = () => {
        if (!editingBlock.id) return;

        setConfirmConfig({
            title: "Delete Task",
            message: "Are you sure you want to remove this task?",
            isDestructive: true,
            onConfirm: async () => {
                const updated = blocks.filter(b => b.id !== editingBlock.id);
                setBlocks(updated);
                await StorageService.saveSchedule(updated, getFormattedDate(selectedDate));
                setEditModalVisible(false);
                setEditingBlock({});
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });
        setConfirmModalVisible(true);
    };

    const handleClearSchedule = () => {
        if (blocks.length === 0) return;

        setConfirmConfig({
            title: "Clear Schedule",
            message: "This will remove all tasks for today. This action cannot be undone.",
            isDestructive: true,
            onConfirm: async () => {
                setBlocks([]);
                await StorageService.saveSchedule([], getFormattedDate(selectedDate));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });
        setConfirmModalVisible(true);
    };

    const handleClearWeek = () => {
        setConfirmConfig({
            title: "Clear Week Plan",
            message: "This will remove all tasks for this day and the next 6 days. Are you sure?",
            isDestructive: true,
            onConfirm: async () => {
                const updates = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(selectedDate);
                    d.setDate(selectedDate.getDate() + i);
                    updates.push(StorageService.saveSchedule([], getFormattedDate(d)));
                }
                await Promise.all(updates);
                setBlocks([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        });
        setConfirmModalVisible(true);
    };



    const toggleStatus = async (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const updated = blocks.map(b => {
            if (b.id === id) {
                // Cycle: pending -> in-progress -> completed -> pending
                let nextStatus: TimeBlock['status'] = 'pending';
                if (b.status === 'pending') nextStatus = 'in-progress';
                else if (b.status === 'in-progress') nextStatus = 'completed';
                else if (b.status === 'completed') nextStatus = 'pending';
                // Map legacy isCompleted if needed, but we rely on status now
                return { ...b, status: nextStatus, isCompleted: nextStatus === 'completed' };
            }
            return b;
        });

        setBlocks(updated);
        await StorageService.saveSchedule(updated, getFormattedDate(selectedDate));
    };

    const handleMagicSchedule = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateSchedule(aiPrompt, generationMode, getFormattedDate(selectedDate));
            if (result && result.length > 0) {
                setPreviewData(result);
                setAiModalVisible(false);
                setReviewModalVisible(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Alert.alert("AI Error", "Could not generate a schedule. Please try again.");
            }
        } catch (e) { Alert.alert("Error", "AI generation failed"); }
        finally { setIsGenerating(false); }
    };

    const handleAcceptSchedule = async () => {
        if (!previewData) return;

        try {
            if (generationMode === 'day') {
                // previewData is TimeBlock[]
                const processed = previewData.map((b: any) => ({
                    id: Math.random().toString(36).substr(2, 9),
                    time: b.time,
                    activity: b.activity,
                    description: b.description,
                    isAiGenerated: true,
                    category: 'AI Plan',
                    status: 'pending' as const
                }));
                const updated = [...processed].sort((a: any, b: any) => parseTime(a.time) - parseTime(b.time));
                setBlocks(updated);
                await StorageService.saveSchedule(updated, getFormattedDate(selectedDate));
            } else {
                // generationMode === 'week'
                // previewData is [{ dayOffset: 0, blocks: [...] }, ...]
                for (const dayPlan of previewData) {
                    const targetDate = new Date(selectedDate);
                    targetDate.setDate(selectedDate.getDate() + dayPlan.dayOffset);
                    const dateStr = getFormattedDate(targetDate);

                    const processed = dayPlan.blocks.map((b: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        time: b.time,
                        activity: b.activity,
                        description: b.description,
                        isAiGenerated: true,
                        category: 'AI Plan',
                        status: 'pending' as const
                    })).sort((a: any, b: any) => parseTime(a.time) - parseTime(b.time));

                    await StorageService.saveSchedule(processed, dateStr);

                    // If this day is the currently selected date, update state
                    if (dateStr === getFormattedDate(selectedDate)) {
                        setBlocks(processed);
                    }
                }
            }
            setReviewModalVisible(false);
            setPreviewData(null);
            setAiPrompt('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", generationMode === 'week' ? "Weekly plan applied!" : "Daily plan applied!");
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to save schedule");
        }
    };

    const handleDiscardSchedule = () => {
        setReviewModalVisible(false);
        setPreviewData(null);
        setAiModalVisible(true); // Go back to prompt
    };


    const openAddModal = () => {
        setEditingBlock({
            time: '09:00 - 10:00',
            category: 'Work',
            status: 'pending'
        });
        setEditModalVisible(true);
    };

    const openEditModal = (block: TimeBlock) => {
        setEditingBlock(block);
        setEditModalVisible(true);
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
        Haptics.selectionAsync();
    };

    const getCategoryColor = (index: number, category?: string) => {
        const palette = Colors.pastels || ['#E2E8F0', '#FAE8FF', '#F0FDF4'];
        if (!category) return palette[index % palette.length];
        // Simple hash or predefined mapping could act here
        return palette[index % palette.length];
    };

    const currentCoach = COACHES.find(c => c.id === coachId) || COACHES[0];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Header Section */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
                        <Text style={[styles.pageTitle, { color: colors.primary }]}>Schedule</Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Discovery')}
                            style={{ padding: 8 }}
                        >
                            <Feather name="compass" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Coach & Date Selector */}
                    <View style={styles.controlsSection}>
                        {/* Selected Coach Only */}
                        <View style={{ paddingHorizontal: Spacing.md, marginBottom: Spacing.md, marginTop: Spacing.md }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Discovery')}
                                style={[styles.coachChip, { backgroundColor: colors.card, borderColor: colors.gray[200] || '#E2E8F0', borderWidth: 1, alignSelf: 'flex-start' }]}
                            >
                                <View style={[styles.coachAvatar, { backgroundColor: currentCoach.color }]}>
                                    <Feather
                                        name={currentCoach.icon as any}
                                        size={12}
                                        color="#FFF"
                                    />
                                </View>
                                <View>
                                    <Text style={[styles.coachName, { color: colors.text.primary }]}>{currentCoach.name}</Text>
                                    <Text style={{ fontSize: 10, color: colors.text.secondary }}>{currentCoach.role}</Text>
                                </View>
                                <Feather name="chevron-right" size={14} color={colors.text.secondary} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Date Navigation */}
                        <View style={styles.dateNav}>
                            <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn}>
                                <Feather name="chevron-left" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={[styles.dateTitle, { color: colors.text.primary }]}>
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                </Text>
                                <Text style={[styles.dateSubtitle, { color: colors.text.secondary }]}>
                                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn}>
                                <Feather name="chevron-right" size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={openAddModal} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                                <Feather name="plus" size={18} color="#FFF" />
                                <Text style={styles.addBtnText}>Add Task</Text>
                            </TouchableOpacity>
                            {blocks.length > 0 && (
                                <>
                                    <TouchableOpacity onPress={handleClearSchedule} style={styles.clearBtn} accessibilityLabel="Clear Day">
                                        <Feather name="trash-2" size={18} color={colors.error || '#EF4444'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleClearWeek} style={styles.clearBtn} accessibilityLabel="Clear Week">
                                        <Feather name="layers" size={18} color={colors.error || '#EF4444'} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Task List */}
                    <View style={styles.listContent}>
                        {blocks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Feather name="calendar" size={48} color={colors.gray[300]} />
                                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No tasks required for this day.</Text>
                                <TouchableOpacity onPress={() => setAiModalVisible(true)} style={{ marginTop: 16 }}>
                                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Generate with AI</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            blocks.map((block, index) => {
                                const isCompleted = block.status === 'completed';
                                const isInProgress = block.status === 'in-progress';

                                return (
                                    <TouchableOpacity
                                        key={block.id}
                                        style={[styles.card, {
                                            backgroundColor: getCategoryColor(index, block.category),
                                            borderColor: isInProgress ? colors.primary : colors.gray[200],
                                            borderWidth: isInProgress ? 2 : 1,
                                            opacity: isCompleted ? 0.6 : 1
                                        }]}
                                        onPress={() => openEditModal(block)}
                                    >
                                        <TouchableOpacity
                                            style={[styles.checkbox,
                                            isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
                                            isInProgress && { borderColor: colors.primary, borderStyle: 'dotted' }
                                            ]}
                                            onPress={() => toggleStatus(block.id)}
                                        >
                                            {isCompleted && <Feather name="check" size={12} color="#FFF" />}
                                            {isInProgress && <Feather name="play" size={10} color={colors.primary} />}
                                        </TouchableOpacity>

                                        <View style={styles.cardContent}>
                                            <View style={styles.cardHeader}>
                                                <Feather name="clock" size={12} color={colors.text.secondary} />
                                                <Text style={[styles.timeText, { color: colors.text.secondary }]}>{block.time}</Text>
                                            </View>
                                            <Text style={[styles.activityTitle, { color: colors.text.primary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
                                                {block.activity}
                                            </Text>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {block.category && <Text style={[styles.categoryText, { color: colors.text.secondary }]}>{block.category}</Text>}
                                                {isInProgress && <Text style={{ fontSize: 10, color: colors.primary, fontWeight: 'bold' }}>IN PROGRESS</Text>}
                                            </View>
                                            {block.description && (
                                                <Text style={[styles.descriptionText, { color: colors.text.secondary, marginTop: 4 }]}>{block.description}</Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                        <View style={{ height: 100 }} />
                    </View>
                </ScrollView>

                {/* FAB */}
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => setAiModalVisible(true)}
                >
                    <FontAwesome5 name="magic" size={20} color="#FFF" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Edit Modal */}
            <Modal visible={isEditModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                                {editingBlock.id ? 'Edit Block' : 'Add Block'}
                            </Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Feather name="x" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: colors.text.secondary }]}>Title</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC', color: colors.text.primary }]}
                            placeholder="Task name"
                            placeholderTextColor={colors.text.muted}
                            value={editingBlock.activity}
                            onChangeText={t => setEditingBlock({ ...editingBlock, activity: t })}
                        />

                        <Text style={[styles.label, { color: colors.text.secondary }]}>Description</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC', color: colors.text.primary, height: 80, textAlignVertical: 'top' }]}
                            placeholder="Add details (optional)..."
                            placeholderTextColor={colors.text.muted}
                            value={editingBlock.description}
                            onChangeText={t => setEditingBlock({ ...editingBlock, description: t })}
                            multiline
                        />

                        <Text style={[styles.label, { color: colors.text.secondary }]}>Time Range</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC', color: colors.text.primary }]}
                            placeholder="e.g. 09:00 - 10:00"
                            placeholderTextColor={colors.text.muted}
                            value={editingBlock.time}
                            onChangeText={t => setEditingBlock({ ...editingBlock, time: t })}
                        />

                        <Text style={[styles.label, { color: colors.text.secondary }]}>Category</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC', color: colors.text.primary }]}
                            placeholder="Work, Health, Study..."
                            value={editingBlock.category}
                            onChangeText={t => setEditingBlock({ ...editingBlock, category: t })}
                        />

                        <View style={[styles.modalActions, { justifyContent: editingBlock.id ? 'space-between' : 'flex-end' }]}>
                            {editingBlock.id && (
                                <TouchableOpacity onPress={handleDeleteBlock} style={styles.deleteBtn}>
                                    <Text style={[styles.deleteText, { color: colors.error || '#EF4444' }]}>Delete</Text>
                                </TouchableOpacity>
                            )}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                                    <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleSaveBlock} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* AI Modal (Reused) */}
            <Modal
                visible={isAiModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAiModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.modalIconBg, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
                                    <FontAwesome5 name="magic" size={20} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Magic Schedule</Text>
                                    <Text style={[styles.modalSubtitle, { color: colors.text.secondary }]}>AI-powered day planning</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setAiModalVisible(false)} style={[styles.closeBtn, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC' }]}>
                                <Feather name="x" size={20} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.instructionText, { color: colors.text.secondary }]}>
                            What are your main goals for tomorrow?
                            I'll organize your entire day around them.
                        </Text>

                        <TextInput
                            style={[styles.aiInput, { backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC', color: colors.text.primary }]}
                            placeholder="e.g. Wake up at 7am, deep work until noon, gym at 5pm, and read a book before bed..."
                            placeholderTextColor={colors.text.secondary}
                            multiline
                            value={aiPrompt}
                            onChangeText={setAiPrompt}
                            autoFocus
                        />

                        {/* Mode Selector */}
                        <View style={styles.modeSelector}>
                            <TouchableOpacity
                                style={[styles.modeOption, generationMode === 'day' && { backgroundColor: colors.primary }]}
                                onPress={() => setGenerationMode('day')}
                            >
                                <Text style={[styles.modeText, generationMode === 'day' ? { color: '#FFF' } : { color: colors.text.primary }]}>Day Plan</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeOption, generationMode === 'week' && { backgroundColor: colors.primary }]}
                                onPress={() => setGenerationMode('week')}
                            >
                                <Text style={[styles.modeText, generationMode === 'week' ? { color: '#FFF' } : { color: colors.text.primary }]}>Week Plan</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.generateBtn, { backgroundColor: colors.primary }, isGenerating && { opacity: 0.7 }]}
                            onPress={handleMagicSchedule}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <ActivityIndicator color={'#FFFFFF'} />
                            ) : (
                                <>
                                    <FontAwesome5 name="magic" size={16} color={'#FFFFFF'} />
                                    <Text style={styles.generateBtnText}>Generate My Day</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Review Modal */}
            <Modal
                visible={isReviewModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={handleDiscardSchedule}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '80%' }]}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { color: colors.text.primary, marginBottom: 16 }]}>Review AI Plan</Text>

                        <ScrollView style={{ marginBottom: 20 }}>
                            {generationMode === 'day' && previewData && previewData.map((item: any, index: number) => (
                                <View key={index} style={[styles.reviewItem, { borderLeftColor: colors.primary }]}>
                                    <Text style={[styles.reviewTime, { color: colors.text.secondary }]}>{item.time}</Text>
                                    <Text style={[styles.reviewActivity, { color: colors.text.primary }]}>{item.activity}</Text>
                                    {item.description && <Text style={[styles.reviewDesc, { color: colors.text.secondary }]}>{item.description}</Text>}
                                </View>
                            ))}
                            {generationMode === 'week' && previewData && previewData.map((day: any, dIndex: number) => (
                                <View key={dIndex} style={{ marginBottom: 16 }}>
                                    <Text style={[styles.reviewDayHeader, { color: colors.primary }]}>Day {day.dayOffset + 1}</Text>
                                    {day.blocks.map((item: any, index: number) => (
                                        <View key={index} style={[styles.reviewItem, { borderLeftColor: colors.primary }]}>
                                            <Text style={[styles.reviewTime, { color: colors.text.secondary }]}>{item.time}</Text>
                                            <Text style={[styles.reviewActivity, { color: colors.text.primary }]}>{item.activity}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={handleDiscardSchedule} style={styles.cancelBtn}>
                                <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Discard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAcceptSchedule} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                                <Text style={styles.saveText}>Apply Plan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* Confirmation Modal */}
            <Modal
                visible={isConfirmModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card, paddingBottom: 32 }]}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <View style={{
                                width: 48, height: 48, borderRadius: 24,
                                backgroundColor: confirmConfig?.isDestructive ? '#FEF2F2' : '#EFF6FF',
                                alignItems: 'center', justifyContent: 'center', marginBottom: 16
                            }}>
                                <Feather
                                    name={confirmConfig?.isDestructive ? "alert-triangle" : "info"}
                                    size={24}
                                    color={confirmConfig?.isDestructive ? '#EF4444' : colors.primary}
                                />
                            </View>
                            <Text style={[styles.modalTitle, { color: colors.text.primary, textAlign: 'center' }]}>
                                {confirmConfig?.title}
                            </Text>
                            <Text style={[styles.modalSubtitle, { color: colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
                                {confirmConfig?.message}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.modeOption, { backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0' }]}
                                onPress={() => setConfirmModalVisible(false)}
                            >
                                <Text style={[styles.modeText, { color: colors.text.primary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeOption, {
                                    backgroundColor: confirmConfig?.isDestructive ? (colors.error || '#EF4444') : colors.primary
                                }]}
                                onPress={async () => {
                                    if (confirmConfig?.onConfirm) await confirmConfig.onConfirm();
                                    setConfirmModalVisible(false);
                                }}
                            >
                                <Text style={[styles.modeText, { color: '#FFF' }]}>
                                    {confirmConfig?.isDestructive ? "Delete" : "Confirm"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '800',
    },
    controlsSection: {
        marginBottom: Spacing.md,
    },
    coachList: {
        maxHeight: 50,
        marginBottom: Spacing.lg,
        marginTop: Spacing.md,
    },
    coachChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
        backgroundColor: '#FFF',
    },
    coachAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    coachName: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    navBtn: {
        padding: 8,
    },
    dateTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    dateSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        gap: Spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#94A3B8',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    categoryText: {
        fontSize: 12,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 32,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    cancelText: {
        fontWeight: '600',
    },
    deleteBtn: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    deleteText: {
        fontWeight: '600',
    },
    clearBtn: {
        padding: 8,
        marginLeft: 8,
    },
    saveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    saveText: {
        color: '#FFF',
        fontWeight: '700',
    },

    // AI Modal (Keep existing styles for compatibility or update)
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    descriptionText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    modeOption: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    modeText: {
        fontWeight: '600',
        fontSize: 14,
    },
    reviewItem: {
        paddingLeft: 12,
        borderLeftWidth: 3,
        marginBottom: 12,
    },
    reviewTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    reviewActivity: {
        fontSize: 16,
        fontWeight: '600',
    },
    reviewDesc: {
        fontSize: 13,
        marginTop: 2,
    },
    reviewDayHeader: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 8,
    },
    modalIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
    },
    closeBtn: {
        padding: 8,
        borderRadius: 12,
    },
    instructionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    aiInput: {
        borderRadius: 20,
        padding: 20,
        fontSize: 16,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    generateBtn: {
        borderRadius: 20,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    generateBtnText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    }
});
