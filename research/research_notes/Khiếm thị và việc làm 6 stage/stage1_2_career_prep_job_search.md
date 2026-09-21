# Stage 1–2: Career Preparation and Job Search/Application Barriers for Visually Impaired (VI) People — Evidence, Existing Solutions, Gaps

Scope: ADC Hackathon 2026 (RMIT Vietnam) Stage 1 (career prep: image-based job ads, CV builders, career fairs/networking) and Stage 2 (job portals, career sites, PDF forms, AI screening/ATS). Research date: Sept 2026. Research was limited to ~16 tool calls; items not verified are listed under Gaps rather than stated as fact.

## Q1. How accessible are job portals, company career sites and applicant tracking systems (incl. Vietnamese platforms)?

### Takeaway
The general web is getting less accessible (WebAIM Million 2026: 95.9% of top home pages fail detectable WCAG checks, 53.1% have missing alt text, 51% have unlabeled form inputs) — exactly the failures that block VI job seekers from image-based ads and application forms. US survey data (PEAT) found nearly half of disabled applicants found online applications "difficult to impossible". No accessibility audits of VietnamWorks, TopCV, CareerViet or ITviec were found — a clear evidence gap and an opportunity for the hackathon team to produce its own quick audit.

### Cited Findings
- WebAIM Million 2026: 56,114,377 errors across 1M home pages, average 56.1 errors/page, up 10.1% from 51 in 2025; 95.9% of home pages had detectable WCAG 2 failures (94.8% in 2025) — [WebAIM Million 2026](https://webaim.org/projects/million/)
- Top 6 failure types 2026: low contrast text 83.9% of pages; missing image alt text 53.1%; missing form input labels 51%; empty links 46.3%; empty buttons 30.6%; missing document language 13.5% — [WebAIM Million 2026](https://webaim.org/projects/million/)
- 16.2% of all home page images had missing alt text; 10.8% of images with alt text had questionable/repetitive alt text; 33.1% of form inputs were not properly labeled — [WebAIM Million 2026](https://webaim.org/projects/million/)
- Pages with ARIA averaged 59.1 errors vs 42 without ARIA; average page element count rose to 1,437 (+22.5% in one year) — [WebAIM Million 2026](https://webaim.org/projects/million/); [secondary summary](https://www.changeincontent.com/web-accessibility-2026-webaim-report/)
- WebAIM's sector breakdown: "Careers" sites averaged 46.2 errors, 17.7% below the overall average (better than average, but still far from error-free) — [WebAIM Million 2026](https://webaim.org/projects/million/)
- PEAT (US Dept. of Labor-funded Partnership on Employment & Accessible Technology) survey: 46% of people with disabilities rated their last online job application "difficult to impossible"; 9% could not submit their application at all. Top issues: complex navigation, timeout restrictions, poor screen contrast, confusing/inconsistent instructions — [PEAT TalentWorks via HuffPost](https://www.huffpost.com/entry/new-initiative-seeks-to-a_b_9818778); [PEAT eRecruiting toolkit](https://www.peatworks.org/digital-accessibility-toolkits/talentworks/make-your-erecruiting-tools-accessible/) (note: survey is from ~2015–2016; old but still the most-cited figure)
- Workday states it aligns to WCAG 2.1 A/AA including the external candidate experience "from searching for open positions through hire", and publishes ACRs/VPATs against WCAG 2.2 A/AA, Section 508 and EN 301 549 — [Workday Accessibility](https://www.workday.com/en-us/company/accessibility.html)
- A UK government Workday accessibility statement documents known gaps: screen reader and keyboard users "may experience difficulty" using filtering features when searching jobs, and extraneous information is announced when moving between job description links — [The National Archives – Workday accessibility statement](https://www.nationalarchives.gov.uk/help/workday-accessibility-statement/); [GCA Workday statement](https://www.gca.gov.uk/workday-accessibility-statement)
- Vietnam context: ~7 million people with disabilities (7% of population aged 2+); only 31.7% of working-age PWD are employed vs 83.8% of people without disabilities — [VOV2](https://vov2.vov.vn/doi-song-xa-hoi/tang-co-hoi-viec-lam-cho-sinh-vien-khiem-thi-48737.vov2)
- Vietnamese press reports VI people struggle to access recruitment information and employment support services due to language and technology barriers — [Tuổi Trẻ](https://tuoitre.vn/nguoi-khiem-thi-it-co-hoi-hoc-tap-va-tim-viec-681636.htm) (via search snippet; not fully read); see also [Thanh Niên](https://thanhnien.vn/nguoi-khuyet-tat-tim-viec-lam-co-hoi-it-thach-thuc-nhieu-185518756.htm), [Dân trí](https://dantri.com.vn/lao-dong-viec-lam/ly-do-nguoi-khuyet-tat-gap-kho-khi-tim-kiem-viec-lam-20220830094658455.htm)

### Inferences
- The two failures that most directly block VI job seekers — missing alt text (image-only job ads, logos) and unlabeled form fields (application forms) — each affect roughly half of top websites. Vietnamese job portals are unlikely to be exceptions, but this is unverified.
- Accessibility at the ATS vendor level (Workday) does not guarantee accessibility on each employer's configured instance; employer-uploaded content (image job ads, PDF forms) sits outside vendor control.
- Many Vietnamese job ads are circulated as images/posters on Facebook groups and Zalo, not only on portals (common observation; no quantitative source found — see Gaps).

### Gaps
- No published accessibility audit (WCAG/WAVE/axe) of VietnamWorks, TopCV, CareerViet, ITviec, or LinkedIn in Vietnam was found. Suggest the team run WAVE/axe on 3–5 Vietnamese portals' search + apply flows and a NVDA/TalkBack test as primary evidence.
- No data on the share of Vietnamese job ads that are image-only.
- Greenhouse, Lever, SAP SuccessFactors candidate-flow VPATs were not retrieved.
- No recent (2023+) repeat of the PEAT survey found.
- PDF application-form accessibility: no quantitative data found on share of untagged PDF forms in recruitment.

## Q2. What is the evidence of AI hiring / ATS bias against disabled applicants, and what is the regulatory landscape?

### Takeaway
Peer-reviewed evidence (UW, FAccT 2024) shows GPT-4 ranked resumes with disability-related credentials lower; explicit prompting on DEI/disability-justice partly corrected it. US regulatory guidance has been withdrawn (EEOC removed AI guidance Jan 2025) though the ADA still applies; litigation (Mobley v. Workday) is advancing; the EU AI Act classifies hiring AI as high-risk. No Vietnam-specific AI-hiring rules or studies were found.

### Cited Findings
- UW study (Glazko, Mankoff et al., FAccT '24): GPT-4 asked to rank a CV vs the same CV enhanced with disability-related items (award, scholarship, panel, membership). The disability-enhanced CV ranked first in only 15 of 70 trials — [ACM FAccT 2024](https://dl.acm.org/doi/10.1145/3630106.3658933); [arXiv PDF](https://arxiv.org/pdf/2402.01732); [UW CREATE](https://create.uw.edu/create-researchers-find-chatgpt-biased-against-resumes-that-imply-disability-models-improvement)
- GPT-4's explanations exhibited explicit and implicit ableism, e.g. saying a candidate with depression had "additional focus on DEI and personal challenges" that detract from technical aspects of the role — [ScienceDaily](https://www.sciencedaily.com/releases/2024/06/240621172356.htm)
- A custom GPT instructed on DEI and disability-justice principles improved results: disability-enhanced CVs ranked above control in 37 of 60 trials (improvement uneven across disability types per the paper) — [FAccT paper PDF](https://facctconference.org/static/papers24/facct24-48.pdf)
- EEOC and DOJ issued technical guidance on 12 May 2022 on AI/algorithms and the ADA. EEOC framed three risk categories: failing to provide reasonable accommodation, screening out qualified individuals with disabilities, and making disability-related inquiries/medical exams pre-offer — [ADA.gov AI guidance](https://www.ada.gov/resources/ai-guidance/); [Morgan Lewis summary](https://www.morganlewis.com/pubs/2022/05/eeoc-releases-guidance-on-algorithms-ai-and-disability-discrimination-in-hiring)
- On 27 Jan 2025 the EEOC removed AI-related guidance from its website following the 23 Jan 2025 executive order; law firms note employers must still comply with the ADA, Title VII and ADEA — [K&L Gates](https://www.klgates.com/The-Changing-Landscape-of-AI-Federal-Guidance-for-Employers-Reverses-Course-with-New-Administration-1-31-2025); [Cooley](https://www.cooley.com/news/insight/2025/2025-02-21-gone-but-not-forgotten-federal-laws-still-apply-despite-guidance-disappearance-act); [National Law Review](https://natlawreview.com/article/federal-government-quietly-removed-its-ai-hiring-guidance-four-states-are-writing) (the EEOC page itself returned 403 when fetched; ADA.gov page status in 2026 not re-verified)
- Mobley v. Workday (N.D. Cal., filed Feb 2023): plaintiff (Black, over 40, with a disability) alleges race, age and disability discrimination by Workday's AI screening after 100+ rejections. On 16 May 2025 the court conditionally certified a nationwide ADEA collective; the court had earlier accepted that Workday could be liable as an employer's "agent" — [Civil Rights Litigation Clearinghouse](https://clearinghouse.net/case/44074/); [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/05/federal-court-allows-collective-action-lawsuit-over-alleged)
- EU AI Act Annex III lists AI for recruitment/selection (incl. targeted job ads, filtering applications, evaluating candidates) as high-risk — [EU AI Act Annex III](https://artificialintelligenceact.eu/annex/3/)
- Per artificialintelligenceact.eu, full high-risk obligations for Annex III employment AI become enforceable 2 Dec 2027; deployer fines up to EUR 15M or 3% of global turnover — [artificialintelligenceact.eu – staffing](https://artificialintelligenceact.eu/what-the-act-means-for-staffing-businesses/) (note: original date was Aug 2026; the Dec 2027 date reflects the later "digital omnibus" delay — verify final status)
- Vietnam: DRD and UIT (University of Information Technology, VNU-HCM) co-developed an AI job app for PWD (vieclamnkt.top) with automatic CV filtering, voice input, a career-guidance chatbot and job recommendations tailored to health conditions — [UIT news](https://www.uit.edu.vn/uit-va-drd-dong-hanh-phat-trien-ung-dung-ai-ho-tro-viec-lam-cho-nguoi-khuyet-tat) (details from search snippet; full article body could not be retrieved)

### Inferences
- LLM-based CV screening is increasingly offered by Vietnamese HR tools; the UW result implies VI candidates who mention disability-related activities (e.g. Sao Mai volunteering, disability scholarships) may be down-ranked. A hackathon tool could flag this risk to candidates and/or offer employers a bias check.
- Irony worth noting for judges: the DRD/UIT app itself uses "automatic CV filtering" — the UW research suggests such filters need bias testing.
- Inaccessible AI assessments (timed games, video interviews, CAPTCHA) are also "screening out" risks under the old EEOC framing, even with no biased model.

### Gaps
- No Vietnamese law/decree specific to AI in hiring was found; Vietnam's 2010 Law on Persons with Disabilities and Labour Code quotas not researched here.
- No study of Vietnamese-language LLM bias on disability CVs found.
- Did not verify whether the digital omnibus delay of EU AI Act dates is final law.

## Q3. What existing tools address Stage 1–2 barriers (image description/OCR, accessible CVs, disability job boards)?

### Takeaway
General AI vision apps (Be My Eyes/Be My AI, Seeing AI, Envision) can read image-based job ads but are generic, camera/phone-centric, and Vietnamese support is uncertain or unverified. Accessible CV guidance exists (APH, NTAC, universities) but mainstream template tools like Canva are explicitly discouraged. Vietnam has disability job channels (DRD, Sao Mai, CareerLink content, vieclamnguoikhuyettat.com) but these are Facebook pages or small sites, not integrated with mainstream portals.

### Cited Findings
- Be My Eyes app supports Vietnamese as an app language; Be My AI (GPT-4-based descriptions) is stated to cover 36 languages; whether Vietnamese is one was not confirmed — [Be My Eyes – Be My AI](https://www.bemyeyes.com/bme-ai/); [Be My Eyes Help Center](https://support.bemyeyes.com/hc/en-us/articles/18133134809105-Using-Be-My-AI) (help page returned 403; language claim via search summary — verify)
- Seeing AI: Wikipedia records language additions (Dutch, French, German, Japanese, Spanish in Dec 2019); no evidence found of Vietnamese support — [Wikipedia – Seeing AI](https://en.wikipedia.org/wiki/Seeing_AI)
- Accessible resume guidance: avoid complex Canva/Etsy templates (screen-reader incompatible); save as tagged PDF; use real headings, clear top-to-bottom flow, alt text; a screen-reader-accessible resume also parses better in ATS — [APH ConnectCenter](https://aphconnectcenter.org/careerconnect/job-seekers/conducting-a-successful-job-search/building-a-resume-sample-resume/); [NTAC Resume Toolkit (Mississippi State)](https://www.ntac.blind.msstate.edu/consumers/resume-toolkit); [University of St. Thomas](https://career.stthomas.edu/resources/a-guide-to-creating-an-accessible-resume/); [Georgia Tech CIDI](https://cidi.gatech.edu/feature/how-create-accessible-cv)
- PEAT TalentWorks offers employer/HR guidance on making eRecruiting tools accessible (procurement, ATS, online forms) — [PEAT TalentWorks](https://www.peatworks.org/digital-accessibility-toolkits/talentworks/make-your-erecruiting-tools-accessible/)
- Vietnam: Sao Mai Center (vocational guidance and assistive technology for the blind, HCMC) runs employment programmes including "Enhancing Capacity Through Employment for People with Visual Impairments" — [Sao Mai – Việc làm](https://saomaicenter.org/vi/employment); [Nhân Dân](https://nhandan.vn/nang-cao-nang-luc-thong-qua-tao-viec-lam-cho-nguoi-khiem-thi-post848305.html)
- DRD runs a "Việc làm người khuyết tật" Facebook page for job matching/counselling — [DRD Facebook](https://www.facebook.com/vieclamnguoikhuyetat/)
- Other Vietnamese channels: vieclamnguoikhuyettat.com, CareerLink and JobOKO articles on PWD jobs — [vieclamnguoikhuyettat.com](https://vieclamnguoikhuyettat.com/tim-viec-lam-cho-nguoi-khuyet-tat/); [CareerLink](https://www.careerlink.vn/cam-nang-viec-lam/dinh-huong-nghe-nghiep/nguoi-khuyet-tat-tim-viec-lam); [JobOKO](https://vn.joboko.com/blog/top-viec-lam-cho-nguoi-khuyet-tat-nwi1648)
- CareerLink notes PWD rarely succeed via a single channel; online forms reach more positions but personal networks help bypass initial screening — [CareerLink](https://www.careerlink.vn/cam-nang-viec-lam/dinh-huong-nghe-nghiep/nguoi-khuyet-tat-tim-viec-lam)
- Roles commonly offered to VI workers in Vietnam: call-centre/phone customer service, telesales; employers cite strong auditory perception and concentration — [Dân trí, Sept 2026](https://dantri.com.vn/lao-dong-viec-lam/hang-loat-vi-tri-viec-lam-cho-nguoi-khuyet-tat-tai-tphcm-20260919181339133.htm); [Thanh Niên](https://thanhnien.vn/tuyen-dung-va-dao-tao-nguoi-khuyet-tat-trong-doanh-nghiep-khong-kien-tri-kho-thanh-cong-185250702122932512.htm)
- VOV2 recommends VI students build IT and foreign-language skills and target translation, content creation, social media management, counselling — [VOV2](https://vov2.vov.vn/doi-song-xa-hoi/tang-co-hoi-viec-lam-cho-sinh-vien-khiem-thi-48737.vov2)

### Inferences
- Gap between general image describers and the specific task: a VI job seeker needs structured extraction (title, salary, location, requirements, deadline, how to apply) from a Vietnamese poster, not a free-form scene description. That structured, Vietnamese-first "job-ad reader" is a feasible hackathon build (OCR/vision LLM → JSON → TTS/screen-reader-friendly HTML).
- CV guidance is English/US-centric; no Vietnamese accessible CV builder was found. A screen-reader-first, form-based CV builder that outputs a tagged PDF + plain DOCX in Vietnamese/English is feasible.
- Vietnamese PWD job channels are fragmented (Facebook, small sites); an aggregator that normalises and re-publishes image ads as accessible text is plausible.

### Gaps
- International disability job boards (Inclusively, Evenbreak, Getting Hired) not researched in this pass — no verified facts collected.
- Envision/Envision Glasses and Aira Vietnamese availability: no data found.
- Browser extensions that auto-describe images (e.g. Chrome's built-in "Get image descriptions from Google", NVDA/JAWS AI add-ons): not verified in this pass.
- vieclamnkt.top current status/usage numbers unknown.

## Q4. Accessible career fair / networking practices and technology (NaviLens, beacons, virtual fair platforms)

### Takeaway
NaviLens is the most mature tech for making physical signage (booth labels, company logos, printed flyers) readable to VI people — long-range, angle-tolerant codes with a free 2-code plan. Virtual fair platforms (Handshake, vFairs) claim WCAG conformance. Vietnam runs disability-specific job fairs (e.g. HCMC, Sept 2026; Samaritan's Purse workshop for VI students, 2024) but no evidence was found of accessible-signage tech being used there.

### Cited Findings
- NaviLens: high-contrast 4-colour (cyan, magenta, yellow, black) codes detected without focusing/framing; read in ~1/30 s, at angles up to 160°, from "over 100 feet" proportional to code size; supports 42 languages with automatic translation to device language (Vietnamese not explicitly confirmed); apps free for users; organisations need a licence; free plan for up to 2 codes — [NaviLens Technology](https://www.navilens.com/en/technology)
- Other cited detection figures: "over 30 metres" / "up to 60 feet" depending on size — [RNIB](https://www.rnib.org.uk/living-with-sight-loss/assistive-aids-and-technology/navigation-and-communication/navilens/); [AFB AccessWorld](https://afb.org/aw/march2023/navilens) (sources differ; distance scales with printed size)
- NaviLens deployments: bus/train stations, airports, museums, libraries, office buildings; US DOT research report on transit wayfinding; Intercity Transit pilot — [AFB AccessWorld](https://afb.org/aw/march2023/navilens); [ROSA P (US DOT)](https://rosap.ntl.bts.gov/view/dot/88877); [Intercity Transit](https://www.intercitytransit.com/how-to-ride/navilens)
- vFairs markets WCAG 2.1 AA / ADA / AODA conformance, a VPAT, screen reader support with ARIA labels, contrast controls, video transcription — [vFairs Accessibility](https://www.vfairs.com/features/accessibility/) (vendor claim)
- Handshake states it strives to meet WCAG 2.0 A/AA for student-facing products and partnered with Level Access — [Handshake Help Center](https://support.joinhandshake.com/hc/en-us/articles/360049932314-Virtual-Accessibility-in-Handshake) (vendor claim)
- HCMC annual job fair for PWD on 23 Sept 2026 (City Employment Service Center + partners); in 2025, 28 employers offered 522 positions and nearly 500 PWD attended — [Dân trí](https://dantri.com.vn/lao-dong-viec-lam/hang-loat-vi-tri-viec-lam-cho-nguoi-khuyet-tat-tai-tphcm-20260919181339133.htm)
- 8 June 2024 Samaritan's Purse employment workshop (with Nguyễn Văn Tố Center) connected 60 VI students with 7 companies; employers cited concerns about adaptation, infrastructure (accessible pathways, braille signage) and soft skills — [VOV2](https://vov2.vov.vn/doi-song-xa-hoi/tang-co-hoi-viec-lam-cho-sinh-vien-khiem-thi-48737.vov2)

### Inferences
- At a physical fair, the VI attendee's problems are: finding booths (wayfinding), knowing which company a booth is (logo/banner), reading printed flyers, and recognising recruiters to follow up. NaviLens-style codes or a cheap alternative (standard QR/NFC at booth + phone app reading a text/audio profile in Vietnamese) address the first three; a "digital business card exchange" (QR/NFC → accessible contact card) addresses follow-up.
- Vendor WCAG claims for virtual fair platforms are self-reported; independent tests not found.
- Organisers can mandate "accessible pack" per booth: plain-text company summary, open roles, contact — cheap, policy-level fix that a hackathon app could generate automatically.

### Gaps
- Aira (remote agent service) and RightHear/BLE beacon deployments and availability in Vietnam: not researched/no data.
- Disability:IN or university accessible-event guidelines: not retrieved in this pass.
- Brazen (now part of Radancy) accessibility claims not retrieved.
- No independent evaluation of virtual career fair accessibility found.
- No evidence of NaviLens deployments in Vietnam found.

## Q5. Gaps existing tools leave (esp. Vietnamese content and local platforms) and hackathon-feasible ideas

### Takeaway
The biggest unmet need is Vietnamese-first, task-specific tooling: turning image job ads into structured accessible text, a screen-reader-first bilingual CV builder, accessible booth info at fairs, and an "accessibility checker" for employers' postings/forms. Global tools are generic, English-centric, or unverified for Vietnamese.

### Cited Findings
- Missing alt text (53.1% of pages) and unlabeled form fields (51%) remain the most common barriers — [WebAIM Million 2026](https://webaim.org/projects/million/)
- Complex design templates (Canva etc.) produce screen-reader-incompatible CVs — [APH ConnectCenter](https://aphconnectcenter.org/careerconnect/job-seekers/conducting-a-successful-job-search/building-a-resume-sample-resume/)
- LLM screening down-ranks disability-related CV content unless explicitly mitigated — [FAccT 2024](https://dl.acm.org/doi/10.1145/3630106.3658933)
- VI people in Vietnam face language and technology barriers in accessing recruitment info — [Tuổi Trẻ](https://tuoitre.vn/nguoi-khiem-thi-it-co-hoi-hoc-tap-va-tim-viec-681636.htm)

### Inferences (hackathon-feasible ideas, 24–48h scope)
1. **Job-ad reader (Stage 1/2):** share/paste an image job ad (Facebook/Zalo screenshot) → vision LLM → structured Vietnamese fields (vị trí, lương, địa điểm, yêu cầu, hạn nộp, cách ứng tuyển) → screen-reader-friendly page + TTS; flags missing info (e.g., "no accessible application method").
2. **Screen-reader-first CV builder:** voice/keyboard Q&A in Vietnamese → outputs tagged PDF + DOCX, ATS-safe single column; optional "disclosure advisor" explaining trade-offs of mentioning disability (grounded in UW findings).
3. **Accessible form assistant:** converts a PDF application form into a labeled, linear web form (or fills a PDF via voice), then exports a filled PDF.
4. **Employer-side checker:** paste a job post URL/image/form → reports alt-text, form-label, contrast, PDF-tag issues + auto-generates accessible text version; also a simple "CV screening bias test" (swap disability-related items, compare LLM scores).
5. **Career-fair booth codes:** organiser generates QR/NFC (or NaviLens, 2 free codes) per booth linking to a plain-text Vietnamese company profile, open roles and a one-tap "save recruiter contact"; attendee app reads aloud and keeps a follow-up list.

### Gaps
- No user research with Vietnamese VI job seekers was found quantifying which of these barriers is most severe; the team should validate with Sao Mai Center or DRD.
- Vietnamese OCR/vision-LLM accuracy on stylised job posters not benchmarked in any source found.
