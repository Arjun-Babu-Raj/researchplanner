
export type Framework = {
  name: string;
  description: string;
  principles: string;
};

export const frameworks: Record<string, Framework[]> = {
  Objectives: [
    {
      name: 'SMART',
      description: 'For setting specific, measurable, achievable, relevant, and time-bound goals.',
      principles: `
- Specific: Is the objective clear and well-defined?
- Measurable: Can progress towards the objective be quantified or assessed?
- Achievable: Is the objective realistic and attainable within the project's scope?
- Relevant: Does the objective align with the overall study goals?
- Time-bound: Is there a clear deadline or timeline for achieving the objective?
      `.trim(),
    },
  ],
  Methodology: [
    {
      name: 'PICO(T)',
      description: 'For clinical and evidence-based questions to ensure all components are defined.',
      principles: `
- Patient/Problem/Population: Does the study design clearly define who the study is about?
- Intervention: Is the intervention or exposure being considered clearly specified?
- Comparison: Is there a clear comparison group (e.g., placebo, standard care)?
- Outcome: Is the primary outcome to be measured clearly defined?
- (T)imeframe: (Optional) Is the follow-up period specified?
            `.trim(),
    },
    {
      name: 'FINER',
      description: 'For evaluating the feasibility and impact of the research question.',
      principles: `
- Feasible: Does the methodology seem achievable with reasonable resources, time, and expertise?
- Interesting: Is the study design interesting to the scientific community?
- Novel: Does the study design promise to add new information, or extend/refute previous findings?
- Ethical: Are the procedures described ethically sound?
- Relevant: Is the study design relevant to scientific knowledge, clinical practice, or policy?
            `.trim(),
    },
  ],
  SampleSize: [
     {
      name: 'Power Analysis Reporting Guidelines',
      description: 'For ensuring the study has adequate statistical power and a complete rationale.',
      principles: `
- Primary Outcome: Is the primary outcome used for the calculation explicitly mentioned?
- Alpha (α) Level: Is the chosen alpha level (e.g., 0.05) clearly stated?
- Statistical Power (1 - β): Is the desired statistical power (e.g., 80% or 0.8) clearly stated?
- Effect Size Justification: Is the justification for the expected effect size provided (e.g., based on prior literature, a pilot study, or the minimum clinically important difference)?
- Statistical Test: Is the statistical test that the power analysis is based on identified (e.g., two-sample t-test, ANOVA)?
      `.trim(),
    },
  ],
  DataCollection: [
    {
      name: 'Reporting Guidelines (STROBE/CONSORT Items)',
      description: 'For ensuring clarity, replicability, and completeness in quantitative data collection plans.',
      principles: `
- Setting: Is the location and context of data collection clearly described?
- Variables: Are all variables mentioned in the objectives accounted for? Is it clear how each one will be measured?
- Measurement Instruments: If using a survey or scale, is it identified (e.g., "the Beck Depression Inventory-II")? Is there any mention of its validity or reliability?
- Bias: Does the plan mention any steps to minimize potential bias (e.g., blinding, standardized procedures)?
      `.trim(),
    },
    {
      name: "Guba & Lincoln's Criteria for Trustworthiness",
      description: 'For ensuring rigor and robustness in qualitative data collection methods.',
      principles: `
- Credibility (Internal validity): Does the plan include methods like prolonged engagement, peer debriefing, or member checking?
- Transferability (External validity): Does the plan mention providing "thick description" of the participants and context?
- Dependability (Reliability): Does the plan include creating an "audit trail" of all research decisions and data?
- Confirmability (Objectivity): Does the plan mention how researcher reflexivity (acknowledging biases) will be practiced?
      `.trim(),
    },
  ],
  Analysis: [
    {
        name: 'Statistical Analysis Plan (SAP) Core Elements',
        description: 'For ensuring a clear and comprehensive quantitative analysis plan.',
        principles: `
- Objective-to-Test Mapping: Is every objective clearly mapped to a specific statistical test?
- Handling of Variables: Does the plan specify how variables will be treated (e.g., continuous, categorical)?
- Descriptive Statistics: Does it state which descriptive stats will be used (e.g., mean/SD for normal data, median/IQR for skewed data, frequencies/percentages for categorical)?
- Handling of Missing Data: Does the plan acknowledge and propose a strategy for missing data (e.g., imputation, complete case analysis)?
        `.trim(),
    },
    {
      name: "Braun & Clarke's 6 Phases of Thematic Analysis",
      description: 'A method for identifying, analyzing, and reporting patterns (themes) within qualitative data.',
      principles: `
- Phase 1: Familiarizing yourself with the data. Does the plan include a phase for data immersion?
- Phase 2: Generating initial codes. Does the plan describe how initial codes will be systematically generated from the data?
- Phase 3: Searching for themes. Does the plan describe how codes will be collated into potential themes?
- Phase 4: Reviewing themes. Does the plan involve a process for checking themes against coded extracts and the entire data set?
- Phase 5: Defining and naming themes. Does the plan specify a process for refining the specifics of each theme and generating clear names and definitions?
- Phase 6: Producing the report. Does the plan mention how the final analysis will be written up, connecting themes to the research question?
      `.trim(),
    },
  ],
};
