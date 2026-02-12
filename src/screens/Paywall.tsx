import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { X, Check, Zap, Star, ShieldCheck, Crown } from 'lucide-react-native';
import { RevenueCatService } from '../services/revenuecat';
import { PurchasesPackage } from 'react-native-purchases';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export const PaywallScreen = ({ navigation }: any) => {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        const offerings = await RevenueCatService.getOfferings();
        if (offerings && offerings.current) {
            setPackages(offerings.current.availablePackages);
        }
        setIsLoading(false);
    };

    const handlePurchase = async (pkg: PurchasesPackage) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsPurchasing(true);
        const success = await RevenueCatService.purchasePackage(pkg);
        setIsPurchasing(false);

        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowConfetti(true);
            setTimeout(() => {
                Alert.alert("Welcome to Aura Pro!", "The universe of clarity is now yours.");
                navigation.goBack();
            }, 1800);
        }
    };

    const handleRestore = async () => {
        const success = await RevenueCatService.restorePurchases();
        if (success) {
            Alert.alert("Success", "Your premium status has been restored.");
            navigation.goBack();
        } else {
            Alert.alert("Notice", "No active subscriptions found.");
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={Colors.gradients.aura} style={StyleSheet.absoluteFill} />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <MotiView
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'timing', duration: 800 }}
                        style={styles.hero}
                    >
                        <View style={styles.iconWrapper}>
                            <LinearGradient colors={Colors.gradients.primary} style={styles.iconContainer}>
                                <Crown size={40} color={Colors.white} fill={Colors.white} />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Access Unlimited Clarity</Text>
                        <Text style={styles.subtitle}>Join Aura Pro to unlock specialized guides and infinite growth.</Text>
                    </MotiView>

                    <View style={styles.features}>
                        {[
                            { icon: Sparkles, text: "All Specialized AI Guides", color: Colors.primary },
                            { icon: Zap, text: "Unlimited Sessions & Messages", color: Colors.secondary },
                            { icon: Star, text: "Deep Work Context Integration", color: Colors.accent },
                            { icon: ShieldCheck, text: "Privacy-Focused & Ads-Free", color: Colors.success }
                        ].map((f, i) => (
                            <MotiView
                                key={i}
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ type: 'timing', duration: 600, delay: 400 + (i * 100) }}
                                style={styles.featureItem}
                            >
                                <View style={[styles.featureIcon, { backgroundColor: `${f.color}20` }]}>
                                    <f.icon size={20} color={f.color} />
                                </View>
                                <Text style={styles.featureText}>{f.text}</Text>
                            </MotiView>
                        ))}
                    </View>

                    <View style={styles.pricingContainer}>
                        {packages.map((pkg, index) => (
                            <MotiView
                                key={pkg.identifier}
                                from={{ opacity: 0, translateY: 30 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 800, delay: 800 + (index * 200) }}
                            >
                                <TouchableOpacity
                                    style={[styles.packageCard, index === 0 && styles.activeCard]}
                                    onPress={() => handlePurchase(pkg)}
                                    disabled={isPurchasing}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.pkgInfo}>
                                        <Text style={styles.pkgTitle}>{pkg.product.title}</Text>
                                        <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
                                    </View>
                                    <LinearGradient
                                        colors={Colors.gradients.primary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.selectBtn}
                                    >
                                        <Text style={styles.selectBtnText}>Subscribe</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </MotiView>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
                        <Text style={styles.restoreText}>Restore Aura Access</Text>
                    </TouchableOpacity>

                    <Text style={styles.legalText}>Subscription automatically renews unless canceled at least 24h before expiry.</Text>
                </ScrollView>
            </SafeAreaView>

            {showConfetti && (
                <ConfettiCannon count={200} origin={{ x: width / 2, y: -20 }} fadeOut={true} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        alignItems: 'flex-end',
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    hero: {
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    iconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 30,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 12,
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...Typography.h1,
        fontSize: 28,
        color: Colors.white,
        textAlign: 'center',
    },
    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
    },
    features: {
        marginVertical: Spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Spacing.md,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    featureText: {
        ...Typography.body,
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    pricingContainer: {
        marginBottom: Spacing.xl,
    },
    packageCard: {
        backgroundColor: Colors.card,
        borderRadius: 24,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.cardBorder,
    },
    activeCard: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    pkgInfo: {
        flex: 1,
    },
    pkgTitle: {
        ...Typography.h2,
        fontSize: 18,
        color: Colors.white,
    },
    pkgPrice: {
        ...Typography.body,
        color: Colors.text.secondary,
        fontSize: 14,
        marginTop: 2,
    },
    selectBtn: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: 12,
        borderRadius: 16,
    },
    selectBtnText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 14,
    },
    restoreButton: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    restoreText: {
        color: Colors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
    legalText: {
        ...Typography.caption,
        textAlign: 'center',
        fontSize: 10,
        color: Colors.text.muted,
        paddingHorizontal: Spacing.xl,
    },
});
