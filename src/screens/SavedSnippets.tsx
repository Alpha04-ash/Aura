import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, SafeAreaView } from 'react-native';
import { Colors, Spacing } from '../theme';
import { ChevronLeft, Copy, Share as ShareIcon, Trash2, Bookmark } from 'lucide-react-native';
import { Snippet, SnippetService } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export const SavedSnippetsScreen = ({ navigation }: any) => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadSnippets();
        }, [])
    );

    const loadSnippets = async () => {
        const data = await SnippetService.getSnippets();
        setSnippets(data);
    };

    const handleCopy = async (content: string) => {
        await Clipboard.setStringAsync(content);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleShare = async (content: string) => {
        await Share.share({ message: content });
    };

    const handleDelete = async (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await SnippetService.deleteSnippet(id);
        loadSnippets();
    };

    const renderSnippet = ({ item }: { item: Snippet }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.coachBadge}>
                    <Text style={styles.coachName}>{item.coachName}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>

            <Text style={styles.content}>{item.content}</Text>

            <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => handleCopy(item.content)} style={styles.actionBtn}>
                    <Copy size={16} color={Colors.text.secondary} />
                    <Text style={styles.actionText}>Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleShare(item.content)} style={styles.actionBtn}>
                    <ShareIcon size={16} color={Colors.text.secondary} />
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                    <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFFFFF', '#F3E8FF']} // Luminous Rose tint
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Saved Wisdom</Text>
                    <View style={{ width: 24 }} />
                </View>

                {snippets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Bookmark size={32} color={Colors.text.muted} />
                        </View>
                        <Text style={styles.emptyText}>No saved moments yet.</Text>
                        <Text style={styles.emptySubtext}>Long press any message in chat to save it here.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={snippets}
                        renderItem={renderSnippet}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    listContent: {
        padding: Spacing.lg,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 24,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#E9E9EF',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    coachBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    coachName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    date: {
        fontSize: 12,
        color: Colors.text.muted,
    },
    content: {
        fontSize: 16,
        color: Colors.text.primary,
        lineHeight: 24,
        marginBottom: Spacing.lg,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: Spacing.md,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.text.secondary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
