import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
    id: string;
    email: string;
    name: string;
    plan: 'free' | 'pro';
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;
    updatePassword: (current: string, newPass: string) => Promise<void>;
    updateName: (newName: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for persisted user on mount
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('auth_user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            } else if (Platform.OS === 'web') {
                // Check for NextAuth cookie on web
                const cookies = document.cookie.split(';');
                const sessionCookie = cookies.find(c => c.trim().startsWith('next-auth.session-token='));

                if (sessionCookie) {
                    console.log('Restoring session from NextAuth cookie');
                    // Create a synthetic user from the session presence since we can't decode it easily without backend
                    // In a real app, we would hit a /me endpoint here
                    const mockUser: User = {
                        id: 'restored-session',
                        email: 'user@example.com', // Placeholder since we can't read the HTTP-only cookie content
                        name: 'Restored User',
                        plan: 'free', // Default to free for restored sessions
                    };
                    setUser(mockUser);
                    // Optionally sync to AsyncStorage
                    await AsyncStorage.setItem('auth_user', JSON.stringify(mockUser));
                }
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock validation
        if (email && password) {
            const mockUser: User = {
                id: '1',
                email,
                name: email.split('@')[0], // Simple name derivation
                plan: 'free', // Default to free on login
            };
            setUser(mockUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(mockUser));
        } else {
            throw new Error('Invalid credentials');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email && password && name) {
            const mockUser: User = {
                id: Date.now().toString(),
                email,
                name,
                plan: 'free', // Default to free on registration
            };
            setUser(mockUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(mockUser));
        } else {
            throw new Error('Please fill all fields');
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_user');
        setUser(null);
    };

    const updateEmail = async (newEmail: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!user) throw new Error('No user logged in');

        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    const updatePassword = async (current: string, newPass: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, we'd verify 'current' against the backend
        if (!user) throw new Error('No user logged in');

        // For mock, we just simulate success if current is provided
        if (!current || !newPass) throw new Error('Invalid password data');

        console.log('Password updated for:', user.email);
    };

    const updateName = async (newName: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!user) throw new Error('No user logged in');

        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateEmail, updatePassword, updateName }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
