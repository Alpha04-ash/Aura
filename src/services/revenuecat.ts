// Services/RevenueCat.ts
// Mock implementation since the real file is missing
// This allows the app to compile and run without crashing on imports

export const RevenueCatService = {
    isPremium: async (): Promise<boolean> => {
        // Return true for testing purposes, or false to force paywall
        // TODO: Implement real RevenueCat logic if needed, or switch to Paddle completely
        console.log('Mock RevenueCat: Checking premium status...');
        return false;
    },

    purchasePackage: async (packageId: string) => {
        console.log(`Mock RevenueCat: Purchasing ${packageId}`);
        return { customerInfo: { entitlements: { active: { 'pro': true } } } };
    },

    restorePurchases: async () => {
        console.log('Mock RevenueCat: Restoring purchases');
        return { active: true };
    },

    setup: async () => {
        console.log('Mock RevenueCat: Setup complete');
    },

    getOfferings: async () => {
        console.log('Mock RevenueCat: Fetching offerings');
        return {
            current: {
                availablePackages: [
                    {
                        identifier: '$rc_monthly',
                        packageType: 'MONTHLY',
                        product: {
                            identifier: 'pro_monthly',
                            title: 'Pro Monthly',
                            description: 'Unlock all features',
                            price: 9.99,
                            priceString: '$9.99',
                            currencyCode: 'USD',
                        }
                    },
                    {
                        identifier: '$rc_annual',
                        packageType: 'ANNUAL',
                        product: {
                            identifier: 'pro_annual',
                            title: 'Pro Annual',
                            description: 'Unlock all features (Save 20%)',
                            price: 99.99,
                            priceString: '$99.99',
                            currencyCode: 'USD',
                        }
                    }
                ]
            }
        };
    }
};
