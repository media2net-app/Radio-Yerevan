'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastVisit: string;
  streak: number;
  lastStreakDate: string;
  viewedJokes: number[];
  favoriteJokes: number[];
  totalJokesViewed: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateStreak: () => void;
  addViewedJoke: (jokeIndex: number) => void;
  toggleFavorite: (jokeIndex: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  const userId = localStorage.getItem('currentUserId');
  if (!userId) return null;
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
      // Update last visit and check streak
      updateStreakForUser(currentUser);
    }
  }, []);

  const updateStreakForUser = (user: User) => {
    const today = new Date().toDateString();
    const lastStreakDate = new Date(user.lastStreakDate).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    let newStreak = user.streak;
    
    if (lastStreakDate === today) {
      // Already visited today, no change
    } else if (lastStreakDate === yesterday) {
      // Consecutive day, increment streak
      newStreak = user.streak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const updatedUser = {
      ...user,
      lastVisit: new Date().toISOString(),
      lastStreakDate: new Date().toISOString(),
      streak: newStreak
    };

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
      setUser(updatedUser);
    }
  };

  const register = (username: string, email: string, password: string): { success: boolean; error?: string } => {
    if (!username || !email || !password) {
      return { success: false, error: 'Toate câmpurile sunt obligatorii' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Parola trebuie să aibă cel puțin 6 caractere' };
    }

    const users = getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Numele de utilizator este deja folosit' };
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email-ul este deja înregistrat' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      streak: 1,
      lastStreakDate: new Date().toISOString(),
      viewedJokes: [],
      favoriteJokes: [],
      totalJokesViewed: 0
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('currentUserId', newUser.id);
    
    setUser(newUser);
    setIsAuthenticated(true);
    
    return { success: true };
  };

  const login = (username: string, password: string): boolean => {
    if (!username || !password) {
      return false;
    }

    const users = getUsers();
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (foundUser) {
      // Update last visit and streak
      updateStreakForUser(foundUser);
      localStorage.setItem('currentUserId', foundUser.id);
      setUser(foundUser);
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('currentUserId');
    router.push('/');
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveUsers(users);
      setUser(updatedUser);
    }
  };

  const updateStreak = () => {
    if (!user) return;
    updateStreakForUser(user);
  };

  const addViewedJoke = (jokeIndex: number) => {
    if (!user) return;
    
    if (!user.viewedJokes.includes(jokeIndex)) {
      const updatedUser = {
        ...user,
        viewedJokes: [...user.viewedJokes, jokeIndex],
        totalJokesViewed: user.totalJokesViewed + 1
      };
      updateUser(updatedUser);
    }
  };

  const toggleFavorite = (jokeIndex: number) => {
    if (!user) return;
    
    const isFavorite = user.favoriteJokes.includes(jokeIndex);
    const updatedFavorites = isFavorite
      ? user.favoriteJokes.filter(i => i !== jokeIndex)
      : [...user.favoriteJokes, jokeIndex];
    
    updateUser({ favoriteJokes: updatedFavorites });
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      login, 
      register,
      logout, 
      updateUser,
      updateStreak,
      addViewedJoke,
      toggleFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

