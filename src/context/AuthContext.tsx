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
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Checks if users_db exists, if not, create it
            const usersDb = await AsyncStorage.getItem('users_db');
            if (!usersDb) {
                await AsyncStorage.setItem('users_db', JSON.stringify([]));
                console.log('Initialized empty users_db');
            }

            // Check for persisted session
            const userJson = await AsyncStorage.getItem('auth_user');
            if (userJson) {
                const restoredUser = JSON.parse(userJson);
                console.log('Restored session for:', restoredUser.email);
                setUser(restoredUser);
            }
        } catch (e) {
            console.error('Failed to initialize auth', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        // Shorter delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!email || !password) {
            throw new Error('Please enter both email and password');
        }

        try {
            const usersJson = await AsyncStorage.getItem('users_db');
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];
            console.log('Attempting login. Total users:', users.length);

            const normalizedEmail = email.trim().toLowerCase();
            const foundUser = users.find(u =>
                u.email.toLowerCase() === normalizedEmail &&
                (u as any).password === password
            );

            if (foundUser) {
                const { password, ...safeUser } = foundUser as any;
                setUser(safeUser);
                await AsyncStorage.setItem('auth_user', JSON.stringify(safeUser));
                console.log('Login successful for:', normalizedEmail);
            } else {
                console.warn('Login failed: Invalid credentials for', normalizedEmail);
                throw new Error('Invalid email or password');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!email || !password || !name) {
            throw new Error('Please fill all fields');
        }

        try {
            const usersJson = await AsyncStorage.getItem('users_db');
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];

            const normalizedEmail = email.trim().toLowerCase();

            if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now().toString(),
                email: normalizedEmail,
                name: name.trim(),
                plan: 'free' as const,
                password // Storing password for local auth verification
            };

            users.push(newUser);
            await AsyncStorage.setItem('users_db', JSON.stringify(users));
            console.log('Registered new user:', normalizedEmail);

            const { password: _, ...safeUser } = newUser;
            setUser(safeUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(safeUser));
        } catch (error: any) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('auth_user');
            setUser(null);
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    const updateEmail = async (newEmail: string) => {
        if (!user) throw new Error('No user logged in');

        try {
            const normalizedEmail = newEmail.trim().toLowerCase();
            const updatedUser = { ...user, email: normalizedEmail };
            setUser(updatedUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));

            const usersJson = await AsyncStorage.getItem('users_db');
            if (usersJson) {
                const users = JSON.parse(usersJson);
                const index = users.findIndex((u: User) => u.id === user.id);
                if (index !== -1) {
                    users[index].email = normalizedEmail;
                    await AsyncStorage.setItem('users_db', JSON.stringify(users));
                }
            }
        } catch (e) {
            console.error('Update email failed', e);
            throw e;
        }
    };

    const updatePassword = async (current: string, newPass: string) => {
        if (!user) throw new Error('No user logged in');

        try {
            const usersJson = await AsyncStorage.getItem('users_db');
            if (usersJson) {
                const users = JSON.parse(usersJson);
                const index = users.findIndex((u: User) => u.id === user.id);
                if (index !== -1) {
                    users[index].password = newPass;
                    await AsyncStorage.setItem('users_db', JSON.stringify(users));
                }
            }
        } catch (e) {
            console.error('Update password failed', e);
            throw e;
        }
    };

    const updateName = async (newName: string) => {
        if (!user) throw new Error('No user logged in');

        try {
            const updatedUser = { ...user, name: newName.trim() };
            setUser(updatedUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));

            const usersJson = await AsyncStorage.getItem('users_db');
            if (usersJson) {
                const users = JSON.parse(usersJson);
                const index = users.findIndex((u: User) => u.id === user.id);
                if (index !== -1) {
                    users[index].name = newName.trim();
                    await AsyncStorage.setItem('users_db', JSON.stringify(users));
                }
            }
        } catch (e) {
            console.error('Update name failed', e);
            throw e;
        }
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
