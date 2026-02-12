import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Colors } from '../theme';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: 'grid', route: 'Dashboard' },
    { name: 'Discovery', icon: 'compass', route: 'Discovery' },
    { name: 'Schedule', icon: 'calendar', route: 'Schedule' },
    { name: 'Quotes', icon: 'message-circle', route: 'Quotes' },
    { name: 'Settings', icon: 'settings', route: 'Settings' },
];

// Get initials for avatar
const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const Sidebar = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors, theme } = useTheme();
    const { user } = useAuth();

    const activeRoute = route.name;

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderRightColor: colors.cardBorder }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {/* Brand */}
                <View style={styles.brandContainer}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                        <Text style={styles.logoText}>S</Text>
                    </View>
                    <Text style={[styles.brandName, { color: colors.text.primary }]}>Aura</Text>
                </View>

                {/* Menu */}
                <View style={styles.menuContainer}>
                    {MENU_ITEMS.map((item) => {
                        const isActive = activeRoute === item.route;
                        return (
                            <TouchableOpacity
                                key={item.name}
                                style={[
                                    styles.menuItem,
                                    isActive && { backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.2)' : '#EEF2FF' }
                                ]}
                                onPress={() => navigation.navigate(item.route as any)}
                            >
                                <Feather
                                    name={item.icon as any}
                                    size={20}
                                    color={isActive ? colors.primary : colors.text.secondary}
                                />
                                <Text style={[
                                    styles.menuText,
                                    { color: isActive ? colors.primary : colors.text.secondary, fontWeight: isActive ? '600' : '500' }
                                ]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* User Profile */}
                <View style={[styles.profileContainer, { borderTopColor: colors.cardBorder, marginTop: 'auto' }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.gray[200] }]}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.gray[600] }}>
                            {getInitials(user?.name)}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: colors.text.primary }]}>
                            {user?.name || 'Guest'}
                        </Text>
                        <Text style={[styles.profileRole, { color: colors.text.secondary }]}>
                            {user?.plan === 'pro' ? 'Pro Member' : 'Free Member'}
                        </Text>
                    </View>
                    <TouchableOpacity>
                        <Feather name="more-vertical" size={20} color={colors.text.secondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 260,
        height: '100%',
        borderRightWidth: 1,
        padding: Spacing.lg,
        display: Platform.OS === 'web' ? 'flex' : 'none', // Hide on mobile for now
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    },
    brandName: {
        fontSize: 20,
        fontWeight: '700',
    },
    menuContainer: {
        flex: 1,
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
    },
    menuText: {
        fontSize: 15,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 14,
        fontWeight: '600',
    },
    profileRole: {
        fontSize: 12,
    },
});
