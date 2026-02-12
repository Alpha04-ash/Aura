import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Switch,
    Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Typography } from '../theme';
import {
    ArrowLeft,
    User,
    LogOut,
    ChevronRight,
    BrainCircuit,
    Crown,
    LifeBuoy,
    FileText,
    Shield,
    Moon,
    X,
    Check
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MotiView } from 'moti';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, colors } = useTheme();
    const [isContextModalVisible, setIsContextModalVisible] = useState(false);

    // Context Form State
    const [values, setValues] = useState('');
    const [goals, setGoals] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Preferences
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSaveContext = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
            setIsContextModalVisible(false);
        }, 1500);
    };

    const handleSignOut = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await logout();
    };

    // Dynamic Styles based on theme
    const themeStyles = {
        container: { backgroundColor: colors.background },
        header: { backgroundColor: colors.card, borderBottomColor: colors.cardBorder },
        text: { color: colors.text.primary },
        textSecondary: { color: colors.text.secondary },
        card: { backgroundColor: colors.card },
        input: { backgroundColor: theme === 'dark' ? colors.cardBorder : colors.white, color: colors.text.primary, borderColor: colors.cardBorder }
    };

    const SettingItem = ({ icon: Icon, label, value, onPress, isDestructive = false, showChevron = true }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, isDestructive && styles.destructiveIcon, { backgroundColor: theme === 'dark' ? colors.cardBorder : '#F8FAFC' }]}>
                    <Icon size={20} color={isDestructive ? colors.error : colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: isDestructive ? colors.error : colors.text.primary }]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={[styles.settingValue, { color: colors.text.secondary }]}>{value}</Text>}
                {showChevron && <ChevronRight size={18} color={colors.text.muted} />}
            </View>
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{title}</Text>
    );

    const Wrapper = Platform.OS === 'web' ? View : SafeAreaView;
    const wrapperProps = Platform.OS === 'web'
        ? { style: { flex: 1, overflow: 'hidden', height: '100%', display: 'flex' as 'flex', flexDirection: 'column' as 'column' } }
        : { style: { flex: 1 } };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Wrapper {...wrapperProps}>
                <ScrollView
                    style={[styles.content, { flex: 1, height: '100%' }]}
                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.header, themeStyles.header]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <ArrowLeft size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.title, themeStyles.text]}>Settings</Text>
                        <View style={{ width: 44 }} />
                    </View>



                    {/* Account Section */}
                    <View style={[styles.profileCard, themeStyles.card]}>
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                            </Text>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, themeStyles.text]}>{user?.name || 'Guest User'}</Text>
                            <Text style={[styles.userEmail, themeStyles.textSecondary]}>{user?.email || 'Not signed in'}</Text>
                        </View>
                        <View style={[styles.planBadge, { backgroundColor: theme === 'dark' ? colors.cardBorder : '#F1F5F9' }]}>
                            <Text style={[styles.planText, themeStyles.textSecondary]}>FREE</Text>
                        </View>
                    </View>

                    <SectionHeader title="Account" />
                    <View style={[styles.sectionContainer, themeStyles.card]}>
                        <SettingItem
                            icon={User}
                            label="Profile & Security"
                            showChevron
                            onPress={() => navigation.navigate('Account')}
                            value="Manage"
                        />
                    </View>

                    <SectionHeader title="Intelligence" />
                    <View style={[styles.sectionContainer, themeStyles.card]}>
                        <SettingItem
                            icon={BrainCircuit}
                            label="Personal Context"
                            value="Edit"
                            onPress={() => setIsContextModalVisible(true)}
                        />
                    </View>

                    <SectionHeader title="Subscription" />
                    <View style={[styles.sectionContainer, themeStyles.card]}>
                        <SettingItem
                            icon={Crown}
                            label="Upgrade to Pro"
                            onPress={() => navigation.navigate('Paywall')}
                            value="Unlock All"
                        />
                    </View>

                    <SectionHeader title="Preferences" />
                    <View style={[styles.sectionContainer, themeStyles.card]}>
                        <View style={[styles.settingItem, { borderBottomColor: colors.cardBorder }]}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? colors.cardBorder : '#F8FAFC' }]}>
                                    <Moon size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.settingLabel, themeStyles.text]}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={toggleTheme}
                                trackColor={{ false: theme === 'dark' ? '#334155' : '#E2E8F0', true: colors.primary }}
                            />
                        </View>
                    </View>

                    <SectionHeader title="Support" />
                    <View style={[styles.sectionContainer, themeStyles.card]}>
                        <SettingItem
                            icon={LifeBuoy}
                            label="Help Center"
                            showChevron
                            onPress={() => Linking.openURL('mailto:abuxcho@icloud.com')}
                            value="Contact Us"
                        />
                        {/* Display Contact Info Directly */}
                        <View style={[styles.settingItem, { borderBottomColor: colors.cardBorder, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
                            <Text style={{ fontSize: 14, color: colors.text.secondary }}>Email: abuxcho@icloud.com</Text>
                            <Text style={{ fontSize: 14, color: colors.text.secondary }}>Phone: +992 94 222 8888</Text>
                        </View>

                        <SettingItem
                            icon={FileText}
                            label="Terms of Service"
                            showChevron
                            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
                        />
                        <SettingItem
                            icon={Shield}
                            label="Privacy Policy"
                            showChevron
                            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
                        />
                    </View>

                    <View style={[styles.sectionContainer, themeStyles.card, { marginTop: Spacing.xl, marginBottom: Spacing.xxl }]}>
                        <SettingItem
                            icon={LogOut}
                            label="Sign Out"
                            isDestructive
                            showChevron={false}
                            onPress={handleSignOut}
                        />
                    </View>

                    <Text style={[styles.versionText, themeStyles.textSecondary]}>Shipyard v1.0.0 (Build 2026.02)</Text>

                </ScrollView>
            </Wrapper>

            {/* Context Modal */}
            <Modal
                visible={isContextModalVisible}
                animationType="slide"
                presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
                onRequestClose={() => setIsContextModalVisible(false)}
            >
                <SafeAreaView style={[styles.modalContainer, themeStyles.container]}>
                    <View style={[styles.modalHeader, themeStyles.header]}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>Personal Context</Text>
                        <TouchableOpacity onPress={() => setIsContextModalVisible(false)} style={styles.closeBtn}>
                            <X size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <ScrollView contentContainerStyle={styles.modalContent}>
                            <Text style={[styles.modalDescription, themeStyles.textSecondary]}>
                                Our AI coaches use this context to tailor their guidance specifically to you.
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.primary }]}>Core Values</Text>
                                <TextInput
                                    style={[styles.textArea, themeStyles.input]}
                                    placeholder="e.g., Essentialism, Deep Work, Family First..."
                                    value={values}
                                    onChangeText={setValues}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor={colors.text.muted}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: colors.primary }]}>Current Goals</Text>
                                <TextInput
                                    style={[styles.textArea, themeStyles.input]}
                                    placeholder="e.g., Launching a new product, learning Swift..."
                                    value={goals}
                                    onChangeText={setGoals}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor={colors.text.muted}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, isSaved && styles.saveButtonSuccess, { backgroundColor: isSaved ? colors.success : colors.primary }]}
                                onPress={handleSaveContext}
                                activeOpacity={0.8}
                            >
                                {isSaved ? (
                                    <>
                                        <Check size={20} color={colors.white} />
                                        <Text style={[styles.saveButtonText, { color: colors.white }]}>Saved</Text>
                                    </>
                                ) : (
                                    <Text style={[styles.saveButtonText, { color: colors.white }]}>Save Context</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    headerBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...Typography.h3,
        fontSize: 18,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 16,
        marginBottom: Spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        ...Typography.h3,
        fontSize: 18,
        marginBottom: 2,
    },
    userEmail: {
        ...Typography.caption,
        textTransform: 'none',
        fontSize: 14,
    },
    planBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    planText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sectionHeader: {
        ...Typography.caption,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
        marginTop: Spacing.lg,
    },
    sectionContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    destructiveIcon: {
        backgroundColor: '#FEF2F2',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    destructiveLabel: {
        // Handled dynamically
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingValue: {
        fontSize: 14,
        marginRight: Spacing.sm,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
    },
    modalTitle: {
        ...Typography.h2,
        fontSize: 20,
    },
    closeBtn: {
        padding: 4,
    },
    modalContent: {
        padding: Spacing.lg,
    },
    modalDescription: {
        ...Typography.body,
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.xl,
    },
    inputLabel: {
        ...Typography.caption,
        marginBottom: Spacing.sm,
    },
    textArea: {
        borderRadius: 12,
        padding: Spacing.md,
        minHeight: 120,
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    saveButton: {
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.md,
        flexDirection: 'row',
    },
    saveButtonSuccess: {
        // Handled dynamically
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
