(function() {
    'use strict';

    // Globale variabler for data som lastes inn
    let appConfig = {};
    let questions = [];
    let levels = [];

    // --- Hjelpefunksjon for å laste JSON ---
    async function loadJSON(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Could not load JSON from ${filePath}:`, error);
            return null;
        }
    }

    // --- Last inn all konfigurasjonsdata ---
    async function loadAllData() {
        // Prøv å laste fra API-endepunkter først
        let configData = await loadJSON('/api/config');
        let questionsData = await loadJSON('/api/questions');
        let levelsData = await loadJSON('/api/levels');

        // Fallback til lokale filer dersom API-et ikke svarer
        if (!configData || !questionsData || !levelsData) {
            console.warn('Falling back to local JSON files.');
            configData = await loadJSON('config_no.json');
            questionsData = await loadJSON('questions_no.json');
            levelsData = await loadJSON('levels_no.json');
        }

        if (configData && questionsData && levelsData) {
            appConfig = configData;
            questions = questionsData;
            levels = levelsData;
            return true;
        }
        return false;
    }

    let currentQuestion = 0;
    let answers = [];
    let userScore = 0; 
    let maxPossibleScore = 25;
    let radarChartInstance = null;

    const introCard = document.getElementById('intro-card');
    const questionContainer = document.getElementById('question-container');
    const resultContainer = document.getElementById('result-container');
    const questionsWrapper = document.getElementById('questions-wrapper');
    const nextButton = document.getElementById('next-btn');
    const prevButton = document.getElementById('prev-btn');
    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');
    const progressBar = document.getElementById('progress');
    const levelNumberActualSpan = document.getElementById('level-number-actual');
    const levelNameActualSpan = document.getElementById('level-name-actual');
    const resultScoreSpan = document.getElementById('score');
    const maxScoreDisplaySpan = document.getElementById('max-score-display');
    const resultDescriptionP = document.getElementById('result-description');
    const toggleCharacteristicsBtn = document.getElementById('toggle-characteristics-btn');
    const buttonTextPlaceholder = toggleCharacteristicsBtn.querySelector('.button-text-placeholder');
    const levelDetailsContentDiv = document.getElementById('level-details-content');
    const characteristicsUl = document.getElementById('level-characteristics');
    const recommendationsContainerDiv = document.getElementById('recommendations-container');
    const recommendationsListStructured = document.getElementById('recommendations-list-structured');
    const gapsContainerDiv = document.getElementById('gaps-container');
    const gapsTitleH4 = document.getElementById('gaps-title');
    const gapsListDiv = document.getElementById('gaps-list');
    const maturityProfileDisplayDiv = document.getElementById('maturity-profile-display');
    const canvas = document.getElementById('result-canvas');
    const radarCanvas = document.getElementById('radar-chart');
    let ctx; 
    let radarCtx;

    startButton.addEventListener('click', startEvaluation);
    nextButton.addEventListener('click', goToNextQuestion);
    prevButton.addEventListener('click', goToPreviousQuestion);
    restartButton.addEventListener('click', resetEvaluation);

    if (toggleCharacteristicsBtn && levelDetailsContentDiv && buttonTextPlaceholder) {
        toggleCharacteristicsBtn.addEventListener('click', () => {
            const isHidden = levelDetailsContentDiv.hidden;
            levelDetailsContentDiv.hidden = !isHidden;
            toggleCharacteristicsBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            const arrowSpan = toggleCharacteristicsBtn.querySelector('.icon-toggle');
            if (isHidden) {
                buttonTextPlaceholder.textContent = "Skjul kjennetegn";
                if(arrowSpan) arrowSpan.textContent = '▲';
            } else {
                buttonTextPlaceholder.textContent = "Vis kjennetegn for nivået";
                if(arrowSpan) arrowSpan.textContent = '▼';
            }
        });
    }

    function startEvaluation() {
        introCard.style.display = 'none';
        resultContainer.style.display = 'none';
        questionContainer.style.display = 'block';
        currentQuestion = 0;
        answers = Array(questions.length).fill(null);
        userScore = 0;
        maxPossibleScore = questions.length * 5; 
        loadQuestion(currentQuestion);
        updateStepIndicator();
        updateProgress();
    }

    function loadQuestion(index) {
        if (index < 0 || index >= questions.length) return;
        currentQuestion = index;
        const questionData = questions[index];
        questionsWrapper.innerHTML = '';
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.textContent = questionData.question;
        questionsWrapper.appendChild(questionDiv);
        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');
        questionData.options.forEach((option, i) => {
            const optionElement = document.createElement('button');
            optionElement.type = 'button';
            optionElement.classList.add('option');
            const optionContent = document.createElement('div');
            optionContent.classList.add('option-content');
            if (option.isNAOption) {
                const naIndicator = document.createElement('div');
                naIndicator.classList.add('na-indicator');
                naIndicator.textContent = '(Ikke relevant)';
                optionContent.appendChild(naIndicator);
            } else {
                const levelIndicator = document.createElement('div');
                levelIndicator.classList.add('level-indicator');
                for (let level = 1; level <= 5; level++) {
                    const levelCircle = document.createElement('div');
                    levelCircle.classList.add('level-circle');
                    if (level <= option.score) levelCircle.classList.add('filled');
                    levelIndicator.appendChild(levelCircle);
                }
                optionContent.appendChild(levelIndicator);
            }
            const optionText = document.createElement('span');
            optionText.textContent = option.text;
            optionContent.appendChild(optionText);
            optionElement.appendChild(optionContent);
            if (answers[index] === i) optionElement.classList.add('selected');
            optionElement.addEventListener('click', () => selectOption(i));
            optionsDiv.appendChild(optionElement);
        });
        questionsWrapper.appendChild(optionsDiv);
        prevButton.disabled = index === 0;
        nextButton.disabled = answers[index] === null;
        nextButton.textContent = (index === questions.length - 1) ? 'Se resultat' : 'Neste';
        updateProgress();
    }

    function selectOption(optionIndex) {
        answers[currentQuestion] = optionIndex;
        const currentOptions = questionsWrapper.querySelectorAll('.option');
        currentOptions.forEach((element, i) => {
            element.classList.toggle('selected', i === optionIndex);
        });
        nextButton.disabled = false;
    }
    
    function goToNextQuestion() {
        if (currentQuestion < questions.length - 1) {
            loadQuestion(currentQuestion + 1);
        } else {
            showResult();
        }
        updateStepIndicator();
    }
    function goToPreviousQuestion() {
        if (currentQuestion > 0) {
            loadQuestion(currentQuestion - 1);
            updateStepIndicator();
        }
    }
    function updateProgress() {
        const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = progressPercentage + '%';
    }
    function updateStepIndicator() {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, i) => {
            step.classList.remove('active', 'completed');
            if (i === currentQuestion) step.classList.add('active');
            else if (i < currentQuestion) step.classList.add('completed');
        });
    }

    function setIcon(titleElement, iconSvgString) {
         if (titleElement) {
            let iconPlaceholder = titleElement.querySelector('.section-icon-placeholder');
            if (iconPlaceholder && !iconPlaceholder.querySelector('svg')) {
                iconPlaceholder.innerHTML = iconSvgString;
            }
        }
    }
    function clearIcon(titleElement){
        if(titleElement){
            let iconPlaceholder = titleElement.querySelector('.section-icon-placeholder');
            if(iconPlaceholder) iconPlaceholder.innerHTML = '';
        }
    }

    function calculateOverallScores() {
        let rawUserScore = 0;
        let currentMaxRawScore = 0;
        answers.forEach((answerIndex, questionIndex) => {
            const maxScoreForThisQuestion = 5;
            if (answerIndex !== null) {
                const selectedOption = questions[questionIndex].options[answerIndex];
                if (selectedOption.score !== "NA") {
                    rawUserScore += selectedOption.score;
                    currentMaxRawScore += maxScoreForThisQuestion;
                }
            } else { 
                currentMaxRawScore += maxScoreForThisQuestion;
            }
        });
        userScore = rawUserScore;
        maxPossibleScore = currentMaxRawScore > 0 ? currentMaxRawScore : (questions.length * 5);
    }

    function getCategoryScores(useWeights = false) {
        const categoryData = {};
        // Hent konfigurasjonsverdier én gang for lesbarhet
        const useWeightingLogic = useWeights && appConfig.enableCategoryWeighting;
        const currentCategoryWeights = appConfig.categoryWeights || {};
        const currentDefaultWeight = appConfig.defaultCategoryWeight !== undefined ? appConfig.defaultCategoryWeight : 1.0;

        questions.forEach((currentQuestionData, index) => { // Tydeligere variabelnavn
            const categoryName = currentQuestionData.category;
            if (!categoryData[categoryName]) {
                categoryData[categoryName] = { rawTotalScore: 0, weightedTotalScore: 0, numApplicableQuestions: 0 };
            }

            if (answers[index] !== null) {
                const selectedOption = currentQuestionData.options[answers[index]];
                
                if (selectedOption.score !== "NA") {
                    categoryData[categoryName].rawTotalScore += selectedOption.score;
                    const weight = currentCategoryWeights[categoryName] || currentDefaultWeight;
                    categoryData[categoryName].weightedTotalScore += (selectedOption.score * weight);
                    categoryData[categoryName].numApplicableQuestions++;
                }
            } else { 
                // Hvis ubesvart, teller det fortsatt som et relevant spm for kategorien for gj.snitt
                categoryData[categoryName].numApplicableQuestions++;
            }
        });

        const avgScores = {};
        for (const categoryName in categoryData) {
            if (categoryData[categoryName].numApplicableQuestions > 0) {
                const rawAvg = categoryData[categoryName].rawTotalScore / categoryData[categoryName].numApplicableQuestions;
                if (useWeightingLogic) {
                    const weight = currentCategoryWeights[categoryName] || currentDefaultWeight;
                    avgScores[categoryName] = rawAvg * weight; // Vektet gjennomsnitt
                } else {
                    avgScores[categoryName] = rawAvg; // Uvektet gjennomsnitt
                }
            } else {
                avgScores[categoryName] = 0; 
            }
        }
        return avgScores;
    }

    function evaluateMaturityProfileCondition(conditionLogic, categoryScores) {
        const parseToken = (token) => {
            const parts = token.split('_');
            const potentialOp = parts[parts.length - 1];
            if (potentialOp === 'min' || potentialOp === 'max') {
                parts.pop();
                return { category: parts.join('_'), operator: potentialOp };
            }
            return { category: token, operator: null };
        };
        let allConditionsMet = true;
        for (const key in conditionLogic) {
            const threshold = conditionLogic[key];
    
            if (key.includes('_OR_')) {
                const [token1, token2] = key.split('_OR_');
                const first = parseToken(token1);
                const second = parseToken(token2);
                const score1 = first.category in categoryScores ? categoryScores[first.category] : 0;
                const score2 = second.category in categoryScores ? categoryScores[second.category] : 0;
                const check = (score, op) => {
                    switch (op) {
                        case 'min': return score >= threshold;
                        case 'max': return score <= threshold;
                        default: return score === threshold;
                    }
                };
                if (!(check(score1, first.operator) || check(score2, second.operator))) {
                    allConditionsMet = false;
                    break;
                }
                continue;
            }
    
            const { category, operator } = parseToken(key);
            if (category === 'balancedProfile') {
                const rawAvgScores = getCategoryScores(false);
                const rawScoresArray = Object.values(rawAvgScores).filter(s => typeof s === 'number');
                if (rawScoresArray.length < Object.keys(rawAvgScores).length) {
                    allConditionsMet = false; break;
                }
                if (!(Math.min(...rawScoresArray) >= conditionLogic.balancedProfile_min &&
                      (Math.max(...rawScoresArray) - Math.min(...rawScoresArray)) <= conditionLogic.balancedProfile_maxDiff)) {
                    allConditionsMet = false; break;
                }
                continue;
            }
    
            if (!categoryScores.hasOwnProperty(category)) { allConditionsMet = false; break; }
            const scoreToCheck = categoryScores[category] || 0;
            switch (operator) {
                case 'min':
                    if (!(scoreToCheck >= threshold)) { allConditionsMet = false; }
                    break;
                case 'max':
                    if (!(scoreToCheck <= threshold)) { allConditionsMet = false; }
                    break;
                default:
                    if (scoreToCheck !== threshold) { allConditionsMet = false; }
            }
            if (!allConditionsMet) break;
        }
        return allConditionsMet;
    }

    function showResult() {
        calculateOverallScores(); 
        const userLevel = findLevel(userScore);
        
        questionContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        const levelNumberMatch = userLevel.name.match(/^(\d+)\./);
        const levelNumberText = levelNumberMatch ? `nivå ${levelNumberMatch[1]}` : "";
        const levelNameOnlyText = userLevel.name.replace(/^(\d+)\.\s*/, '');

        if (levelNumberActualSpan) levelNumberActualSpan.textContent = levelNumberText;
        if (levelNameActualSpan) levelNameActualSpan.textContent = levelNameOnlyText;
        resultScoreSpan.textContent = userScore;
        if(maxScoreDisplaySpan) maxScoreDisplaySpan.textContent = `/${maxPossibleScore}`;
        
        let dynamicDescriptionText = userLevel.description;
        const categoryScoresForLogic = getCategoryScores(appConfig.enableCategoryWeighting);
        const unweightedCategoryScores = getCategoryScores(false);
        const sortedCategoriesByWeightedScore = Object.entries(categoryScoresForLogic).sort(([,a],[,b]) => a-b);
        
        if (sortedCategoriesByWeightedScore.length > 0) {
            const weakestCategoryName = sortedCategoriesByWeightedScore[0][0];
            if (unweightedCategoryScores[weakestCategoryName] < 2.5 && sortedCategoriesByWeightedScore.length > 1) {
                dynamicDescriptionText += ` Spesielt innen ${weakestCategoryName.toLowerCase()} ser det ut til å være betydelig forbedringspotensial.`;
            }
            const strongestCategoryName = sortedCategoriesByWeightedScore[sortedCategoriesByWeightedScore.length - 1][0];
            if (unweightedCategoryScores[strongestCategoryName] > 3.5 && strongestCategoryName !== weakestCategoryName && sortedCategoriesByWeightedScore.length > 1) {
                 dynamicDescriptionText += ` Samtidig viser dere en lovende styrke innen ${strongestCategoryName.toLowerCase()}.`;
            }
        }
        resultDescriptionP.textContent = dynamicDescriptionText;
        
        let matchedProfile = null;
        if (appConfig.maturityProfiles) {
            for (const profile of appConfig.maturityProfiles) {
                if (evaluateMaturityProfileCondition(profile.conditionLogic, categoryScoresForLogic)) {
                    matchedProfile = profile;
                    break;
                }
            }
        }
        if (matchedProfile) {
            console.log("Matchet Modenhetsprofil:", matchedProfile);
            if (maturityProfileDisplayDiv) {
                 maturityProfileDisplayDiv.innerHTML = `<h4>Din Modenhetsprofil: ${matchedProfile.name}</h4>
                                                   <p>${matchedProfile.description}</p>
                                                   <p><strong>Typiske styrker:</strong> ${matchedProfile.strengths.join(', ')}</p>
                                                   <p><strong>Typiske fallgruver:</strong> ${matchedProfile.pitfalls.join(', ')}</p>`;
                 maturityProfileDisplayDiv.style.display = 'block';
            }
        } else {
            if (maturityProfileDisplayDiv) maturityProfileDisplayDiv.style.display = 'none';
        }

        characteristicsUl.innerHTML = '';
        if (userLevel.characteristics && userLevel.characteristics.length > 0 && buttonTextPlaceholder) {
            userLevel.characteristics.forEach(char => {
                const li = document.createElement('li'); li.textContent = char; characteristicsUl.appendChild(li);
            });
            toggleCharacteristicsBtn.style.display = 'inline-flex';
            levelDetailsContentDiv.hidden = true; 
            toggleCharacteristicsBtn.setAttribute('aria-expanded', 'false');
            buttonTextPlaceholder.textContent = "Vis kjennetegn for nivået";
            const arrowSpan = toggleCharacteristicsBtn.querySelector('.icon-toggle');
            if(arrowSpan) arrowSpan.textContent = '▼';
        } else {
            toggleCharacteristicsBtn.style.display = 'none';
            levelDetailsContentDiv.hidden = true;
        }
        
        recommendationsListStructured.innerHTML = ''; 
        const identifiedGaps = identifyGaps();
        const identifiedGapIds = identifiedGaps.map(g => g.id);
        let displayedRecommendationsTexts = new Set();
        let finalRecommendations = [];

        userLevel.recommendations.forEach(rec => {
            if (rec.addressesGaps && rec.addressesGaps.some(gapId => identifiedGapIds.includes(gapId)) && !displayedRecommendationsTexts.has(rec.text)) {
                finalRecommendations.push({text: rec.text, highlight: true});
                displayedRecommendationsTexts.add(rec.text);
            }
        });
        for(let i=0; i < Math.min(2, sortedCategoriesByWeightedScore.length); i++) {
            const weakCategory = sortedCategoriesByWeightedScore[i][0];
            userLevel.recommendations.forEach(rec => {
                if (rec.tags && rec.tags.includes(weakCategory) && !displayedRecommendationsTexts.has(rec.text)) {
                    finalRecommendations.push({text: rec.text, highlight: true});
                    displayedRecommendationsTexts.add(rec.text);
                }
            });
        }
        userLevel.recommendations.forEach(rec => {
            if (!displayedRecommendationsTexts.has(rec.text) && finalRecommendations.length < 5) {
                finalRecommendations.push({text: rec.text, highlight: false});
                displayedRecommendationsTexts.add(rec.text);
            }
        });
        finalRecommendations = finalRecommendations.filter((rec, index, self) => 
            index === self.findIndex((r) => r.text === rec.text)
        );

        if (finalRecommendations.length > 0) {
            finalRecommendations.forEach(rec => {
                const recItem = document.createElement('div');
                recItem.classList.add('recommendation-item');
                if(rec.highlight) recItem.classList.add('highlight');
                recItem.textContent = rec.text;
                recommendationsListStructured.appendChild(recItem);
            });
            recommendationsContainerDiv.style.display = 'block';
            setIcon(recommendationsContainerDiv.querySelector('h4'), appConfig.recommendationIconSvgString);
        } else {
            recommendationsContainerDiv.style.display = 'none';
        }
        
        gapsListDiv.innerHTML = '';
        if (identifiedGaps.length > 0) {
            gapsContainerDiv.style.display = 'block';
            setIcon(gapsTitleH4, appConfig.gapIconSvgString);
            identifiedGaps.forEach(gap => {
                const gapItem = document.createElement('div');
                gapItem.classList.add('gap-item');
                gapItem.innerHTML = `
                    <div class="gap-title">${gap.title}</div>
                    <div class="gap-description">${gap.description}</div>
                    <div class="gap-recommendation">${gap.recommendation}</div>`;
                gapsListDiv.appendChild(gapItem);
            });
        } else {
            gapsContainerDiv.style.display = 'none';
        }
        
        if (canvas) { requestAnimationFrame(() => { drawResultVisualization(userScore, userLevel); }); }
        if (radarCanvas) { requestAnimationFrame(() => { drawRadarChart(); }); }

        // Lagre resultatet dersom backend er tilgjengelig
        saveResultsToServer();
    }
    
    function identifyGaps() {
        const gaps = [];
        if (answers.length !== questions.length || answers.some(a => a === null)) return gaps;
        
        const categoryScoresForGap = getCategoryScores(appConfig.enableCategoryWeighting);
        
        const getScore = (categoryName) => categoryScoresForGap[categoryName] !== undefined ? categoryScoresForGap[categoryName] : 0;
        const getRawScore = (categoryName) => getCategoryScores(false)[categoryName] !== undefined ? getCategoryScores(false)[categoryName] : 0; // For terskler

        const highRaw = 3.5;
        const lowRaw = 2.5;
        const midRaw = 2.5; 

        if (getRawScore("Organisasjon") >= highRaw && getRawScore("Dataanalyse") <= lowRaw) gaps.push({ id: "gap_kompetanse_vs_analyse", title: "Kompetanse vs. Analysepraksis", description: "Høy digital kompetanse, men enkle analysemetoder.", recommendation: "Implementer mer avanserte analyseverktøy/metodikker. Vurder opplæring." });
        if (getRawScore("Strategi") >= highRaw && getRawScore("Datainnsamling") <= lowRaw) gaps.push({ id: "gap_strategi_vs_innsamling", title: "Strategi vs. Datainnsamling", description: "Datadrevet strategi, men manuell/fragmentert datainnsamling.", recommendation: "Automatiser datainnsamlingen. Invester i systemintegrasjon." });
        if (getRawScore("Dataprosesser") >= highRaw && getRawScore("Dataanalyse") <= lowRaw) gaps.push({ id: "gap_kvalitet_vs_analysekapasitet", title: "Datakvalitet vs. Analysekapasitet", description: "God datakvalitet, men utnyttes ikke i avanserte analyser.", recommendation: "Utvikle mer sofistikerte analysekapabiliteter (dashboards, prediksjon)." });
        if (getRawScore("Datainnsamling") >= highRaw && getRawScore("Dataanalyse") <= lowRaw) gaps.push({ id: "gap_datainnsamling_vs_analyse", title: "Datainnsamling vs. Analyse", description: "Automatisert datainnsamling, men grunnleggende analyse.", recommendation: "Utnytt dataene bedre med avanserte analysemetoder/verktøy." });
        if (getRawScore("Strategi") >= highRaw && getRawScore("Organisasjon") <= lowRaw) gaps.push({ id: "gap_strategi_vs_kultur", title: "Strategi vs. Organisasjonskultur", description: "Datadrevet strategi, men kulturen støtter ikke fullt ut.", recommendation: "Invester i digital kompetansebygging og endringsledelse." });
        if (getRawScore("Dataanalyse") >= highRaw && getRawScore("Strategi") <= lowRaw) gaps.push({ id: "gap_analyse_vs_strategi", title: "Analysekapasitet vs. Strategisk Utnyttelse", description: "Avanserte analyser, men ikke godt integrert i overordnet strategi.", recommendation: "Koble analyser tydeligere til forretningsstrategi og beslutninger." });
        if (getRawScore("Strategi") <= lowRaw && (getRawScore("Dataanalyse") >=highRaw || getRawScore("Datainnsamling") >= highRaw)) gaps.push({ id: "gap_operativ_vs_strategi", title: "Operativ Styrke vs. Strategisk Forankring", description: "Gode på datainnsamling/analyse, men mangler en klar overordnet digital strategi.", recommendation: "Utvikle eller forankre en tydelig digital strategi som utnytter de operative styrkene." });
        if (getRawScore("Dataprosesser") <= lowRaw && (getRawScore("Datainnsamling") >= midRaw || getRawScore("Dataanalyse") >= midRaw)) gaps.push({ id: "gap_datavolum_vs_kontroll", title: "Datavolum vs. Datakontroll", description: "Samler og/eller analyserer en del data, men har svake prosesser for datakvalitet og -forvaltning.", recommendation: "Prioriter etablering av formelle datakvalitets- og dataforvaltningsprosesser for å sikre pålitelig innsikt." });
        if (getRawScore("Organisasjon") <= lowRaw && (getRawScore("Strategi") >= midRaw || getRawScore("Dataanalyse") >= midRaw || getRawScore("Datainnsamling") >=midRaw)) gaps.push({ id: "gap_system_vs_menneske", title: "System/Strategi vs. Menneskelig Faktor", description: "Har systemer, strategi eller data, men lav digital kompetanse eller kultur for endring i organisasjonen.", recommendation: "Fokuser på opplæring, kompetanseheving og kulturutvikling for å maksimere verdien av digitale initiativer." });
            
        return gaps;
    }

    function findLevel(currentScore) { 
        return levels.find(level => currentScore >= level.range[0] && currentScore <= level.range[1]) || levels[0]; 
    }
    function drawResultVisualization(currentScore, userLevelObj) { 
        if (!canvas || canvas.offsetWidth === 0) { return; }
        ctx = canvas.getContext('2d');
        if (!ctx) { return; }
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        const padding = 30;
        const stepHeight = (height - 2 * padding) / 5;
        const stepWidthBase = width - 2 * padding;
        const stepWidths = [1, 0.84, 0.68, 0.52, 0.36].map(f => stepWidthBase * f);
        for (let i = 0; i < 5; i++) {
            const y = height - padding - (i + 1) * stepHeight;
            const w = stepWidths[i];
            ctx.beginPath();
            ctx.moveTo(padding, y); ctx.lineTo(padding + w, y); ctx.lineTo(padding + w, y + stepHeight); ctx.lineTo(padding, y + stepHeight); ctx.closePath();
            ctx.fillStyle = (levels[i] === userLevelObj) ? levels[i].color : hexToRgba(levels[i].color, 0.4);
            ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
            ctx.font = "bold 16px Arial"; ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
            const displayName = levels[i].name.replace(/^[0-9]+\.\s*/, ''); 
            ctx.fillText(`${i + 1}. ${displayName}`, padding + 10, y + stepHeight / 2);
        }
        const userLevelIdx = levels.findIndex(l => l === userLevelObj);
        if (userLevelIdx !== -1) {
            const y = height - padding - (userLevelIdx + 1) * stepHeight + stepHeight / 2;
            const w = stepWidths[userLevelIdx];
            const markerX = padding + w - 25;
            ctx.beginPath(); ctx.moveTo(markerX, y - 40); ctx.lineTo(markerX, y - 26); ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(markerX - 7, y - 35); ctx.lineTo(markerX, y - 25); ctx.lineTo(markerX + 7, y - 35); ctx.closePath(); ctx.fillStyle = "#3b82f6"; ctx.fill();
            ctx.beginPath(); ctx.arc(markerX, y, 16, 0, Math.PI * 2); ctx.fillStyle = "#3b82f6"; ctx.fill();
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
            ctx.fillStyle = "#fff"; ctx.font = "bold 15px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Du", markerX, y);
        }
    }
    function drawRadarChart() {
        if (!radarCanvas || typeof Chart === 'undefined') { return; }
        radarCtx = radarCanvas.getContext('2d');
        if (!radarCtx) { return; }
        const categoryAvgScores = getCategoryScores(false); 
        const categoryLabels = Object.keys(categoryAvgScores);
        const dataForChart = categoryLabels.map(label => categoryAvgScores[label] !== undefined ? parseFloat(categoryAvgScores[label].toFixed(1)) : 0);
        if (radarChartInstance) { radarChartInstance.destroy(); }
        radarChartInstance = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: categoryLabels,
                datasets: [{
                    label: 'Din score per kategori', data: dataForChart, fill: true,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgb(59, 130, 246)',
                    pointBackgroundColor: 'rgb(59, 130, 246)', pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff', pointHoverBorderColor: 'rgb(59, 130, 246)'
                }]
            },
            options: { 
                elements: { line: { borderWidth: 3 }},
                scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: 5, ticks: { stepSize: 1, backdropColor: 'rgba(255,255,255, 0.75)', font: { size: 10 }}, pointLabels: { font: { size: 12, weight: '500'}}} },
                plugins: { legend: { display: false }, tooltip: {callbacks: { label: function(context) { return context.dataset.label + ': ' + context.formattedValue; }}}},
                responsive: true, maintainAspectRatio: true
            }
        });
    }
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    async function saveResultsToServer() {
        try {
            await fetch('/api/responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    answers: answers,
                    score: userScore,
                    categoryScores: getCategoryScores(false)
                })
            });
        } catch (e) {
            console.error('Failed to save results:', e);
        }
    }
    function resetEvaluation() { 
        resultContainer.style.display = 'none'; questionContainer.style.display = 'none'; introCard.style.display = 'block';
        currentQuestion = 0; answers = Array(questions.length).fill(null); userScore = 0; maxPossibleScore = questions.length * 5;
        if(maxScoreDisplaySpan) maxScoreDisplaySpan.textContent = `/${maxPossibleScore}`;
        progressBar.style.width = '0%';
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active', 'completed'));
        nextButton.textContent = 'Neste'; prevButton.disabled = true; nextButton.disabled = true;
        questionsWrapper.innerHTML = ''; characteristicsUl.innerHTML = '';
        if (toggleCharacteristicsBtn && levelDetailsContentDiv && buttonTextPlaceholder) {
            levelDetailsContentDiv.hidden = true; toggleCharacteristicsBtn.setAttribute('aria-expanded', 'false');
            toggleCharacteristicsBtn.style.display = 'none'; buttonTextPlaceholder.textContent = "Vis kjennetegn for nivået";
            const arrowSpan = toggleCharacteristicsBtn.querySelector('.icon-toggle');
            if(arrowSpan) arrowSpan.textContent = '▼';
        }
        if (recommendationsListStructured) recommendationsListStructured.innerHTML = '';
        if (recommendationsContainerDiv) { recommendationsContainerDiv.style.display = 'none'; clearIcon(recommendationsContainerDiv.querySelector('h4'));}
        gapsListDiv.innerHTML = ''; gapsContainerDiv.style.display = 'none'; clearIcon(gapsTitleH4);
        if (maturityProfileDisplayDiv) { maturityProfileDisplayDiv.innerHTML = ''; maturityProfileDisplayDiv.style.display = 'none';}
        if (canvas && canvas.getContext('2d')) { const tempCtx = canvas.getContext('2d'); tempCtx.clearRect(0, 0, canvas.width, canvas.height); }
        if (radarChartInstance) { radarChartInstance.destroy(); radarChartInstance = null; }
        if (radarCanvas && radarCanvas.getContext('2d')) { const tempRadarCtx = radarCanvas.getContext('2d'); tempRadarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height); }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const dataLoaded = await loadAllData();
        if (dataLoaded) {
            startButton.disabled = false; 
            console.log("App data loaded successfully.");
        } else {
            startButton.disabled = true;
            const introCard = document.getElementById('intro-card'); // Sørg for at dette elementet finnes
            if (introCard) {
                const errorP = document.createElement('p');
                errorP.textContent = "Beklager, en feil oppstod under lasting av evalueringsdata. Prøv å laste siden på nytt.";
                errorP.style.color = "red";
                introCard.appendChild(errorP);
            }
            console.error("Failed to load essential app data. Application cannot start.");
        }
    });
    if(startButton) startButton.disabled = true;
    if (typeof module !== "undefined" && module.exports) {
        module.exports.evaluateMaturityProfileCondition = evaluateMaturityProfileCondition;
    }

})();