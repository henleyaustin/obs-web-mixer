import { Injectable } from '@angular/core';

/**
 * Service for interacting with cache
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {
    /**
     * Save an item to local storage
     * @param key The key to identify the stored item
     * @param value The value to store (will be serialized as JSON)
     */
    setLocalItem<T> (key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(
                `Error setting item with key "${key}" in local storage:`,
                error
            );
        }
    }

    /**
     * Retrieve an item from local storage
     * @param key The key to identify the stored item
     * @returns The retrieved item, or null if not found or an error occurs
     */
    getLocalItem<T> (key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error(
                `Error getting item with key "${key}" from local storage:`,
                error
            );
            return null;
        }
    }

    /**
     * Remove an item from local storage
     * @param key The key to identify the stored item
     */
    removeLocalItem (key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(
                `Error removing item with key "${key}" from local storage:`,
                error
            );
        }
    }

    /**
     * Clear all items from local storage
     */
    clearLocalStorage (): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing local storage:', error);
        }
    }

    /**
     * Save an item to session storage
     * @param key The key to identify the stored item
     * @param value The value to store (will be serialized as JSON)
     */
    setSessionItem<T> (key: string, value: T): void {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(
                `Error setting item with key "${key}" in session storage:`,
                error
            );
        }
    }

    /**
     * Retrieve an item from session storage
     * @param key The key to identify the stored item
     * @returns The retrieved item, or null if not found or an error occurs
     */
    getSessionItem<T> (key: string): T | null {
        try {
            const item = sessionStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error(
                `Error getting item with key "${key}" from session storage:`,
                error
            );
            return null;
        }
    }

    /**
     * Remove an item from session storage
     * @param key The key to identify the stored item
     */
    removeSessionItem (key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error(
                `Error removing item with key "${key}" from session storage:`,
                error
            );
        }
    }

    /**
     * Clear all items from session storage
     */
    clearSessionStorage (): void {
        try {
            sessionStorage.clear();
        } catch (error) {
            console.error('Error clearing session storage:', error);
        }
    }
}
