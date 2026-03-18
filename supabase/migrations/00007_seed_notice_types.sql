insert into public.notice_types (name, code, description, days_before_plan_year_end, frequency, applies_to) values

('Safe Harbor 401(k) Notice', 'SH_NOTICE',
 'Annual notice describing safe harbor contribution formula, vesting, and withdrawal rights. Required under IRC Section 401(k)(12)(D). Must be provided 30-90 days before plan year begins.',
 30, 'annual', '{safe_harbor,401k}'),

('QDIA Notice', 'QDIA_NOTICE',
 'Annual notice describing the qualified default investment alternative, right to direct investments, and how contributions will be invested absent direction. Required under ERISA Section 404(c)(5).',
 30, 'annual', '{all}'),

('Automatic Enrollment Notice', 'AUTO_ENROLL_NOTICE',
 'Annual notice for EACA or QACA plans describing automatic deferral percentage, right to opt out, investments used, and withdrawal rights. Required under IRC Section 414(w).',
 30, 'annual', '{auto_enrollment}'),

('Participant Fee Disclosure (404(a)(5))', 'FEE_DISCLOSURE',
 'Annual disclosure of plan-level and investment-level fee and expense information. Required under ERISA Section 404(a) and 29 CFR 2550.404a-5.',
 NULL, 'annual', '{all}'),

('Quarterly Fee Statement', 'FEE_STMT_Q',
 'Quarterly statement showing actual dollar amount of fees charged to participant account. Required under 29 CFR 2550.404a-5(c)(2)(ii).',
 NULL, 'quarterly', '{all}'),

('Summary Annual Report', 'SAR',
 'Summary of the plan''s annual financial report (Form 5500). Due within 9 months after plan year end. Required under ERISA Section 104(b)(3).',
 -270, 'annual', '{all}'),

('Summary Plan Description', 'SPD',
 'Comprehensive document describing plan provisions, eligibility, benefits, and participant rights. Provided within 90 days of becoming a participant. Required under ERISA Section 102.',
 NULL, 'event_driven', '{all}'),

('Summary of Material Modifications', 'SMM',
 'Notice describing material modifications to the plan. Due within 210 days after end of plan year in which change adopted. Required under ERISA Section 104(b)(1).',
 -210, 'event_driven', '{all}'),

('Annual Funding Notice', 'FUNDING_NOTICE',
 'Notice showing funded status, asset/liability information, and PBGC guarantee info for defined benefit plans. Due within 120 days after plan year end. Required under ERISA Section 101(f).',
 -120, 'annual', '{defined_benefit}'),

('Individual Benefit Statement', 'BENEFIT_STMT',
 'Statement showing accrued benefit, vested percentage, and account balance. Quarterly for participant-directed plans. Required under ERISA Section 105.',
 NULL, 'quarterly', '{all}'),

('RMD Notice', 'RMD_NOTICE',
 'Notice to participants approaching RMD age about required minimum distribution options and deadlines. Required under IRC Section 401(a)(9).',
 NULL, 'annual', '{rmd}'),

('Blackout Period Notice', 'BLACKOUT_NOTICE',
 'Advance notice when a blackout period will restrict participant investment/distribution abilities. At least 30 days before blackout. Required under ERISA Section 101(i).',
 NULL, 'event_driven', '{all}'),

('Rollover Notice (402(f))', 'ROLLOVER_NOTICE',
 'Notice explaining rollover options and tax consequences for eligible rollover distributions. 30-180 days before distribution. Required under IRC Section 402(f).',
 NULL, 'event_driven', '{all}'),

('QJSA/QPSA Notice', 'QJSA_QPSA',
 'Notice explaining joint/survivor annuity and preretirement survivor annuity forms and right to waive. Required under IRC Sections 401(a)(11), 417.',
 NULL, 'event_driven', '{defined_benefit}'),

('PBGC Annual Notice', 'PBGC_NOTICE',
 'Information about PBGC insurance coverage and funded status. Due within 120 days after plan year end. Required under ERISA Section 4011.',
 -120, 'annual', '{defined_benefit}');
