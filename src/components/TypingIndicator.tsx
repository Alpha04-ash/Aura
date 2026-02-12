import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors, Spacing } from '../theme';

export const TypingIndicator = () => {
    return (
        <View style={styles.container}>
            {[0, 1, 2].map((i) => (
                <MotiView
                    key={i}
                    from={{ translateY: 0, opacity: 0.3 }}
                    animate={{ translateY: -4, opacity: 1 }}
                    transition={{
                        type: 'timing',
                        duration: 500,
                        loop: true,
                        delay: i * 150,
                        repeatReverse: true,
                    }}
                    style={styles.dot}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gray[100],
        padding: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: Spacing.md,
        marginLeft: Spacing.lg,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.gray[400],
        marginHorizontal: 2,
    },
});
