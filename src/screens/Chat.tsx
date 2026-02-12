import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    useWindowDimensions
} from 'react-native';
import { Spacing } from '../theme';
import { Send, ChevronLeft, Menu, Sparkles } from 'lucide-react-native';
import { COACHES } from '../constants/coaches';
import { getCoachResponse } from '../services/openai';
import { RevenueCatService } from '../services/revenuecat';
import { SnippetService, StorageService, ChatSession } from '../services/storage';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { TypingIndicator } from '../components/TypingIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import { HistorySidebar } from '../components/HistorySidebar';
import { useTheme } from '../context/ThemeContext';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const ChatScreen = ({ route, navigation }: any) => {
    const { theme, colors } = useTheme();

    // Force mobile layout logic even on larger screens since we are in a phone frame
    const isDesktop = false;

    const { coachId, sessionId } = route.params || {};
    const coach = COACHES.find(c => c.id === coachId);

    // Redirect if no coach (e.g. direct navigation error)
    useEffect(() => {
        if (!coachId || !coach) {
            // If we are in a tab/sidebar layout, we might want to default to something or go back
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('Discovery');
        }
    }, [coachId, coach]);

    if (!coach) return <View style={{ flex: 1, backgroundColor: colors.background }} />; // Render empty while redirecting

    // State
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Refs
    const flatListRef = useRef<FlatList>(null);

    // Initial Load
    useEffect(() => {
        const loadChat = async () => {
            // Reset state first to avoid stale data
            if (sessionId && sessionId !== currentSessionId) {
                const navId = sessionId.toString();
                const session = await StorageService.getChat(navId);
                if (session) {
                    setMessages(session.messages);
                    setCurrentSessionId(navId);
                    return;
                }
            } else if (!sessionId && !currentSessionId) {
                // Really new chat
                setMessages([{
                    id: '1',
                    role: 'assistant',
                    content: `Hello. I am ${coach?.name}. ${coach?.role}. How can I help you find clarity today?`
                }]);
                setCurrentSessionId(Date.now().toString());
            }
        };
        loadChat();
    }, [sessionId, coach]);

    // Force reload when selecting from sidebar (if it's the same coach)
    const handleSelectSession = async (session: ChatSession) => {
        setIsSidebarOpen(false);
        if (session.coachId !== coachId) {
            // Switch coach -> Replace screen
            navigation.replace('Chat', { coachId: session.coachId, sessionId: session.id });
        } else {
            // Same coach -> Just reload data
            setCurrentSessionId(session.id);
            setMessages(session.messages);
        }
    };

    const handleNewChat = () => {
        setIsSidebarOpen(false);
        // If we are already on a "new" chat for this coach, do nothing or reset
        if (messages.length <= 1) return;

        // Start fresh
        const newId = Date.now().toString();
        setMessages([{
            id: '1',
            role: 'assistant',
            content: `Hello. I am ${coach?.name}. ${coach?.role}. How can I help you find clarity today?`
        }]);
        setCurrentSessionId(newId);
        // Clear params
        navigation.setParams({ sessionId: undefined });
    };

    // Auto-Save Effect
    useEffect(() => {
        if (!currentSessionId || messages.length <= 1) return;

        const saveSession = async () => {
            const userEncodedMessages = messages.filter(m => m.role === 'user');
            let title = 'New Conversation';
            if (userEncodedMessages.length > 0) {
                // Simple title generation strategy: First 5 words of first message
                title = userEncodedMessages[0].content.split(' ').slice(0, 5).join(' ') + '...';
            }

            const session: ChatSession = {
                id: currentSessionId,
                coachId: coachId,
                title: title,
                messages: messages,
                lastModified: Date.now(),
                preview: messages[messages.length - 1].content.substring(0, 100)
            };
            await StorageService.saveChat(session);
        };
        saveSession();
    }, [messages, currentSessionId]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputText('');

        if (newMessages.filter(m => m.role === 'user').length >= 5) {
            const pro = await RevenueCatService.isPremium();
            if (!pro) {
                navigation.navigate('Paywall');
                return;
            }
        }

        setIsLoading(true);

        // Prepare API messages including the hidden system prompt
        const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

        let systemPrompt = coach?.systemPrompt || '';

        // Inject Schedule for Marcus
        if (coach?.id === 'marcus') {
            try {
                // Get today's schedule using local time logic (same as Schedule.tsx)
                const d = new Date();
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                const today = d.toISOString().split('T')[0];

                const schedule = await StorageService.getSchedule(today);

                if (schedule && schedule.length > 0) {
                    const scheduleText = schedule.map(block =>
                        `- ${block.time}: ${block.activity} (${block.status}) ${block.description ? `[${block.description}]` : ''}`
                    ).join('\n');

                    systemPrompt += `\n\nHere is the user's schedule for today (${today}):\n${scheduleText}\n\nUse this context to give specific time-management advice.`;
                } else {
                    systemPrompt += `\n\nThe user has no tasks scheduled for today (${today}). Encourage them to plan their day.`;
                }
            } catch (e) {
                console.log('Failed to inject schedule context', e);
            }
        }

        apiMessages.unshift({ role: 'system', content: systemPrompt });

        const aiResponse = await getCoachResponse(apiMessages);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    const handleLongPress = (content: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
            "Save Snippet",
            "Keep this wisdom in your collection?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: async () => {
                        await SnippetService.saveSnippet({
                            content,
                            coachName: coach?.name || 'Aura',
                            tags: [coach?.role || 'General']
                        });
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                }
            ]
        );
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        return (
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    !isUser && {
                        backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', // Slate-800 for dark mode bubbles
                        borderColor: theme === 'dark' ? '#334155' : '#F1F5F9' // Slate-700 border
                    }
                ]}
            >
                {isUser ? (
                    <View style={[styles.userBubbleContent, { backgroundColor: colors.primary }]}>
                        <Text style={styles.userText}>{item.content}</Text>
                    </View>
                ) : (
                    <TouchableOpacity onLongPress={() => handleLongPress(item.content)} activeOpacity={0.9}>
                        <View style={styles.assistantBubbleContent}>
                            <Text style={[styles.assistantText, { color: colors.text.primary }]}>{item.content}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </MotiView>
        );
    };

    // Dynamic styles based on theme
    const themeGradient = theme === 'dark'
        ? ['#0F172A', '#1E293B'] as const // Slate-900 to Slate-800
        : ['#FFFFFF', '#F9FAFB'] as const;

    const navHeaderStyle = {
        backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255,255,255,0.9)',
        borderBottomColor: theme === 'dark' ? '#334155' : '#E2E8F0'
    };

    const inputWrapperStyle = {
        backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
        borderTopColor: theme === 'dark' ? '#334155' : '#F1F5F9'
    };

    const inputContainerStyle = {
        backgroundColor: theme === 'dark' ? '#1E293B' : '#F8FAFC',
        borderColor: theme === 'dark' ? '#334155' : '#E2E8F0'
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <HistorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                currentSessionId={currentSessionId}
                variant="overlay"
            />

            <View style={styles.chatContent}>
                <LinearGradient
                    colors={themeGradient}
                    style={StyleSheet.absoluteFill}
                />

                <SafeAreaView style={styles.safeArea}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => setIsSidebarOpen(!isSidebarOpen)} style={styles.headerBtn}>
                                <Menu size={24} color={colors.text.primary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (navigation.canGoBack()) {
                                        navigation.goBack();
                                    } else {
                                        navigation.navigate('Discovery');
                                    }
                                }}
                                style={[styles.headerBtn, { marginLeft: 8 }]}
                            >
                                <ChevronLeft size={24} color={colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                                {coach?.name || 'Chat'}
                            </Text>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.statusText}>🔥 3 Day Streak</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handleNewChat} style={styles.headerBtn}>
                            <Sparkles size={20} color={colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        style={styles.messageListContainer}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        ListFooterComponent={() => isLoading ? (
                            <View style={styles.typingContainer}>
                                <TypingIndicator />
                                <Text style={styles.typingText}>{coach?.name} is thinking...</Text>
                            </View>
                        ) : null}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                    >
                        <View style={[styles.inputWrapper, inputWrapperStyle]}>
                            <View style={[styles.inputContainer, inputContainerStyle]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="Type your message..."
                                    placeholderTextColor={colors.text.secondary}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    selectionColor={colors.primary}
                                />
                                <TouchableOpacity
                                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || isLoading}
                                >
                                    <View style={[styles.sendIconWrapper, { backgroundColor: inputText.trim() ? colors.primary : (theme === 'dark' ? '#334155' : '#E2E8F0') }]}>
                                        <Send size={18} color={'#FFFFFF'} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Removed fixed positioning here!
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    chatContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: Platform.OS === 'web' ? '100%' : 'auto',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        flexShrink: 0, // Don't shrink
        backgroundColor: 'inherit',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    messageListContainer: {
        flex: 1,
        minHeight: 0, // Critical for web flex containers to scroll
        ...Platform.select({
            web: {
                overflowY: 'auto' as any,
                height: '100%', // Use 100% instead of 0px for better compatibility if 0px fails type check
                flexBasis: 'auto',
            }
        })
    },
    messageList: {
        padding: Spacing.lg,
        paddingBottom: Spacing.lg,
        flexGrow: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        marginBottom: Spacing.md,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    userBubbleContent: {
        padding: Spacing.md,
        borderRadius: 20,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
    },
    assistantBubbleContent: {
        padding: Spacing.md,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    userText: {
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    assistantText: {
        fontSize: 16,
        lineHeight: 24,
    },
    inputWrapper: {
        width: '100%',
        padding: Spacing.md,
        borderTopWidth: 1,
        backgroundColor: 'inherit',
        flexShrink: 0, // Ensure it doesn't shrink
        // No absolute positioning - sit naturally at bottom of flex column
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 28,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        paddingHorizontal: Spacing.md,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        fontSize: 16,
        maxHeight: 120,
        ...Platform.select({
            web: {
                outlineStyle: 'none' as any,
            },
        }),
    },
    sendBtn: {
        padding: 4,
    },
    sendIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnDisabled: {
        opacity: 0.7,
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    typingText: {
        fontSize: 12,
        color: '#94A3B8',
        marginLeft: Spacing.sm,
    },
});
