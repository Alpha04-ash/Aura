import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { MessageSquare, Trash2, Plus, X, ChevronRight, Home, LogOut, ChevronLeft } from 'lucide-react-native';
import { ChatSession, StorageService } from '../services/storage';
import { COACHES } from '../constants/coaches';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(280, width * 0.85); // Narrower sidebar

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSession: (session: ChatSession) => void;
    onNewChat: () => void;
    currentSessionId?: string;
    variant?: 'overlay' | 'permanent';
}

export const HistorySidebar = ({ isOpen, onClose, onSelectSession, onNewChat, currentSessionId, variant = 'overlay' }: HistorySidebarProps) => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    useEffect(() => {
        if (variant === 'permanent') {
            // No animation for permanent mode
            return;
        }

        if (isOpen) {
            loadSessions();
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true, // true for transform
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen, variant]);

    // Load sessions when permanent sidebar mounts or when forced
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        const chats = await StorageService.getChats();
        setSessions(chats);
    };

    const handleDelete = async (e: any, id: string) => {
        e.stopPropagation();
        Alert.alert(
            "Delete Chat",
            "Are you sure you want to delete this conversation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await StorageService.deleteChat(id);
                        loadSessions();
                    }
                }
            ]
        );
    };

    const handleGoHome = () => {
        if (variant === 'overlay') onClose();
        navigation.navigate('Discovery' as never);
    };

    // Group sessions by date
    const groupedSessions = sessions.reduce((acc, session) => {
        const date = new Date(session.lastModified);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let key = 'Previous 30 Days';
        if (date.toDateString() === today.toDateString()) key = 'Today';
        else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday';

        if (!acc[key]) acc[key] = [];
        acc[key].push(session);
        return acc;
    }, {} as Record<string, ChatSession[]>);

    const orderedKeys = ['Today', 'Yesterday', 'Previous 30 Days'].filter(k => groupedSessions[k]);

    if (variant === 'permanent') {
        if (!isOpen) return null; // Or return a collapsed view if we wanted that

        return (
            <View style={[styles.container, styles.permanentContainer, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.8}>
                        <Plus size={18} color={Colors.text.primary} />
                        <Text style={styles.newChatText}>New Chat</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {orderedKeys.map(key => (
                        <View key={key} style={styles.group}>
                            <Text style={styles.groupTitle}>{key}</Text>
                            {groupedSessions[key].map(session => {
                                const coach = COACHES.find(c => c.id === session.coachId);
                                const isActive = session.id === currentSessionId;
                                return (
                                    <TouchableOpacity
                                        key={session.id}
                                        style={[styles.sessionItem, isActive && styles.activeSession]}
                                        onPress={() => onSelectSession(session)}
                                    >
                                        <Text numberOfLines={1} style={[styles.sessionTitle, isActive && styles.activeText]}>
                                            {session.title}
                                        </Text>
                                        {isActive && (
                                            <TouchableOpacity onPress={(e) => handleDelete(e, session.id)} style={styles.deleteBtn}>
                                                <Trash2 size={14} color={Colors.text.muted} />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                    {sessions.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No history yet.</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleGoHome}>
                        <Home size={20} color={Colors.text.primary} />
                        <Text style={styles.menuItemText}>Back to Discovery</Text>
                    </TouchableOpacity>

                    <View style={styles.userRow}>
                        <View style={styles.avatar}>
                            {/* Initials could be dynamic */}
                            <Text style={styles.avatarText}>U</Text>
                        </View>
                        <Text style={styles.userName}>User</Text>
                    </View>
                </View>
            </View>
        );
    }

    // Overlay implementation (Mobile)
    return (
        <>
            {isOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                />
            )}
            <Animated.View style={[
                styles.container,
                styles.overlayContainer,
                { transform: [{ translateX: slideAnim }], paddingTop: insets.top }
            ]}>
                {/* <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={24} color={Colors.text.secondary} />
                    </TouchableOpacity> */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.8}>
                        <Plus size={18} color={Colors.text.primary} />
                        <Text style={styles.newChatText}>New Chat</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {orderedKeys.map(key => (
                        <View key={key} style={styles.group}>
                            <Text style={styles.groupTitle}>{key}</Text>
                            {groupedSessions[key].map(session => {
                                const coach = COACHES.find(c => c.id === session.coachId);
                                const isActive = session.id === currentSessionId;
                                return (
                                    <TouchableOpacity
                                        key={session.id}
                                        style={[styles.sessionItem, isActive && styles.activeSession]}
                                        onPress={() => onSelectSession(session)}
                                    >
                                        <Text numberOfLines={1} style={[styles.sessionTitle, isActive && styles.activeText]}>
                                            {session.title}
                                        </Text>
                                        {isActive && (
                                            <TouchableOpacity onPress={(e) => handleDelete(e, session.id)} style={styles.deleteBtn}>
                                                <Trash2 size={14} color={Colors.text.muted} />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                    {sessions.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No history yet.</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleGoHome}>
                        <Home size={20} color={Colors.text.primary} />
                        <Text style={styles.menuItemText}>Back to Discovery</Text>
                    </TouchableOpacity>

                    <View style={styles.userRow}>
                        <View style={styles.avatar}>
                            {/* Initials could be dynamic */}
                            <Text style={styles.avatarText}>U</Text>
                        </View>
                        <Text style={styles.userName}>User</Text>
                    </View>
                </View>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)', // Lighter overlay
        zIndex: 100,
    },
    container: {
        width: SIDEBAR_WIDTH,
        backgroundColor: '#F9FAFB',
        zIndex: 101,
        borderRightWidth: 1,
        borderRightColor: Colors.gray[200],
    },
    permanentContainer: {
        position: 'relative',
        height: '100%',
    },
    overlayContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: { elevation: 10 }
        })
    },
    header: {
        padding: Spacing.md,
        paddingBottom: Spacing.sm
    },
    newChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        marginBottom: Spacing.xs,
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    newChatText: {
        color: Colors.text.primary,
        fontWeight: '500',
        marginLeft: Spacing.md,
        fontSize: 14
    },
    closeBtn: {
        padding: Spacing.sm,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },
    group: {
        marginBottom: Spacing.lg,
    },
    groupTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.text.muted,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xs,
        marginTop: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    sessionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: Spacing.md,
        borderRadius: 6,
        marginHorizontal: 4
    },
    activeSession: {
        backgroundColor: Colors.gray[200],
    },
    sessionTitle: {
        fontSize: 14,
        color: Colors.text.primary,
        flex: 1,
        opacity: 0.9
    },
    activeText: {
        fontWeight: '600',
        opacity: 1
    },
    deleteBtn: {
        padding: 4,
        marginLeft: 4
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
        marginTop: Spacing.xl
    },
    emptyText: {
        color: Colors.text.muted,
        fontSize: 14
    },
    footer: {
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        backgroundColor: '#F9FAFB'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: Spacing.sm
    },
    menuItemText: {
        marginLeft: Spacing.md,
        fontSize: 14,
        color: Colors.text.primary,
        fontWeight: '500'
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100]
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary, // Pop color
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    avatarText: {
        color: Colors.white,
        fontWeight: '700',
        fontSize: 12,
    },
    userName: {
        fontWeight: '600',
        color: Colors.text.primary,
        fontSize: 14,
    }
});
