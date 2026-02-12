import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    FlatList,
    Alert,
    Share,
    Platform,
    KeyboardAvoidingView,
    Dimensions
} from 'react-native';
import { Spacing, Typography } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { StorageService, Quote } from '../services/storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export const QuotesScreen = () => {
    const navigation = useNavigation<any>();
    const { theme, colors } = useTheme();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [newQuoteText, setNewQuoteText] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);

    // Initial seed quotes
    const SEED_QUOTES = [
        { id: '1', text: "The only way to do great work is to love what you do.", author: "Steve Jobs", isCustom: false },
        { id: '2', text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", isCustom: false },
        { id: '3', text: "Focus on being productive instead of busy.", author: "Tim Ferriss", isCustom: false },
        { id: '4', text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", isCustom: false },
        { id: '5', text: "The best way to predict the future is to wait for it.", author: "Alan Kay", isCustom: false },
    ];

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        try {
            const stored = await StorageService.getQuotes();
            // Combine stored custom quotes with seed quotes, ensure unique by ID just in case
            const combined = [...SEED_QUOTES, ...(stored || [])];
            // Remove duplicates based on ID
            const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
            setQuotes(unique);
        } catch (e) {
            console.error("Failed to load quotes", e);
            setQuotes(SEED_QUOTES);
        }
    };

    const openAdd = () => {
        setEditingId(null);
        setNewQuoteText('');
        setIsAdding(true);
        Haptics.selectionAsync();
    };

    const openEdit = (quote: Quote) => {
        setEditingId(quote.id);
        setNewQuoteText(quote.text);
        setIsAdding(true);
        Haptics.selectionAsync();
    };

    const handleSave = async () => {
        if (!newQuoteText.trim()) {
            setIsAdding(false);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (editingId) {
            // Update existing
            await StorageService.updateQuote(editingId, newQuoteText);
            setQuotes(prev => prev.map(q => q.id === editingId ? { ...q, text: newQuoteText } : q));
        } else {
            // Add new
            const added = await StorageService.saveQuote(newQuoteText, 'Me');
            setQuotes(prev => [added, ...prev]);
        }

        setNewQuoteText('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await StorageService.deleteQuote(id);
        setQuotes(prev => prev.filter(q => q.id !== id));
    };

    const handleShare = async (text: string, author: string) => {
        try {
            await Share.share({
                message: `"${text}" - ${author}`,
            });
        } catch (error) {
            // ignore
        }
    };

    const renderQuote = ({ item, index }: { item: Quote, index: number }) => {
        const cardGradient = theme === 'dark'
            ? ['#1E293B', '#0F172A']
            : ['#FFFFFF', '#F8FAFC'];

        return (
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', delay: index * 100, duration: 350 }}
            >
                <View style={[styles.card, {
                    shadowColor: colors.primary,
                    borderColor: theme === 'dark' ? '#334155' : 'transparent',
                    borderWidth: theme === 'dark' ? 1 : 0
                }]}>
                    <LinearGradient
                        colors={cardGradient as any}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    <Feather
                        name="message-circle"
                        size={40}
                        color={colors.primary}
                        style={{ opacity: 0.1, position: 'absolute', top: 20, left: 20 }}
                    />

                    <View style={styles.cardContent}>
                        <Text style={[styles.quoteText, { color: colors.text.primary }]}>"{item.text}"</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md }}>
                            <View style={{ height: 1, width: 20, backgroundColor: colors.text.secondary, marginRight: 8 }} />
                            <Text style={[styles.quoteAuthor, { color: colors.text.secondary }]}>{item.author}</Text>
                        </View>
                    </View>

                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => handleShare(item.text, item.author)} style={[styles.actionBtn, { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' }]}>
                            <Feather name="share-2" size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        {item.isCustom && (
                            <>
                                <TouchableOpacity onPress={() => openEdit(item)} style={[styles.actionBtn, { backgroundColor: theme === 'dark' ? '#334155' : '#F1F5F9' }]}>
                                    <Feather name="edit-2" size={16} color={colors.text.secondary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, { backgroundColor: theme === 'dark' ? '#451A03' : '#FEF2F2' }]}>
                                    <Feather name="trash-2" size={16} color={theme === 'dark' ? '#F87171' : '#EF4444'} />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </MotiView>
        );
    };

    // Screen Background Gradient
    const bgGradient = theme === 'dark'
        ? ['#020617', '#0F172A', '#1E1B4B'] as const // Deep space
        : ['#F8FAFC', '#F1F5F9', '#CBD5E1'] as const;

    const Wrapper = Platform.OS === 'web' ? View : KeyboardAvoidingView;
    const wrapperProps = Platform.OS === 'web'
        ? { style: { flex: 1, height: '100%' } }
        : { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: { flex: 1 } };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <LinearGradient
                colors={bgGradient}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {Platform.OS === 'web' ? (
                <View style={{ flex: 1, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <FlatList
                        style={{ flex: 1, height: '100%' }}
                        data={quotes}
                        renderItem={renderQuote}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            <>
                                <View style={[styles.header, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (navigation.canGoBack()) {
                                                navigation.goBack();
                                            } else {
                                                navigation.navigate('Discovery');
                                            }
                                        }}
                                        style={[styles.iconBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#FFFFFF' }]}
                                    >
                                        <Feather name="chevron-left" size={24} color={colors.text.primary} />
                                    </TouchableOpacity>

                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Daily Wisdom</Text>
                                        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Fuel your mind</Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={openAdd}
                                        style={[styles.iconBtn, { backgroundColor: colors.primary }]}
                                    >
                                        <Feather name="plus" size={24} color={'#FFFFFF'} />
                                    </TouchableOpacity>
                                </View>

                                {isAdding && (
                                    <MotiView
                                        from={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 200 }}
                                        transition={{ type: 'timing', duration: 300 }}
                                        style={[styles.addSection, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderBottomColor: theme === 'dark' ? '#334155' : '#E2E8F0' }]}
                                    >
                                        <TextInput
                                            style={[styles.input, { color: colors.text.primary }]}
                                            placeholder="Type your affirmation or favorite quote..."
                                            placeholderTextColor={colors.text.secondary}
                                            value={newQuoteText}
                                            onChangeText={setNewQuoteText}
                                            multiline
                                            autoFocus
                                        />
                                        <View style={styles.addActions}>
                                            <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.cancelBtn}>
                                                <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.saveText}>{editingId ? 'Update' : 'Save'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </MotiView>
                                )}
                            </>
                        }

                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Feather name="star" size={48} color={colors.gray[300]} />
                                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>Add your first nugget of wisdom.</Text>
                            </View>
                        }
                    />
                </View>
            ) : (
                <SafeAreaView style={styles.safeArea}>
                    <Wrapper {...(wrapperProps as any)}>
                        <FlatList
                            data={quotes}
                            renderItem={renderQuote}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <>
                                    <View style={[styles.header, { borderBottomColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                if (navigation.canGoBack()) {
                                                    navigation.goBack();
                                                } else {
                                                    navigation.navigate('Discovery');
                                                }
                                            }}
                                            style={[styles.iconBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#FFFFFF' }]}
                                        >
                                            <Feather name="chevron-left" size={24} color={colors.text.primary} />
                                        </TouchableOpacity>

                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Daily Wisdom</Text>
                                            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Fuel your mind</Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={openAdd}
                                            style={[styles.iconBtn, { backgroundColor: colors.primary }]}
                                        >
                                            <Feather name="plus" size={24} color={'#FFFFFF'} />
                                        </TouchableOpacity>
                                    </View>

                                    {isAdding && (
                                        <MotiView
                                            from={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 200 }}
                                            transition={{ type: 'timing', duration: 300 }}
                                            style={[styles.addSection, { backgroundColor: theme === 'dark' ? '#1E293B' : '#FFFFFF', borderBottomColor: theme === 'dark' ? '#334155' : '#E2E8F0' }]}
                                        >
                                            <TextInput
                                                style={[styles.input, { color: colors.text.primary }]}
                                                placeholder="Type your affirmation or favorite quote..."
                                                placeholderTextColor={colors.text.secondary}
                                                value={newQuoteText}
                                                onChangeText={setNewQuoteText}
                                                multiline
                                                autoFocus
                                            />
                                            <View style={styles.addActions}>
                                                <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.cancelBtn}>
                                                    <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                                                    <Text style={styles.saveText}>{editingId ? 'Update' : 'Save'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </MotiView>
                                    )}
                                </>
                            }

                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Feather name="star" size={48} color={colors.gray[300]} />
                                    <Text style={[styles.emptyText, { color: colors.text.secondary }]}>Add your first nugget of wisdom.</Text>
                                </View>
                            }
                        />
                    </Wrapper>
                </SafeAreaView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
        zIndex: 10,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    list: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 24,
        padding: Spacing.xl,
        marginBottom: Spacing.lg,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        overflow: 'hidden',
    },
    cardContent: {
        alignItems: 'center',
        marginVertical: Spacing.sm,
    },
    quoteText: {
        fontSize: 19,
        fontWeight: '600',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 30,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', // More "quote-like" font
    },
    quoteAuthor: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: Spacing.lg,
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addSection: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
    },
    input: {
        fontSize: 18,
        marginBottom: Spacing.md,
        minHeight: 120,
        textAlignVertical: 'top',
        lineHeight: 28,
    },
    addActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: Spacing.md,
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveBtn: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    saveText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.7,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: 16,
    }
});
