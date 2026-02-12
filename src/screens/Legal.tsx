import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography } from '../theme';
import { ArrowLeft, Shield, FileText } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    navigation: any;
    route: any;
};

export const LegalScreen = ({ navigation, route }: Props) => {
    const { colors, theme } = useTheme();
    const { type } = route.params || { type: 'terms' }; // 'terms' or 'privacy'

    const isTerms = type === 'terms';
    const title = isTerms ? 'Terms of Service' : 'Privacy Policy';
    const lastUpdated = 'February 12, 2026';
    const Icon = isTerms ? FileText : Shield;

    const content = isTerms ? (
        <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>1. Acceptance of Terms</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    By accessing or using Shipyard, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not use our service.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>2. Use License</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    Permission is granted to temporarily download one copy of the materials (information or software) on Shipyard for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>3. Disclaimer</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    The materials on Shipyard are provided on an 'as is' basis. Shipyard makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement.
                </Text>
            </View>
        </>
    ) : (
        <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>1. Information Collection</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. We may also collect information about your usage of the app to improve our services.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>2. Data Usage</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    We use the information we collect to operate, maintain, and improve our services, including to personalize your experience, provide customer support, and send you technical notices and updates.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>3. Data Protection</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.
                </Text>

                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>4. Contact Us</Text>
                <Text style={[styles.paragraph, { color: colors.text.secondary }]}>
                    If you have any questions about this Privacy Policy, please contact us at: abuxcho@icloud.com
                </Text>
            </View>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backBtn, { backgroundColor: theme === 'dark' ? colors.card : colors.white, borderColor: colors.cardBorder }]}
                    >
                        <ArrowLeft size={20} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Legal</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.titleContainer}>
                        <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#E0E7FF' }]}>
                            <Icon size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.pageTitle, { color: colors.text.primary }]}>{title}</Text>
                        <Text style={[styles.lastUpdated, { color: colors.text.muted }]}>Last Updated: {lastUpdated}</Text>
                    </View>

                    {content}

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.text.muted }]}>
                            &copy; 2026 Shipyard Inc. All rights reserved.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
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
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    pageTitle: {
        ...Typography.h2,
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
    },
    card: {
        borderRadius: 24,
        padding: Spacing.xl,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginTop: Spacing.md,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        marginBottom: Spacing.md,
        opacity: 0.9,
    },
    footer: {
        marginTop: Spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
    }
});
