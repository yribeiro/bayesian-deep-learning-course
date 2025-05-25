"use client";
import Head from 'next/head';
import Script from 'next/script'; // For external scripts like Chart.js
import { useEffect, useRef } from 'react';

export default function Home() {
  const comparisonChartInstanceRef = useRef(null);

  // Define functions from the original script tag here
  // These functions will be called by event handlers or within useEffect
  
  async function generateContent(prompt) {
    // Gemini API configuration
    const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected API response structure:', result);
            return 'Error: Could not generate content. Please try again.';
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'Error: Failed to connect to the AI service.';
    }
  }

  function getSectionContent(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
          let content = section.cloneNode(true);
          content.querySelectorAll('.llm-button, .llm-output').forEach(el => el.remove());
          return content.innerText.trim();
      }
      return '';
  }

  async function handleSummarize(sectionId) {
      const outputDiv = document.getElementById(`${sectionId}-output`);
      outputDiv.classList.remove('hidden');
      outputDiv.innerText = 'Generating summary...';

      const sectionContent = getSectionContent(sectionId);
      const prompt = `Summarize the key concepts of the following text in 3-4 concise bullet points:\n\n"${sectionContent}"`;
      
      const summary = await generateContent(prompt);
      outputDiv.innerText = summary;
  }

  async function handleElaborate(event, concept) { // Modified to accept event
      const button = event.target;
      const section = button.closest('.content-section');
      const sectionId = section.id;
      const outputDiv = document.getElementById(`${sectionId}-output`);
      outputDiv.classList.remove('hidden');
      outputDiv.innerText = `Elaborating on "${concept}"...`;

      const prompt = `Explain "${concept}" in more detail, perhaps with a real-world analogy or a different perspective, suitable for a deep learning crash course. Keep it concise, around 3-5 sentences.`;
      
      const elaboration = await generateContent(prompt);
      outputDiv.innerText = elaboration;
  }

  async function handleGenerateQuiz(sectionId) {
      const outputDiv = document.getElementById(`${sectionId}-output`);
      outputDiv.classList.remove('hidden');
      outputDiv.innerText = 'Generating quiz question...';

      const sectionContent = getSectionContent(sectionId);
      const prompt = `Create a multiple-choice quiz question with 4 options (A, B, C, D) and indicate the correct answer (e.g., "Correct Answer: B"), based on the following text about Bayesian Deep Learning. The question should test understanding of a core concept.
      \n\nText:\n"${sectionContent}"\n\nQuestion Format Example:\nQuestion: What is X?\nA) Option A\nB) Option B\nC) Option C\nD) Option D\nCorrect Answer: B`;
      
      const quizQuestion = await generateContent(prompt);
      outputDiv.innerText = quizQuestion;
  }


  function renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx || typeof Chart === 'undefined') return; // Ensure Chart is defined

    if (comparisonChartInstanceRef.current) {
        comparisonChartInstanceRef.current.destroy();
    }

    comparisonChartInstanceRef.current = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Traditional DL', 'Bayesian DL'],
            datasets: [{
                label: 'Uncertainty Quantification Capability',
                data: [1, 5], 
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)', 
                    'rgba(54, 162, 235, 0.2)'  
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 6,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            if (value === 1) return 'Basic/Post-hoc';
                            if (value === 5) return 'Comprehensive/Inherent';
                            return null; 
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Comparison: Uncertainty Quantification'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                if(context.label === 'Traditional DL') label += 'Relies on post-hoc methods';
                                if(context.label === 'Bayesian DL') label += 'Principled & inherent';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
  }

  useEffect(() => {
    // Assign functions to window object if they are called directly from HTML attributes
    // This is not ideal in React, but necessary for quick porting of existing onclick handlers
    window.handleSummarize = handleSummarize;
    window.handleElaborate = handleElaborate;
    window.handleGenerateQuiz = handleGenerateQuiz;

    const navLinks = document.querySelectorAll('#navigation a.sidebar-link');
    const contentSections = document.querySelectorAll('#main-content .content-section');

    function setActiveSection(hash) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        contentSections.forEach(section => {
            if ('#' + section.id === hash) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
            const outputDiv = section.querySelector('.llm-output');
            if (outputDiv) {
                outputDiv.classList.add('hidden');
                outputDiv.innerText = ''; 
            }
        });

        if (hash === '#module1-comparison') {
            renderComparisonChart();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            window.location.hash = targetId; 
        });
    });

    const handleHashChange = () => {
        const hash = window.location.hash || '#executive-summary';
        setActiveSection(hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    // Initial load
    const initialHash = window.location.hash || '#executive-summary';
    setActiveSection(initialHash);
    
    // Cleanup event listeners on component unmount
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
        navLinks.forEach(link => {
            // Clean up click listeners if they were added with `addEventListener`
            // Note: The current code adds them directly. If they were added via `addEventListener`, 
            // you'd need to store the function reference to remove it.
        });
        // Clean up window functions
        delete window.handleSummarize;
        delete window.handleElaborate;
        delete window.handleGenerateQuiz;
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Practical Bayesian Deep Learning: Interactive Course Explorer</title>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com" async></script>
        {/* Chart.js CDN */}
        {/* <script src="https://cdn.jsdelivr.net/npm/chart.js" async></script>  Replaced by Next Script */}
        <style>{`
            body {
                font-family: 'Inter', sans-serif;
                background-color: #FDFBF5; /* Warm Neutral: Light Beige */
                color: #374151; /* Dark Gray for text */
            }
            .sidebar-link {
                transition: all 0.3s ease;
                border-left: 3px solid transparent;
            }
            .sidebar-link:hover, .sidebar-link.active {
                background-color: #E0F2F1; /* Muted Teal Accent - Lighter for hover/active */
                color: #00796B; /* Muted Teal Accent - Darker for text */
                border-left-color: #00796B; /* Muted Teal Accent */
            }
            .content-section {
                display: none;
            }
            .content-section.active {
                display: block;
            }
            h1, h2, h3 {
                color: #004D40; /* Muted Teal Accent - Darkest for major headings */
            }
            .formula {
                font-family: 'Courier New', Courier, monospace;
                background-color: #EFFBF0;
                padding: 2px 6px;
                border-radius: 4px;
                font-style: italic;
            }
            .key-term {
                font-weight: 600;
                color: #00695C; /* Muted Teal Accent */
            }
            .chart-container {
                position: relative;
                width: 100%;
                max-width: 600px; /* Max width for the chart */
                margin-left: auto;
                margin-right: auto;
                height: 300px; /* Base height */
                max-height: 350px; /* Max height */
            }
            @media (min-width: 768px) {
                .chart-container {
                    height: 350px;
                }
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #D1D5DB; /* Gray-300 */
                padding: 0.75rem;
                text-align: left;
            }
            th {
                background-color: #F3F4F6; /* Gray-100 */
            }
            .lab-exercise {
                background-color: #E8F5E9; /* Light green background for exercises */
                border-left: 4px solid #4CAF50; /* Green accent border */
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 4px;
            }
            .llm-output {
                background-color: #F0F8FF; /* Light blue for LLM output */
                border-left: 4px solid #87CEEB; /* Sky blue accent */
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 4px;
                white-space: pre-wrap; /* Preserve whitespace and line breaks */
            }
            .llm-button {
                /* Tailwind classes are not directly usable here, need to replicate or use global CSS */
                background-color: #0d9488; /* bg-teal-600 */
                color: white;
                padding: 0.5rem 1rem; /* px-4 py-2 */
                border-radius: 0.375rem; /* rounded-md */
                transition-property: background-color;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 200ms;
                margin-top: 0.5rem; /* mt-2 */
                margin-right: 0.5rem; /* mr-2 */
            }
            .llm-button:hover {
                background-color: #0f766e; /* hover:bg-teal-700 */
            }
        `}</style>
      </Head>
      {/* Use Next.js Script component for Chart.js to ensure it loads properly */}
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="lazyOnload" onReady={() => {
          // Chart.js is loaded, now you can safely call functions that depend on it.
          // For example, if a chart needs to be rendered on initial load based on the hash:
          if (window.location.hash === '#module1-comparison') {
              renderComparisonChart();
          }
      }} />

      {/* Body content from index.html, converted to JSX */}
      <div className="flex flex-col min-h-screen"> {/* Replaced body tag */}
        <header className="bg-[#004D40] text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold text-white">Practical Bayesian Deep Learning: Interactive Course Explorer</h1>
            </div>
        </header>

        <div className="flex flex-1 container mx-auto mt-4">
            <aside className="w-1/4 p-4 space-y-2 sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto bg-gray-50 rounded-lg shadow">
                <nav id="navigation" className="space-y-1">
                    <a href="#executive-summary" className="block p-3 rounded-md sidebar-link">Executive Summary</a>
                    <div>
                        <h3 className="font-semibold mt-3 mb-1 p-2 text-gray-600">Module 1: Foundations</h3>
                        <a href="#module1-1" className="block p-3 rounded-md sidebar-link ml-2">1.1 Bayes' Theorem</a>
                        <a href="#module1-2" className="block p-3 rounded-md sidebar-link ml-2">1.2 Probabilistic NN</a>
                        <a href="#module1-3" className="block p-3 rounded-md sidebar-link ml-2">1.3 Uncertainty Types</a>
                        <a href="#module1-4" className="block p-3 rounded-md sidebar-link ml-2">1.4 Exercise: Simple Inference</a>
                        <a href="#module1-comparison" className="block p-3 rounded-md sidebar-link ml-2">BDL vs. Traditional DL</a>
                    </div>
                    <div>
                        <h3 className="font-semibold mt-3 mb-1 p-2 text-gray-600">Module 2: Intro to BNNs</h3>
                        <a href="#module2-1" className="block p-3 rounded-md sidebar-link ml-2">2.1 Defining BNNs</a>
                        <a href="#module2-2" className="block p-3 rounded-md sidebar-link ml-2">2.2 Predictive Distribution</a>
                        <a href="#module2-3" className="block p-3 rounded-md sidebar-link ml-2">2.3 Challenges of Inference</a>
                        <a href="#module2-4" className="block p-3 rounded-md sidebar-link ml-2">2.4 Exercise: Conceptualizing BNNs</a>
                    </div>
                    <a href="#conclusions" className="block p-3 rounded-md sidebar-link">Conclusions</a>
                </nav>
            </aside>

            <main id="main-content" className="w-3/4 p-6 ml-4 bg-white rounded-lg shadow-lg">
                <section id="executive-summary" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Executive Summary</h2>
                    <p className="text-lg leading-relaxed">This section provides an overview of the 12-hour crash course on Bayesian Deep Learning (BDL). It highlights the course's aim to equip deep learning engineers and data scientists with practical BDL principles and hands-on experience. You'll learn about constructing BDL models, quantifying uncertainty (aleatoric and epistemic), mitigating overfitting, and making robust decisions.</p>
                    <p>The course emphasizes a balance between theoretical foundations and practical implementation using industry-standard libraries. By the end, you will be proficient in leveraging BDL for more reliable and safety-critical AI applications.</p>
                    <button className="llm-button" onClick={() => handleSummarize('executive-summary')}>✨ Summarize Section</button>
                    <div id="executive-summary-output" className="llm-output hidden"></div>
                </section>

                <section id="module1-1" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 1.1: Revisiting Bayes' Theorem: The Probabilistic Lens</h2>
                    <p className="text-lg leading-relaxed">This section delves into Bayes' Theorem, the cornerstone of Bayesian inference. It explains how this theorem provides a structured way to update our beliefs about model parameters when new data becomes available, shifting from fixed parameter values to probability distributions. Understanding this is fundamental to grasping how BDL models learn and make predictions.</p>
                    <p>Bayes' Theorem is expressed as: <span className="formula">P(H|D) = (P(D|H) * P(H)) / P(D)</span>.</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><span className="key-term">Prior (P(H)):</span> Your initial belief about the parameters before seeing data. It allows incorporating domain knowledge. <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Prior (P(H)) in Bayes Theorem')}>✨ Elaborate</button></li>
                        <li><span className="key-term">Likelihood (P(D|H)):</span> The probability of observing the data given certain parameter values. It also captures aleatoric uncertainty (inherent data noise). <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Likelihood (P(D|H)) in Bayes Theorem')}>✨ Elaborate</button></li>
                        <li><span className="key-term">Posterior (P(H|D)):</span> Your updated belief about the parameters after considering the data. It encodes epistemic uncertainty (model's uncertainty). <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Posterior (P(H|D)) in Bayes Theorem')}>✨ Elaborate</button></li>
                        <li><span className="key-term">Evidence (P(D)):</span> The overall probability of the data, acting as a normalizing constant. It's often hard to compute for complex models like BNNs, leading to approximate inference methods. <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Evidence (P(D)) in Bayes Theorem')}>✨ Elaborate</button></li>
                    </ul>
                    <p>The ability to explicitly incorporate prior knowledge is a significant advantage of Bayesian methods, especially with limited data or in safety-critical domains.</p>
                    <button className="llm-button" onClick={() => handleSummarize('module1-1')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module1-1')}>✨ Generate Quiz Question</button>
                    <div id="module1-1-output" className="llm-output hidden"></div>
                </section>

                <section id="module1-2" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 1.2: Probabilistic Perspective of Neural Networks</h2>
                    <p className="text-lg leading-relaxed">This part of the course contrasts traditional deep learning models with Bayesian Deep Learning (BDL). Traditional models give single "point estimates" for weights and predictions, often acting as "black boxes" without explicit uncertainty measures. BDL, however, infers full probability distributions over these parameters.</p>
                    <p>Instead of learning one set of fixed weights, a BDL model learns a distribution of possible weights. This means for any input, it produces a distribution of predictions, offering a richer understanding of the model's confidence. This shift is crucial for risk assessment and safety in decision-making, addressing the "black box" issue by quantifying uncertainty.</p>
                    <p>There's a growing demand for AI systems that can reliably assess uncertainties. BDL is key for this, especially for Large Language Models (LLMs) to mitigate issues like hallucinations by indicating when the model is unsure. This allows for human-in-the-loop systems where AI defers to experts if its confidence is low.</p>
                    <button className="llm-button" onClick={() => handleSummarize('module1-2')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module1-2')}>✨ Generate Quiz Question</button>
                    <div id="module1-2-output" className="llm-output hidden"></div>
                </section>

                <section id="module1-3" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 1.3: Understanding Uncertainty: Aleatoric vs. Epistemic</h2>
                    <p className="text-lg leading-relaxed">This section clarifies the two main types of uncertainty in BDL. Distinguishing them is vital for making informed decisions about model improvement and deployment.</p>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-sky-50 p-4 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-sky-700">Aleatoric Uncertainty <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Aleatoric Uncertainty')}>✨ Elaborate</button></h3>
                            <p>This is the inherent, irreducible noise in the data itself (e.g., sensor noise, measurement errors, intrinsic randomness). It <span className="key-term">cannot</span> be reduced by collecting more data. It represents the fundamental unpredictability of the system. In models, it's often part of the likelihood function (e.g., Gaussian noise).</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg shadow">
                            <h3 className="text-xl font-semibold text-amber-700">Epistemic Uncertainty <button className="llm-button text-sm py-1 px-2" onClick={(e) => handleElaborate(e, 'Epistemic Uncertainty')}>✨ Elaborate</button></h3>
                            <p>Also known as model uncertainty, this arises from the model's lack of knowledge about its optimal parameters. It <span className="key-term">can</span> be reduced by providing more data, improving the model architecture, or refining inference. BNNs primarily address this by learning distributions over parameters.</p>
                        </div>
                    </div>
                    <p className="mt-4">Understanding this distinction has practical implications:
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li>High epistemic uncertainty? Get more data (related to active learning).</li>
                            <li>High aleatoric uncertainty? More data won't help; the noise is inherent.</li>
                        </ul>
                    This helps allocate resources effectively and enables nuanced risk management in applications like autonomous driving (e.g., distinguishing unfamiliar environment vs. noisy sensor).
                    </p>
                    <button className="llm-button" onClick={() => handleSummarize('module1-3')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module1-3')}>✨ Generate Quiz Question</button>
                    <div id="module1-3-output" className="llm-output hidden"></div>
                </section>

                <section id="module1-4" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 1.4: Hands-on Exercise: Simple Bayesian Inference (Conceptual)</h2>
                    <p className="text-lg leading-relaxed">This section describes a conceptual hands-on exercise designed to build intuition for the Bayesian updating process. It focuses on a simple parameter estimation problem, not yet involving neural networks, to solidify core Bayesian principles.</p>
                    <div className="lab-exercise">
                        <h3 className="text-xl font-semibold mb-2">Lab: Bayesian Inference for Parameter Estimation</h3>
                        <p><strong>Objective:</strong> Implement and visualize Bayesian updating for a simple parameter.</p>
                        <p><strong>Task:</strong>
                            <ol className="list-decimal list-inside pl-4 space-y-1 mt-2">
                                <li>Choose a simple scenario:
                                    <ul className="list-disc list-inside pl-6">
                                        <li>Estimating the bias of a coin (probability of heads).</li>
                                        <li>Estimating the mean of a Gaussian distribution.</li>
                                    </ul>
                                </li>
                                <li>Define a prior distribution for the parameter (e.g., Beta for coin bias, Gaussian for Gaussian mean).</li>
                                <li>Define a likelihood function for the data given the parameter.</li>
                                <li>Simulate observing data points one by one (or in small batches).</li>
                                <li>After each observation (or batch), calculate the posterior distribution using Bayes' theorem. For conjugate priors, this update is analytical. For others, it's a conceptual step here.</li>
                                <li>Implement this using Python libraries like NumPy for calculations and SciPy.stats for distributions. Matplotlib/Seaborn for plotting.</li>
                                <li>Visualize the evolution: Plot the prior, the likelihood (for the current data), and the resulting posterior distribution. Observe how the posterior sharpens and shifts as more data is incorporated.</li>
                            </ol>
                        </p>
                        <p className="mt-3"><strong>Pedagogical Goal:</strong> Starting with a non-deep learning example helps isolate and understand the Bayesian update mechanism (prior + data -&gt; posterior) before adding the complexity of neural network architectures. This builds a strong foundation for understanding BNNs.</p>
                    </div>
                    <button className="llm-button" onClick={() => handleSummarize('module1-4')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module1-4')}>✨ Generate Quiz Question</button>
                    <div id="module1-4-output" className="llm-output hidden"></div>
                </section>
                
                <section id="module1-comparison" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">BDL vs. Traditional Deep Learning: A Comparative Overview</h2>
                    <p className="text-lg leading-relaxed">This section provides a clear comparison between Bayesian Deep Learning (BDL) and traditional deep learning approaches. Understanding these differences highlights why BDL is a significant advancement for applications requiring robust uncertainty quantification and explicit prior knowledge integration.</p>
                    <div className="overflow-x-auto mt-4">
                        <table className="min-w-full divide-y divide-gray-200 shadow rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traditional Deep Learning</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bayesian Deep Learning</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Parameter Representation</span></td>
                                    <td className="px-6 py-4">Single point estimates for weights and biases.</td>
                                    <td className="px-6 py-4">Probability distributions over weights and biases.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Uncertainty Quantification</span></td>
                                    <td className="px-6 py-4">Lacks inherent quantification; relies on post-hoc methods.</td>
                                    <td className="px-6 py-4">Provides principled, inherent quantification of both aleatoric and epistemic uncertainty.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Overfitting Mitigation</span></td>
                                    <td className="px-6 py-4">Prone to overfitting, especially with small datasets; relies heavily on regularization techniques.</td>
                                    <td className="px-6 py-4">Inherently mitigates overfitting by modeling weight uncertainty.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Hyperparameter Tuning</span></td>
                                    <td className="px-6 py-4">Often requires crucial and extensive hyperparameter tuning.</td>
                                    <td className="px-6 py-4">Can reduce the importance of some hyperparameter tuning through the incorporation of relevant hyper-priors.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Incorporating Prior Knowledge</span></td>
                                    <td className="px-6 py-4">Typically incorporates prior knowledge implicitly (e.g., via architecture design, extensive feature engineering).</td>
                                    <td className="px-6 py-4">Allows for explicit incorporation of domain knowledge through priors.</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="key-term">Decision Making</span></td>
                                    <td className="px-6 py-4">Provides point predictions, leading to less informed risk assessment.</td>
                                    <td className="px-6 py-4">Offers probabilistic predictions, enabling informed risk assessment and the ability to defer to human experts when uncertainty is high.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-lg leading-relaxed mt-6">To further illustrate a key difference, the chart below visualizes the capability for 'Uncertainty Quantification':</p>
                    <div className="chart-container mt-2">
                        <canvas id="comparisonChart"></canvas>
                    </div>
                    <button className="llm-button" onClick={() => handleSummarize('module1-comparison')}>✨ Summarize Section</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module1-comparison')}>✨ Generate Quiz Question</button>
                    <div id="module1-comparison-output" className="llm-output hidden"></div>
                </section>

                <section id="module2-1" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 2.1: Defining BNNs: Learning Distributions over Weights</h2>
                    <p className="text-lg leading-relaxed">This section formally introduces Bayesian Neural Networks (BNNs). It explains that in a BNN, some or all of the network's weights and biases are treated as random variables with prior probability distributions, which are updated via Bayesian inference. This contrasts with traditional NNs that find single optimal point estimates (MLE or MAP).</p>
                    <p>The core idea is that a BNN learns a <span className="key-term">"distribution over possible neural networks"</span> rather than a single "best" network. Each network in this distribution is a plausible model for the data. This approach offers a richer understanding of predictions and uncertainties, vital for applications like autonomous driving.</p>
                    <p>By modeling uncertainty in weights, BNNs inherently reduce overfitting, especially with small datasets. This ensemble perspective averages over many models, making predictions smoother and less reliant on specific training examples.</p>
                    <button className="llm-button" onClick={() => handleSummarize('module2-1')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module2-1')}>✨ Generate Quiz Question</button>
                    <div id="module2-1-output" className="llm-output hidden"></div>
                </section>

                <section id="module2-2" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 2.2: The Predictive Distribution and Bayesian Model Averaging</h2>
                    <p className="text-lg leading-relaxed">This section focuses on the primary output of a Bayesian Neural Network (BNN): the posterior predictive distribution. This distribution is key to understanding how BNNs make predictions and quantify uncertainty for new, unseen data.</p>
                    <p>The posterior predictive distribution gives the probability of a new observation ($y^*$) given a new input ($x^*$) and the training data ($D$). Mathematically, it's: <span className="formula">{"p(y*|x*, D) = ∫ p(y*|x*, w)p(w|D)dw"}</span>. This integral is taken over the posterior distribution of the weights $p(w|D)$.</p>
                    <p>This integral represents <span className="key-term">Bayesian Model Averaging (BMA)</span>. Instead of using one "best" model, BMA averages predictions from all possible neural networks, weighted by their posterior probability. This ensemble approach leads to more robust predictions and meaningful uncertainty estimates, as it's less sensitive to minor data changes or model misspecifications.</p>
                    <p>The full probabilistic output from BMA (e.g., mean and variance for regression, or a probability distribution over classes for classification) is much more informative than a single point prediction. It explicitly quantifies the confidence in a prediction, crucial for risk assessment and safety-critical decisions (e.g., "how confident is the model in this medical diagnosis?").</p>
                    <button className="llm-button" onClick={() => handleSummarize('module2-2')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module2-2')}>✨ Generate Quiz Question</button>
                    <div id="module2-2-output" className="llm-output hidden"></div>
                </section>

                <section id="module2-3" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 2.3: Challenges of Exact Bayesian Inference in Deep Learning</h2>
                    <p className="text-lg leading-relaxed">This section discusses the practical difficulties in implementing exact Bayesian inference for deep learning models. While theoretically powerful, there are significant computational hurdles.</p>
                    <p>The main challenge is the <span className="key-term">computational intractability</span> of the integral needed for the posterior predictive distribution. Neural networks can have millions of parameters, making this integral extremely high-dimensional and computationally prohibitive to calculate exactly. This is a major bottleneck for widespread BDL adoption.</p>
                    <p>These computational difficulties are why <span className="key-term">approximate inference methods</span> (like Variational Inference and Markov Chain Monte Carlo, covered later) are essential to make BNNs practical for real-world use. Ongoing research focuses on developing more efficient approximation techniques, new model architectures for Bayesian approaches, and using specialized hardware to overcome these scalability issues.</p>
                    <button className="llm-button" onClick={() => handleSummarize('module2-3')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module2-3')}>✨ Generate Quiz Question</button>
                    <div id="module2-3-output" className="llm-output hidden"></div>
                </section>

                <section id="module2-4" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Module 2.4: Hands-on Exercise: Conceptualizing BNNs with a Toy Regression Problem</h2>
                    <p className="text-lg leading-relaxed">This section outlines a conceptual hands-on exercise aimed at making the idea of Bayesian Neural Networks (BNNs) more tangible. It uses a simple regression problem to illustrate how BNNs generate a "distribution over functions."</p>
                    <div className="lab-exercise">
                        <h3 className="text-xl font-semibold mb-2">Lab: Visualizing BNN Predictions on a Toy Regression Task</h3>
                        <p><strong>Objective:</strong> Conceptually understand how a BNN produces a distribution of predictions representing its uncertainty.</p>
                        <p><strong>Task:</strong>
                            <ol className="list-decimal list-inside pl-4 space-y-1 mt-2">
                                <li><strong>Dataset:</strong> Use a simple 1D or 2D regression dataset (e.g., a noisy sine wave: $y = \sin(x) + \epsilon$).</li>
                                <li><strong>Traditional NN (Baseline):</strong>
                                    <ul className="list-disc list-inside pl-6">
                                        <li>Train a standard small neural network (e.g., one hidden layer) on this data.</li>
                                        <li>Plot its single, deterministic prediction curve over the input range. Observe how it tries to fit the noisy data.</li>
                                    </ul>
                                </li>
                                <li><strong>BNN (Conceptual Illustration):</strong>
                                    <ul className="list-disc list-inside pl-6">
                                        <li>Imagine a BNN trained on the same data. Instead of one set of weights, it has learned a posterior distribution over its weights.</li>
                                        <li>To visualize its output:
                                            <ol type="a" className="list-decimal list-inside pl-8">
                                                <li>Sample multiple sets of weights from this (conceptual) posterior distribution. Each sample represents one plausible neural network.</li>
                                                <li>For each sampled set of weights, generate a prediction curve over the input range.</li>
                                                <li>Plot all these prediction curves on the same graph. You should see a "band" or "envelope" of functions.</li>
                                            </ol>
                                        </li>
                                        <li>The spread of these curves visually represents the BNN's epistemic uncertainty. Where the curves are tightly packed, the BNN is confident. Where they spread out (especially in regions with no data), the BNN is uncertain.</li>
                                    </ul>
                                </li>
                            </ol>
                        </p>
                        <p className="mt-3"><strong>Pedagogical Goal:</strong> This exercise is not about full BNN implementation at this stage but about visualizing the core concept: a BNN doesn't give one answer, but a range of possibilities reflecting its uncertainty. This makes the abstract idea of a "distribution over possible neural networks" more intuitive before diving into complex inference techniques.</p>
                    </div>
                    <button className="llm-button" onClick={() => handleSummarize('module2-4')}>✨ Summarize Module</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('module2-4')}>✨ Generate Quiz Question</button>
                    <div id="module2-4-output" className="llm-output hidden"></div>
                </section>

                <section id="conclusions" className="content-section space-y-4">
                    <h2 className="text-3xl font-semibold border-b pb-2">Conclusions</h2>
                    <p className="text-lg leading-relaxed">This section summarizes the key takeaways from the Bayesian Deep Learning (BDL) crash course. It reiterates how BDL offers a robust framework for uncertainty quantification, moving beyond simple point estimates to full probability distributions over model parameters.</p>
                    <p>Key benefits highlighted include:
                        <ul className="list-disc list-inside space-y-2 pl-4">
                            <li>Enhanced model reliability through explicit uncertainty modeling (aleatoric and epistemic).</li>
                            <li>Improved decision-making in safety-critical applications by understanding model confidence.</li>
                            <li>Better overfitting control, especially with limited data, due to Bayesian model averaging.</li>
                            <li>Principled ways to incorporate prior domain knowledge.</li>
                        </ul>
                    </p>
                    <p>While exact inference is challenging, advancements in approximate inference methods and libraries like TensorFlow Probability, Pyro, and NumPyro are making BDL more accessible and scalable. The course's hands-on approach aims to equip practitioners with the skills to implement BNNs and contribute to building more trustworthy and responsible AI systems.</p>
                    <button className="llm-button" onClick={() => handleSummarize('conclusions')}>✨ Summarize Section</button>
                    <button className="llm-button" onClick={() => handleGenerateQuiz('conclusions')}>✨ Generate Quiz Question</button>
                    <div id="conclusions-output" className="llm-output hidden"></div>
                </section>
            </main>
        </div>

        <footer className="bg-gray-700 text-white text-center p-4 mt-8">
            <p>&copy; 2024 Interactive BDL Course Explorer. Content based on the "Practical Bayesian Deep Learning" blueprint.</p>
        </footer>
      </div>
    </>
  );
}
