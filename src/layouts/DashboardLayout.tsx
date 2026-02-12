import React from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlobalProgressBar } from '../components/GlobalProgressBar';

type Props = {
    children: React.ReactNode;
};

export const DashboardLayout = ({ children }: Props) => {
    const { theme, colors } = useTheme();

    if (Platform.OS === 'web') {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {theme === 'light' && (
                    <View style={styles.backgroundDecor}>
                        <View style={[styles.blurCircle, { backgroundColor: '#818CF8', top: -100, right: -100, opacity: 0.15 }]} />
                        <View style={[styles.blurCircle, { backgroundColor: '#F472B6', bottom: 50, left: -100, opacity: 0.1 }]} />
                    </View>
                )}
                <Sidebar />
                <View style={styles.content}>
                    <GlobalProgressBar />
                    {children}
                </View>
            </View>
        );
    }

    // Mobile Layout (Sidebar hidden, just SafeArea)
    return (
        <SafeAreaView style={[styles.mobileContainer, { backgroundColor: colors.background }]}>
            {theme === 'light' && (
                <View style={styles.backgroundDecor}>
                    <View style={[styles.blurCircle, { backgroundColor: '#818CF8', top: -100, right: -100, opacity: 0.15 }]} />
                    <View style={[styles.blurCircle, { backgroundColor: '#F472B6', bottom: 50, left: -100, opacity: 0.1 }]} />
                </View>
            )}
            <GlobalProgressBar />
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    content: {
        flex: 1,
        position: 'relative', // Ensure absolute children are relative to this
        ...(Platform.OS === 'web' ? { height: '100vh', maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 } as any : {}),
    },
    mobileContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundDecor: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1, // Behind everything
        overflow: 'hidden',
        pointerEvents: 'none', // Don't block touches
    },
    blurCircle: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        // @ts-ignore
        filter: 'blur(120px)',
    },
});
