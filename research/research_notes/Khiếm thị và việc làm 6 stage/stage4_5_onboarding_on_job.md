# Stage 4 (Onboarding) and Stage 5 (Daily Work): Barriers and Existing Solutions for Visually Impaired (VI) Employees

Research date: 2026-09-21. Every claim has a source. Items marked UNVERIFIED come only from secondary or aggregator sources and should be checked before they go in the final report.

## Q1. Screen reader data security: how do screen readers and AI describers handle data, and is employers' fear justified?

### Takeaway
Core screen readers (NVDA, and JAWS's normal speech output) process text locally. NV Access says outright that nothing NVDA reads is sent anywhere. The real, specific risks are (a) third-party NVDA add-ons, which run arbitrary code without review, and (b) optional cloud AI image describers (JAWS Picture Smart AI, Be My AI, NVDA add-ons that call GPT). These send screenshots and images to OpenAI or Anthropic. Enterprises can control both through policy. A local, on-device option is starting to appear: NVDA on-device image description (alpha), and Microsoft automatic alt text on Copilot+ PCs.

### Cited Findings
- NV Access: "No information NVDA reads is saved or sent anywhere". All processing happens locally, and NVDA is not cloud-based or server-dependent. — [NV Access Corporate & Government](https://www.nvaccess.org/corporate-government/)
- NV Access says NVDA complies with GDPR (under Article 3) and is HIPAA compliant for US health organisations. — [NV Access Corporate & Government](https://www.nvaccess.org/corporate-government/); see also [NV Access Privacy](https://www.nvaccess.org/privacy/)
- IT can block NVDA from the internet entirely. The only things lost are update checks and the add-on store. Two optional settings send minimal data (version info, usage statistics), and both can be disabled. — [NV Access Corporate & Government](https://www.nvaccess.org/corporate-government/)
- Enterprise deployment: silent install with `--install-silent` for batch rollout. Remote desktop (RDP, Citrix, VMware) is supported through an add-on. NV Access sells consulting, training and certification. — [NV Access Corporate & Government](https://www.nvaccess.org/corporate-government/)
- Main genuine risk: "Add-ons for NVDA have the capability to run any code, even with administrator privileges", and "NV Access does not review the code of these add-ons". — [NV Access Corporate & Government](https://www.nvaccess.org/corporate-government/)
- JAWS Picture Smart AI submits images to AI services (ChatGPT from OpenAI and Claude from Anthropic). During early adoption Google Gemini was tested and then replaced by Claude. — [Freedom Scientific Picture Smart AI](https://www.freedomscientific.com/training/jaws/picture-smart-ai/); [Vispero announcement](https://vispero.com/freedom-scientific-unveils-revolutionary-picturesmart-ai-for-jaws/)
- Freedom Scientific AI privacy statement:
  - Traffic uses TLS over HTTPS (port 443).
  - It uses Anthropic and OpenAI enterprise APIs, which are "designed to prevent the storage or use of customer-submitted images for model training".
  - Images are held in a temporary cache that is cleared every four hours, and no images are stored permanently.
  - Source: [Freedom Scientific AI Privacy Statement](https://www.freedomscientific.com/aiprivacystatement/)
- Community NVDA add-ons such as "AI Content Describer" send images to GPT-4-class cloud models, and some use user-supplied API keys. — [AIContentDescriber add-on](https://nvda-addons.org/addon.php?id=344); [GitHub source](https://github.com/cartertemm/AI-content-describer/blob/main/addon/globalPlugins/AIContentDescriber/description_service.py)
- NVDA on-device image description (alpha, 64-bit build):
  - It generates descriptions locally with "no information sent to the internet".
  - The model is Xenova/vit-gpt2-image-captioning, a download of about 230 MB.
  - Descriptions are currently English only.
  - Sources: [NVDA PR #18475](https://github.com/nvaccess/nvda/pull/18475); [nvda-users announcement](https://groups.google.com/a/nvaccess.org/g/nvda-users/c/Th41cGvjsPI)
- Be My AI (inside the Be My Eyes app) is built on OpenAI's GPT-4 vision model. — [Be My Eyes blog](https://www.bemyeyes.com/blog/introducing-microsofts-ai-powered-disability-answer-desk-on-be-my-eyes); [Wikipedia: Be My Eyes](https://en.wikipedia.org/wiki/Be_My_Eyes)
- Be My Eyes shares de-identified video data with Microsoft to improve AI scene description. It says it strips PII from metadata before sharing and offers an opt-out. — [Microsoft On the Issues, Oct 2024](https://blogs.microsoft.com/on-the-issues/2024/10/17/disability-data-improving-representation-to-drive-ai-innovation/)
- OpenAI says that by default it does not train on data from ChatGPT Enterprise/Business/Edu or the API. Consumer terms differ. — [OpenAI Enterprise privacy](https://openai.com/enterprise-privacy/)
- Seeing AI uses Microsoft Cognitive Services (cloud) for scene description. — [Microsoft Accessibility Blog: Seeing AI](https://blogs.microsoft.com/accessibility/seeing-ai/)
- Microsoft Word and PowerPoint on Copilot+ PCs generate alt text automatically and locally. The model runs on the device, and no data leaves it. — [Microsoft Insider blog](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/automatic-alt-text-generation-in-word-and-powerpoint-on-copilot-pcs/4479186); [Microsoft Support FAQ on AI alt text](https://support.microsoft.com/en-us/topic/frequently-asked-questions-about-ai-generated-alt-text-a667a4a6-5d18-45e6-aaf6-5370132f337a)
- Be My Eyes launched an enterprise "Be My Eyes Workplace" product with three parts: Workplace Reader, Workplace AI (for on-screen content), and Workplace Connect (human support). This shows vendors are packaging AI describers for employer-controlled use. — [Be My Eyes business blog](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)
- The AFB Workplace Technology Study reports that mandatory IT update policies break screen reader compatibility. It recommends letting assistive technology (AT) users delay upgrades. — [AFB recommendations](https://afb.org/research-and-initiatives/employment/workplace-tech-study/recommendations)

### Inferences
- The fear that "screen readers leak data" is mostly misplaced for the base screen reader. The risk is real only for cloud AI describers and unvetted add-ons. A hackathon pitch could turn this into an "AT security fact sheet / IT approval checklist" for Vietnamese employers.
- Local, on-device describers are the clean answer to the security objection. They are still immature (English only, small captioning model), which leaves a gap for Vietnamese.

### Gaps
- I found no published third-party security audit (for example SOC 2) of NVDA or JAWS themselves.
- I found no Narrator- or VoiceOver-specific enterprise data-handling statement in this pass. Both are OS-native, so they presumably fall under Microsoft's and Apple's OS privacy terms (not verified).
- I found no survey data on how often employers actually refuse AT on security grounds. The evidence is anecdotal or qualitative only.

## Q2. Built-in accessibility of Teams/PowerPoint, Slack, Google Meet/Slides; AI alt-text bots; live slide description; Be My Eyes and the Microsoft Disability Answer Desk

### Takeaway
Mainstream tools already have the pieces: PowerPoint Live in Teams, alt text fields in Slack and Google Slides, AI alt text in Microsoft 365, and live captions. What they do is let a sighted colleague add alt text or share a real file. Nothing forces them to. Screenshots, GIFs and screen-shared pixels without an accessible source remain the main gap. The fixes today are mostly "reminders", not automatic descriptions, and none are Vietnamese-first.

### Cited Findings
- PowerPoint Live in Teams: attendees can read slide content with a screen reader (tested with Narrator, JAWS and NVDA), translate slides, switch to high-contrast view, and jump to the presenter's current slide ("Live, sync to presenter"). — [Microsoft Support: screen reader in PowerPoint Live](https://support.microsoft.com/en-us/accessibility/teams/use-a-screen-reader-to-attend-a-powerpoint-live-session-in-microsoft-teams); [Present from PowerPoint Live](https://support.microsoft.com/en-us/powerpoint/present-from-powerpoint-live-in-microsoft-teams)
- This only works when the presenter uses PowerPoint Live rather than plain screen share. With a plain screen share the slides are just pixels (inferred from how the feature works).
- Teams now auto-generates AI alt text for images in chat. Users report the current client shows it as a visible grey overlay covering part of the image, which suggests the rollout is recent and still rough. — [Microsoft Q&A thread](https://learn.microsoft.com/en-us/answers/questions/5758924/why-does-teams-cover-the-bottom-half-of-images-wit) (user forum; UNVERIFIED as official behaviour)
- Slack lets the sender add alt text ("Edit file details" → Description). It has an optional "Alt text reminders" setting in Accessibility preferences, and screen readers read the alt text aloud. — [Slack Help: Add alt text](https://slack.com/help/articles/4403914924435-Add-alt-text-to-images); [Accessibility in Slack](https://slack.com/help/articles/4455747966739-Accessibility-in-Slack)
- There is an open-source Slack bot that nudges people who post images without alt text. It encourages the sender and does not generate descriptions. — [khiga8/alt-text-slack-bot](https://github.com/khiga8/alt-text-slack-bot)
- Google Slides supports alt text (Ctrl+Alt+Y) and screen reader use. Meet and Slides support live captions. Gemini in Meet offers translated captions in 70+ languages with a paid add-on. — [Google: Slides with screen reader](https://support.google.com/accessibility/answer/1634140?hl=en); [Google: make content accessible](https://support.google.com/docs/answer/6199477?hl=en); [Google for Education accessibility](https://edu.google.com/our-values/accessibility/)
- Microsoft Disability Answer Desk runs on Be My Eyes. Be My AI (GPT-4 vision) handles visual customer-service calls, and Be My Eyes reports "90%+ successful call resolution". Microsoft expanded the support to 24/7 for Be My Eyes users. — [Be My Eyes blog](https://www.bemyeyes.com/blog/introducing-microsofts-ai-powered-disability-answer-desk-on-be-my-eyes) (vendor-reported figure); [Microsoft Accessibility Blog](https://blogs.microsoft.com/accessibility/microsoft-expands-disability-answer-desk-support-to-24-7-for-be-my-eyes-customers/)
- Be My Eyes lists the meeting barriers blind staff face: a screen shared without the file, someone pointing at "this line", and discussion moving into chat while someone else is speaking. — [Be My Eyes: common workplace barriers](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)

### Inferences
- A hackathon-feasible gap is a Teams/Slack bot that auto-describes images, screenshots and GIFs in Vietnamese. It could use a local or enterprise-API model and post the description as a threaded reply, avoiding Teams' overlay issue.
- A second gap is a "slide companion": when a presenter screen-shares instead of using PowerPoint Live, the tool captures frames and produces a text/OCR stream the screen reader can follow. JAWS Picture Smart and Be My AI already do single-shot versions of this.

### Gaps
- I found no published product that continuously describes live screen-shared slides for screen reader users. Absence not fully verified.
- I did not verify the current status or accuracy of Microsoft PowerPoint's Accessibility Checker or automatic alt text for Vietnamese.
- Slack has no native AI auto-alt-text that I could confirm as of 2026.

## Q3. SAP and enterprise software accessibility; procurement standards (EN 301 549 / Section 508) as a lever

### Takeaway
SAP publishes accessibility conformance reports (VPATs) and targets WCAG 2.1 AA / EN 301 549. Its support depends on the specific product and configuration: SAP GUI for Windows scripting is offered only for JAWS, and customer customisation can break accessibility. Procurement rules are the proven lever in the EU and US. The European Accessibility Act has applied since 28 June 2025. Vietnam has no equivalent procurement mandate for private enterprise software.

### Cited Findings
- SAP targets WCAG 2.1 AA / EN 301 549 and documents support levels in its VPATs. SAP GUI for Windows offers screen reader scripting only for JAWS. — [SAP Community: Beginner's guide to accessibility in Fiori/UI5](https://community.sap.com/t5/technology-blog-posts-by-sap/a-beginner-s-guide-to-accessibility-in-sap-fiori-ui5/ba-p/14278603); [SAP Help: Accessibility for SAP GUI for Windows](https://help.sap.com/doc/saphelp_nw74/7.4.16/en-us/bd/22bc9539704ccf880d6423c7c9ff83/content.htm?no_cache=true); [Accessibility in SAP Fiori](https://www.sap.com/design-system/fiori-design-web/v1-96/discover/sap-design-system/product-standards/accessibility-in-sap-fiori)
- SAP KB note on Fiori Launchpad screen reader support. — [SAP KBA 2301146](https://userapps.support.sap.com/sap/support/knowledge/en/2301146)
- EN 301 549 is the EU harmonised ICT accessibility standard. It is the technical specification for public ICT procurement and the main reference for complying with the EAA. EAA obligations have applied since 28 June 2025. — [Wikipedia: EN 301 549](https://en.wikipedia.org/wiki/EN_301_549); [ETSI EN 301 549 v3.2.1 PDF](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf); [Deque overview](https://www.deque.com/en-301-549-compliance/)
- UNVERIFIED: an aggregator claims that EN 301 549 v4.1.1 was published by ETSI on 2 September 2026 and references WCAG 2.2 AA. — search snippet only; confirm on [etsi.org](https://www.etsi.org/)
- Be My Eyes notes that "a new software rollout can remove access to part of someone's job overnight" when procurement ignores accessibility. — [Be My Eyes business blog](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)
- AFB recommends accessible procurement policies with vendor accountability, and hiring VI people as product testers. — [AFB Workplace Tech Study recommendations](https://afb.org/research-and-initiatives/employment/workplace-tech-study/recommendations)
- Research on design tools: the CHI 2021 paper "Understanding Blind Screen-Reader Users' Experiences of Digital Artboards" documents the barriers in artboard-style design tools. — [ACM DL](https://dl.acm.org/doi/10.1145/3411764.3445242); [PDF](https://faculty.washington.edu/wobbrock/pubs/chi-21.03.pdf)
- The Vietnamese Ministry of Information and Communications' Circular 32/2017/TT-BTTTT covers accessibility of state agency websites and portals only. It does not cover private enterprise software. — [Disability:IN Vietnam](https://disabilityin.org/country/vietnam/) (secondary)

### Inferences
- For Vietnamese SMEs, a "VPAT-lite" checklist or a Vietnamese-language accessibility procurement checklist for buying HR, ERP and LMS tools is feasible and cheap. SMEs rarely use SAP but do use local HR/accounting SaaS (for example MISA). Their accessibility status is unknown.

### Gaps
- I did not retrieve the text of an actual SAP ACR/VPAT for S/4HANA. I found no data on the accessibility of Vietnamese enterprise software (MISA, Base.vn, etc.).
- I found no evidence on coding-tool accessibility (VS Code, GitHub) in this pass.

## Q4. Screen reader usage data (WebAIM Screen Reader User Survey #10)

### Takeaway
Survey #10 (Dec 2023–Jan 2024, 1,539 respondents) found JAWS (40.5%) and NVDA (37.7%) nearly tied as the primary desktop screen reader. Most users (71.6%) use more than one screen reader. The survey page I fetched contained no AI-tool usage figure.

### Cited Findings
All figures below are from [WebAIM Screen Reader Survey #10](https://webaim.org/projects/screenreadersurvey10/). The survey ran December 2023 to January 2024 and had 1,539 valid responses.

- Primary desktop screen reader: JAWS 40.5%, NVDA 37.7%, VoiceOver 9.7%, Narrator 0.7%.
- Screen readers commonly used: NVDA 65.6%, JAWS 60.5%, VoiceOver 43.9%, Narrator 37.3%.
- 71.6% use more than one desktop screen reader, and 43% use three or more.
- 18.6% use a different screen reader at work or school than at home.
- Mobile: Apple 70.6%, Android 27.6%.

### Inferences
- A tool built for Vietnam should target NVDA first. NVDA is free, localised into Vietnamese by Sao Mai (see Q6), and the most commonly used screen reader. It should also be tested with JAWS, the corporate standard in Western firms.

### Gaps
- The brief asked for "% using AI tools". The WebAIM #10 page I fetched had no such figure, so do not cite one. I found no Vietnam-specific screen reader usage survey.

## Q5. Onboarding best practices: HR processes, orientation and mobility, colleague etiquette, buddy systems

### Takeaway
The guidance is consistent across organisations:
- Have AT and accessible documents ready before day one.
- Make offer letters, HR paperwork and training accessible.
- Provide an orientation and mobility (O&M) instructor to learn the office layout.
- Train colleagues in etiquette.
- Ask the employee rather than assume.

Qualitative research shows that even at tech firms these practices break down in practice (the "accessibility paradox").

### Cited Findings
- AFB HR toolkit: have accessibility tools ready so onboarding is not delayed, and treat the first experience as the thing that sets the tone for inclusion. — [AFB: Onboarding and completing paperwork](https://www.afb.org/research-and-initiatives/research/toolkits/steps-success-hr-manager-inclusion/onboarding)
- Physical navigation: an O&M instructor teaches the workspace, restrooms, kitchen, meeting rooms, elevators and emergency exits. — [APH ConnectCenter employer guide](https://aphconnectcenter.org/careerconnect/employers/employers-guide-to-accommodations-for-blind-and-low-vision-employees/); [Perkins allyship toolkit](https://www.perkins.org/resource/employer-toolkit-allyship-in-the-workplace/)
- Etiquette:
  - Identify yourself verbally, and announce when you enter or leave.
  - Offer your arm rather than grabbing theirs.
  - Describe steps, slopes and doors as you walk.
  - Ask rather than assume.
  - Sources: [JAN Disability Etiquette](https://askjan.org/topics/disetiq.cfm); [Perkins toolkit](https://www.perkins.org/resource/employer-toolkit-allyship-in-the-workplace/)
- Accessible onboarding checklist (US federally funded). — [AskEARN: Accessible Onboarding](https://askearn.org/page/accessible-onboarding)
- Onboarding materials and portals that don't work with screen readers can screen out VI candidates. Some participants reported being unable to read or sign their own offer letters. — [HumanWare blog](https://www.humanware.com/news/blogs/workplace-accessibility-for-blind-and-low-vision-employees/); [Training Industry](https://trainingindustry.com/articles/onboarding/creating-accessible-onboarding-for-the-visually-impaired-tips-for-training-professionals/) (secondary; the offer-letter point likely comes from the CSCW study below)
- "The Accessibility Paradox" (Marathe & Piper, CSCW 2025) interviewed 20 blind and low vision (BLV) tech workers. It found persistent misalignment between company accessibility efforts and reality across digital infrastructure, accommodation processes, colleagues' ability-based assumptions, and competing priorities. — [arXiv 2508.18492](https://arxiv.org/abs/2508.18492)
- The AFB Workplace Technology Study recommends:
  - a centralised accommodations budget
  - AT training for employees
  - accessible procurement
  - update flexibility (letting AT users delay upgrades)
  - Source: [AFB recommendations](https://afb.org/research-and-initiatives/employment/workplace-tech-study/recommendations)
- Be My Eyes notes that visually structured Word documents (bold text instead of real headings, merged cells, screenshots in slides) give screen readers "almost no structure". — [Be My Eyes business blog](https://www.bemyeyes.com/business/blog/most-common-workplace-barriers-for-blind-employees/)

### Inferences
- A hackathon idea: a Vietnamese onboarding kit that generates (1) an accessible first-week checklist for HR, (2) a 10-minute colleague etiquette micro-course, and (3) a buddy-system template. This is low-tech, high-impact, and fits SMEs with no accessibility staff.
- Indoor navigation for a new office could use a text or audio "office map" written by the buddy. Beacon or indoor-positioning solutions are costly for SMEs.

### Gaps
- I did not retrieve RNIB, Vision Australia or Microsoft inclusive hiring guidance directly in this pass.
- I found no quantitative evaluation of buddy systems specifically for VI employees.
- I found no data on onboarding duration or retention for VI hires.

## Q6. Accessible document conversion (image PDFs, slides): tools, cost, limits

### Takeaway
Automated tagging and OCR (Adobe Auto-Tag, NVDA's built-in OCR, AI remediation vendors) make image PDFs readable but do not guarantee standards compliance. Human review is still required. Cost figures come mostly from vendors.

### Cited Findings
- Adobe PDF Accessibility Auto-Tag API: the output is a tagged PDF but "not guaranteed to comply with accessibility standards such as WCAG and PDF/UA", and further remediation may be needed. — [Adobe Developer: PDF Accessibility Auto-Tag](https://developer.adobe.com/document-services/apis/pdf-accessibility-auto-tag/)
- Auto-tagging cannot interpret styling variations and may tag different structures identically. Manual fixes are required. — [Equidox: truth about auto-tagging](https://equidox.co/blog/the-truth-about-auto-tagging-pdfs/); [Grackle](https://www.grackledocs.com/en/understanding-auto-tagging-of-pdf-documents/) (both are remediation vendors, so they have an interest)
- Vendor claims (UNVERIFIED and self-interested):
  - Manual remediation costs about $3–4 per page, and AI can cut this to "a fraction of a penny".
  - Continual Engine claims about 90% auto-tagging at 95% accuracy.
  - PDFix claims 70–98% automation.
  - Sources: [accessibilityondemand.ai](https://accessibilityondemand.ai/post/best-pdf-accessibility-remediation-software); [PDFix](https://pdfix.net/can-ai-automatically-fix-pdf-accessibility-issues/)
- NVDA includes OCR for reading image-based content. — [NVDA User Guide](https://download.nvaccess.org/documentation/userGuide.html)

### Inferences
- For a VI employee, "OCR on the fly" (NVDA OCR, Seeing AI) is a workaround, not a fix. It loses headings, tables and reading order. For SMEs the lever is authoring accessibly at source, for example running Microsoft's Accessibility Checker before sharing. A Vietnamese "pre-share accessibility lint" could be a hackathon tool.

### Gaps
- I found no benchmark of Vietnamese-language OCR or auto-tag accuracy (diacritics are a known risk, but I found no source).
- There are no independent (non-vendor) cost figures.

## Q7. Gaps specific to Vietnamese-language content and Vietnamese SMEs

### Takeaway
Vietnam has a free, localised screen reader stack (NVDA + Sao Mai) and new Vietnamese text-to-speech (TTS), including UNICEF's "vi vu" southern-dialect voice. Employment of blind people is very low: one source says about 94% face unemployment. Legal duties on private employers focus on physical adaptation, not digital or IT accessibility. Sources conflict on whether a hiring quota exists.

### Cited Findings
- Sao Mai Center for the Blind (founded 2001) worked with NV Access to localise NVDA and its training materials into Vietnamese. Blind translators were paid through a Nippon Foundation grant. More than 400 people used the materials, and 32 people were placed in jobs over two years. The article says about 94% of blind people in Vietnam face unemployment. — [NV Access: Closing the gap in Vietnam](https://www.nvaccess.org/post/closing_the_gap_in_vietnam/) (the 94% figure is reported by NV Access; its primary source is not given)
- The same source says Vietnam's average wage is under US$1,800/year, and some commercial screen readers cost about that much. — [NV Access: Closing the gap in Vietnam](https://www.nvaccess.org/post/closing_the_gap_in_vietnam/)
- Sao Mai also develops Vietnamese assistive software. — [Sao Mai software](https://saomaicenter.org/en/smsoft)
- UNICEF Viet Nam launched "vi vu", a Vietnamese TTS voice in southern dialect for screen readers and readers (2024). — [ATscale news](https://atscalepartnership.org/news/2024/8/8/unicef-viet-nam-introduces-vi-vu-a-vietnamese-text-to-speech-software-in-southern-dialect-to-enhance-digital-accessibility)
- The Law on Persons with Disabilities No. 51/2010/QH12 is the core law. It includes state incentives (tax, credit) for producing assistive IT and for Braille materials. — [UN copy of Law 51/2010/QH12](https://www.un.org/development/desa/disabilities/wp-content/uploads/sites/15/2019/11/Viet-Nam_Law-on-Persons-with-Disabilities.pdf); [DREDF summary](https://dredf.org/wp-content/uploads/2012/08/Vietnam-the-law-on-persons-with-disabilities.pdf)
- Conflict on the hiring quota: Disability:IN says all businesses must hire 3% disabled workers (2% in heavy industries), with fines paid into a fund. — [Disability:IN Vietnam](https://disabilityin.org/country/vietnam/). However, the 2010 Law and employer-law summaries describe incentives for firms employing 30%+ disabled workers rather than a general quota. — [ASL Law](https://aslgate.com/regulations-on-the-employment-of-employees-with-disabilities-in-vietnam/); [ResearchGate legal review](https://www.researchgate.net/publication/386554167_Current_Legal_Framework_on_the_Protection_of_the_Rights_of_Employees_with_Disabilities_in_Vietnam_-_Recommendations_and_Improvements). **Verify before citing. The 3% quota likely reflects the older, pre-2010 regime.**
- Employer workplace-modification duties cited in summaries are physical (ramps, restrooms, workstation height). — [Disability:IN Vietnam](https://disabilityin.org/country/vietnam/)
- NVDA's on-device AI image description is English only at present. — [nvda-users announcement](https://groups.google.com/a/nvaccess.org/g/nvda-users/c/Th41cGvjsPI)

### Inferences
Hackathon-feasible Vietnamese gaps, ranked by feasibility:
1. A Teams/Zalo/Slack bot that describes images and screenshots in Vietnamese. Vietnamese SMEs heavily use Zalo; I have no source confirming Zalo's alt-text support.
2. A Vietnamese accessible-document linter, or a converter from image PDF to structured Word.
3. A Vietnamese colleague etiquette micro-course plus an HR onboarding checklist.
4. A one-page Vietnamese "AT security explainer" for IT managers, based on the NV Access statements.

A local or on-device model addresses the security objection from Q1.

### Gaps
- I found no current (2024–2026) national statistic on VI employment in Vietnam from a primary government source (for example GSO or MOLISA).
- I found no data on Zalo, MISA or other local platforms' screen reader compatibility.
- I found no Vietnamese-language evaluation of AI image describers.
- I found no Vietnamese HCI/ASSETS studies of VI workers in this pass.
