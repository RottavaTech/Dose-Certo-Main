"use client";

import React from "react";
import { ChevronDown, Info, Syringe } from "lucide-react";

export default function Guide() {
  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
      
      {/* cabecalho */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="text-primary" size={28} />
            <h1 className="font-bold text-lg tracking-tight">DoseCerto</h1>
          </div>
        </div>
      </header>

      {/* conteudo principal */}
      <main className="px-4 pt-6 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guia de Uso</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-6">
          Tire suas dúvidas sobre a aplicação e dosagem.
        </p>

        {/* lista das duvidas frequentes */}
        <div className="flex flex-col gap-3">
          
          {/* concentracao */}
          <details
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors duration-200"
            open
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Onde encontro a concentração no frasco?
              </span>
              <ChevronDown
                className="text-primary group-open:rotate-180 transition-transform"
                size={20}
              />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A concentração geralmente está localizada no rótulo principal do
                frasco, indicada em unidades por ml (ex: 100 U/ml). Procure por
                textos em destaque ou perto da data de validade.
              </p>
            </div>
          </details>

          {/* tipos de Seringa */}
          <details className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Qual a diferença entre os tipos de seringas disponíveis?
              </span>
              <ChevronDown
                className="text-primary group-open:rotate-180 transition-transform"
                size={20}
              />
            </summary>
            <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="mb-3">
                O aplicativo calcula a dose exata adaptada para o material que você tem em mãos:
              </p>

              <ul className="list-disc pl-5 mb-3 space-y-2">
                <li>
                  <strong>1 mL Insulina (100 UI):</strong> Exclusiva para insulina. É a única opção que, além do volume em mL, converte o resultado final para Unidades Internacionais (UI).
                </li>
                <li>
                  <strong>1 mL Tuberculina:</strong> Ideal para doses muito pequenas, precisas e fracionadas (apenas em mL), como vacinas ou uso pediátrico.
                </li>
                <li>
                  <strong>3 mL a 60 mL:</strong> Seringas de uso geral para injeções intramusculares, intravenosas, diluições ou dieta. O resultado exibirá o volume exato em mL.
                </li>
              </ul>

              <p>
                Para evitar vazamentos ou pressão excessiva, sempre tente escolher uma seringa com capacidade um pouco maior que o volume total calculado para a sua dose.
              </p>
            </div>
          </details>

          {/* Higiene */}
          <details className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Boas práticas de higiene
              </span>
              <ChevronDown
                className="text-primary group-open:rotate-180 transition-transform"
                size={20}
              />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Lave sempre as mãos com água e sabão antes do manuseio. Limpe o
                topo do frasco com álcool 70% e utilize sempre uma agulha nova e
                descartável para cada aplicação.
              </p>
            </div>
          </details>

          {/* Prescrição */}
          <details className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors duration-200">
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                Como ler a prescrição médica
              </span>
              <ChevronDown
                className="text-primary group-open:rotate-180 transition-transform"
                size={20}
              />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A prescrição deve indicar o nome do medicamento, a concentração
                (U/ml) e o número de unidades (U) a serem aplicadas. Em caso de
                dúvida, nunca presuma; consulte seu médico.
              </p>
            </div>
          </details>

          {/* Card Informativo */}
          <div className="mt-4 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex gap-3 transition-colors duration-200">
            <Info className="text-primary shrink-0" size={24} />
            <div>
              <h4 className="text-sm font-bold text-primary">
                Dica de Segurança
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Sempre verifique se a cor da insulina está de acordo com o
                padrão esperado antes de aplicar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}