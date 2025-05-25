import { Chart } from 'chart.js';
import React from 'react'; // Import React for MouseEvent

declare global {
  interface Window {
    handleSummarize?: (sectionId: string) => Promise<void>;
    handleElaborate?: (event: React.MouseEvent<HTMLButtonElement>, concept: string) => Promise<void>;
    handleGenerateQuiz?: (sectionId: string) => Promise<void>;
    Chart?: typeof Chart;
  }
}
