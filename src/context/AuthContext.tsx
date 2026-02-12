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
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('auth_user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!email || !password) {
            throw new Error('Please enter both email and password');
        }

        try {
            const usersJson = await AsyncStorage.getItem('users_db');
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];

            // Simple case-insensitive email match, verify password (stored as plain text for hackathon demo)
            const foundUser = users.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                (u as any).password === password
            );

            if (foundUser) {
                // Remove password before setting in state
                const { password, ...safeUser } = foundUser as any;
                setUser(safeUser);
                await AsyncStorage.setItem('auth_user', JSON.stringify(safeUser));
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (!email || !password || !name) {
            throw new Error('Please fill all fields');
        }

        try {
            const usersJson = await AsyncStorage.getItem('users_db');
            const users: User[] = usersJson ? JSON.parse(usersJson) : [];

            // Check if user exists
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now().toString(),
                email,
                name,
                plan: 'free' as const,
                password // Storing password for local auth verification
            };

            // Save to DB
            users.push(newUser);
            await AsyncStorage.setItem('users_db', JSON.stringify(users));

            // Set as current user (logged in)
            const { password: _, ...safeUser } = newUser;
            setUser(safeUser);
            await AsyncStorage.setItem('auth_user', JSON.stringify(safeUser));
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_user');
        setUser(null);
    };

    const updateEmail = async (newEmail: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!user) throw new Error('No user logged in');

        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));

        // Update in DB as well
        const usersJson = await AsyncStorage.getItem('users_db');
        if (usersJson) {
            const users = JSON.parse(usersJson);
            const index = users.findIndex((u: User) => u.id === user.id);
            if (index !== -1) {
                users[index].email = newEmail;
                await AsyncStorage.setItem('users_db', JSON.stringify(users));
            }
        }
    };

    const updatePassword = async (current: string, newPass: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!user) throw new Error('No user logged in');

        // Update in DB
        const usersJson = await AsyncStorage.getItem('users_db');
        if (usersJson) {
            const users = JSON.parse(usersJson);
            const index = users.findIndex((u: User) => u.id === user.id);
            if (index !== -1) {
                // Verify current password logic could go here
                users[index].password = newPass;
                await AsyncStorage.setItem('users_db', JSON.stringify(users));
            }
        }
    };

    const updateName = async (newName: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (!user) throw new Error('No user logged in');

        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));

        // Update in DB
        const usersJson = await AsyncStorage.getItem('users_db');
        if (usersJson) {
            const users = JSON.parse(usersJson);
            const index = users.findIndex((u: User) => u.id === user.id);
            if (index !== -1) {
                users[index].name = newName;
                await AsyncStorage.setItem('users_db', JSON.stringify(users));
            }
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
