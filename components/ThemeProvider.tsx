"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

// Este componente funciona para o Modo escuro/claro
// visa a todas as pags do app qual tema o usuário escolheu
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // O children representa todo o app que vai ficar aqui dentro
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}