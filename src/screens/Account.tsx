import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography } from '../theme';

export const AccountScreen = () => {
    const navigation = useNavigation<any>();
    const { user, updateEmail, updatePassword, updateName } = useAuth();
    const { theme, colors } = useTheme();

    const [isLoading, setIsLoading] = useState(false);

    // Name State
    const [name, setName] = useState(user?.name || '');
    const [isNameDirty, setIsNameDirty] = useState(false);

    // Email State
    const [email, setEmail] = useState(user?.email || '');
    const [isEmailDirty, setIsEmailDirty] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async () => {
        if (!email || !email.includes('@')) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        if (!name.trim()) {
            Alert.alert('Invalid Name', 'Name cannot be empty.');
            return;
        }

        setIsLoading(true);
        try {
            if (isEmailDirty) await updateEmail(email);
            if (isNameDirty) await updateName(name);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Profile updated successfully.');
            setIsEmailDirty(false);
            setIsNameDirty(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all password fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'New passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            await updatePassword(currentPassword, newPassword);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Error', 'Failed to update password. Check your current password.');
        } finally {
            setIsLoading(false);
        }
    };

    const bgColor = theme === 'dark' ? '#0F172A' : '#F8FAFC';
    const cardColor = theme === 'dark' ? '#1E293B' : '#FFFFFF';
    const textColor = theme === 'dark' ? '#F8FAFC' : '#0F172A';
    const subTextColor = theme === 'dark' ? '#94A3B8' : '#64748B';
    const inputBg = theme === 'dark' ? '#334155' : '#F1F5F9';
    const borderColor = theme === 'dark' ? '#334155' : '#E2E8F0';

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>Account</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {/* Profile Section */}
                        <Text style={[styles.sectionTitle, { color: subTextColor }]}>Profile</Text>
                        <View style={[styles.card, { backgroundColor: cardColor, borderColor, borderWidth: 1 }]}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: subTextColor }]}>Full Name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                    value={name}
                                    onChangeText={(t) => {
                                        setName(t);
                                        setIsNameDirty(t !== user?.name);
                                    }}
                                    placeholder="Enter full name"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>

                            <View style={styles.separator} />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: subTextColor }]}>Email Address</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                    value={email}
                                    onChangeText={(t) => {
                                        setEmail(t);
                                        setIsEmailDirty(t !== user?.email);
                                    }}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {(isEmailDirty || isNameDirty) && (
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                    onPress={handleUpdateProfile}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Update Profile</Text>}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Security Section */}
                        <Text style={[styles.sectionTitle, { color: subTextColor, marginTop: 24 }]}>Security</Text>
                        <View style={[styles.card, { backgroundColor: cardColor, borderColor, borderWidth: 1 }]}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: subTextColor }]}>Current Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry
                                    placeholder="Enter current password"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: subTextColor }]}>New Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                    placeholder="Enter new password"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: subTextColor }]}>Confirm New Password</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                    placeholderTextColor={subTextColor}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
                                onPress={handleChangePassword}
                                disabled={isLoading}
                            >
                                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Change Password</Text>}
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        borderRadius: 16,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    helperText: {
        fontSize: 12,
        marginTop: 4,
    },
    separator: {
        height: 16,
    },
    saveBtn: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    }
});
