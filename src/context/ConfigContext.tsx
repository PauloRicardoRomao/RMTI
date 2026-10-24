'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppConfig, ThemeConfig } from '@/types';
import { defaultAppConfig, THEME_PRESETS } from '@/data/defaultConfig';

interface ConfigContextType {
  config: AppConfig;
  isLoading: boolean;
  isSaving: boolean;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<boolean>;
  setThemePreset: (presetId: string) => Promise<boolean>;
  updateThemeColors: (colors: Partial<ThemeConfig>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  reloadConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function applyThemeVariables(theme: ThemeConfig) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-primary-hover', theme.primaryHover);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-surface', theme.surfaceColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--color-text-muted', theme.textMuted);
}

export function ConfigProvider({
  children,
  initialConfig,
}: {
  children: React.ReactNode;
  initialConfig?: AppConfig;
}) {
  const [config, setConfig] = useState<AppConfig>(initialConfig || defaultAppConfig);
  const [isLoading, setIsLoading] = useState<boolean>(!initialConfig);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        applyThemeVariables(data.theme);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialConfig) {
      fetchConfig();
    } else {
      applyThemeVariables(initialConfig.theme);
    }
  }, [initialConfig, fetchConfig]);

  useEffect(() => {
    if (config?.theme) {
      applyThemeVariables(config.theme);
    }
  }, [config?.theme]);

  const updateConfig = async (newConfig: Partial<AppConfig>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const mergedConfig = { ...config, ...newConfig };
      // Optimistic update
      setConfig(mergedConfig);
      if (newConfig.theme) {
        applyThemeVariables(newConfig.theme);
      }

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          applyThemeVariables(data.config.theme);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update config:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const setThemePreset = async (presetId: string): Promise<boolean> => {
    const preset = THEME_PRESETS.find((p) => p.id === presetId);
    if (!preset) return false;

    const newTheme: ThemeConfig = {
      ...config.theme,
      ...preset.colors,
      presetId,
    };

    return updateConfig({ theme: newTheme });
  };

  const updateThemeColors = async (colors: Partial<ThemeConfig>): Promise<boolean> => {
    const newTheme: ThemeConfig = {
      ...config.theme,
      ...colors,
      presetId: 'custom',
    };

    return updateConfig({ theme: newTheme });
  };

  const resetToDefaults = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || defaultAppConfig);
        applyThemeVariables((data.config || defaultAppConfig).theme);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to reset config:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        isLoading,
        isSaving,
        updateConfig,
        setThemePreset,
        updateThemeColors,
        resetToDefaults,
        reloadConfig: fetchConfig,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

