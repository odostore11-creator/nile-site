// Content added in the 2026-11-23 redesign: founders, FAQ, one page per specialty, new articles.
// Medical text is general, conservative physiotherapy guidance; have a founder review any change.

// The three founders (no phone numbers on the public site, by decision).
export const FOUNDERS = [
  { initial: 'م', initialEn: 'M', ar: { name: 'د. مصطفى إسماعيل', role: 'مؤسس شريك والمدير التنفيذي (CEO)', spec: 'العلاج الطبيعي العصبي العضلي' },
    en: { name: 'Dr. Mostafa Ismail', role: 'Co-founder & CEO', spec: 'Neuromuscular Physiotherapy' } },
  { initial: 'ع', initialEn: 'A', ar: { name: 'د. عبدالرحمن سامح', role: 'مؤسس شريك والمدير التقني (CTO)', spec: 'العلاج الطبيعي للقلب والصدر، الرعاية المركزة، وما قبل وبعد العمليات' },
    en: { name: 'Dr. Abdelrahman Sameh', role: 'Co-founder & CTO', spec: 'Cardiopulmonary, Critical Care & Perioperative Physiotherapy' } },
  { initial: 'أ', initialEn: 'A', ar: { name: 'د. أحمد نادر', role: 'مؤسس شريك', spec: 'العلاج الطبيعي العصبي العضلي' },
    en: { name: 'Dr. Ahmed Nader', role: 'Co-founder', spec: 'Neuromuscular Physiotherapy' } },
];

export const FAQ = {
  ar: [
    ['بكم جلسة العلاج الطبيعي في المنزل؟', 'الكشف المنزلي مع الجلسة الأولى 800 جنيه (حوالي 120 دقيقة)، وجلسات العظام أو المخ والأعصاب 500 جنيه للجلسة. نوضح لك عدد الجلسات المقترح بعد التقييم.'],
    ['متى وكيف أدفع؟', 'الدفع نقداً بعد الجلسة، ولا يوجد أي دفع أونلاين.'],
    ['هل تغطون منطقتي؟', 'نعمل من خلال شبكة من الأخصائيين في مدن كثيرة في مصر. اختر محافظتك في نموذج الحجز وسنؤكد لك أقرب أخصائي متاح.'],
    ['من الذي سيزورني؟', 'أخصائي علاج طبيعي مرخّص من فريق Nile Therapy، مع إشراف طبي ومتابعة مستمرة لخطة العلاج.'],
    ['ماذا أجهّز قبل الزيارة الأولى؟', 'التقارير والأشعة وقائمة الأدوية إن وجدت، وملابس مريحة تسمح بالحركة، ومساحة صغيرة في المنزل للتمارين.'],
    ['هل يمكن الحجز عبر واتساب؟', 'نعم، يمكنك مراسلتنا على واتساب في أي وقت، أو ملء نموذج الحجز وسنتصل بك لتأكيد الموعد.'],
  ],
  en: [
    ['How much is a home physiotherapy session?', 'The home assessment with the first session is EGP 800 (about 120 minutes). Orthopedic or neurological sessions are EGP 500 each. After the assessment we tell you how many sessions we suggest.'],
    ['When and how do I pay?', 'You pay cash after the session. There is nothing to pay online.'],
    ['Do you cover my area?', 'We work through a network of physiotherapists in many cities across Egypt. Choose your governorate in the booking form and we will confirm the nearest available physiotherapist.'],
    ['Who will visit me?', 'A licensed physiotherapist from the Nile Therapy team, with medical supervision and ongoing follow-up of your plan.'],
    ['What should I prepare for the first visit?', 'Any reports, scans and your medication list, comfortable clothes, and a little space at home for exercises.'],
    ['Can I book on WhatsApp?', 'Yes. Message us on WhatsApp any time, or fill in the booking form and we will call you to confirm.'],
  ],
};

// One page per specialty (new URLs; the old URLs are untouched).
export const SPEC_PAGES = [
  { key: 'neuro', icon: 'brain', img: 'neuro', ar: '/alaj-tabiei-almukh-walaasab', en: '/en/services/neurological-rehabilitation', book: 'neuro',
    t: { ar: 'العلاج الطبيعي لأمراض المخ والأعصاب وإصابات الحبل الشوكي', en: 'Neurological & Spinal Cord Rehabilitation at Home' },
    lead: { ar: 'تأهيل عصبي في منزلك لتحسين الحركة والتوازن والاستقلالية بعد الجلطات والإصابات والأمراض العصبية.', en: 'Neuro rehabilitation at home to improve movement, balance and independence after stroke, injury or neurological illness.' },
    who: { ar: ['الجلطات الدماغية (السكتة الدماغية)', 'إصابات الحبل الشوكي', 'الشلل الرعاش (باركنسون)', 'التصلب المتعدد', 'إصابات الأعصاب الطرفية', 'ما بعد جراحات المخ والعمود الفقري'],
      en: ['Stroke', 'Spinal cord injury', "Parkinson's disease", 'Multiple sclerosis', 'Peripheral nerve injuries', 'Recovery after brain or spine surgery'] },
    how: { ar: ['تقييم الحركة والتوازن والإحساس ومستوى الاستقلال', 'تمارين عصبية موجّهة لاستعادة التحكم الحركي', 'تدريب على المشي والتوازن وتقليل خطر السقوط', 'تمارين منزلية وإرشادات للأسرة'],
      en: ['Assessment of movement, balance, sensation and independence', 'Guided neuro exercises to rebuild motor control', 'Walking and balance training to reduce fall risk', 'A home program and guidance for the family'] } },
  { key: 'ortho', icon: 'bone', img: 'ortho', ar: '/alaj-tabiei-alizam', en: '/en/services/orthopedic-physiotherapy', book: 'orthopedic',
    t: { ar: 'العلاج الطبيعي لأمراض العظام والمفاصل', en: 'Orthopedic Physiotherapy at Home' },
    lead: { ar: 'تقليل الألم واستعادة الحركة بعد الإصابات والكسور ومشاكل المفاصل والعمود الفقري، في منزلك.', en: 'Less pain and better movement after injuries, fractures, and joint or spine problems, at home.' },
    who: { ar: ['آلام الرقبة وأسفل الظهر', 'الانزلاق الغضروفي', 'خشونة الركبة والمفاصل', 'الكسور بعد فك الجبس', 'التواء الأربطة وإصابات العضلات', 'تيبّس الكتف (الكتف المتجمد)'],
      en: ['Neck and lower back pain', 'Disc herniation', 'Knee and joint osteoarthritis', 'Fractures after the cast comes off', 'Sprains and muscle injuries', 'Frozen shoulder'] },
    how: { ar: ['تقييم مدى الحركة والقوة ومصدر الألم', 'تقنيات علاج يدوي وتمارين علاجية', 'برنامج تقوية تدريجي ومنع تكرار الإصابة', 'نصائح للوضعيات الصحيحة في العمل والبيت'],
      en: ['Assessment of range of motion, strength and the source of pain', 'Manual therapy and therapeutic exercise', 'A progressive strengthening plan to prevent recurrence', 'Posture advice for work and home'] } },
  { key: 'surgery', icon: 'scalpel', img: 'surgery', ar: '/alaj-tabiei-qabl-wabad-aljirahat', en: '/en/services/before-and-after-surgery', book: 'orthopedic',
    t: { ar: 'العلاج الطبيعي قبل وبعد العمليات الجراحية', en: 'Physiotherapy Before and After Surgery' },
    lead: { ar: 'تجهيز الجسم قبل العملية وتسريع التعافي بعدها وتقليل المضاعفات، مع خطة متابعة في المنزل.', en: 'Prepare the body before surgery, recover faster afterwards and reduce complications, with a follow-up plan at home.' },
    who: { ar: ['تغيير مفصل الركبة أو الفخذ', 'إصلاح الأربطة (مثل الرباط الصليبي)', 'جراحات العمود الفقري', 'تثبيت الكسور', 'جراحات القلب والصدر', 'ما بعد العمليات الكبرى وفترات الرقود'],
      en: ['Knee or hip replacement', 'Ligament repair (such as ACL)', 'Spine surgery', 'Fracture fixation', 'Heart and chest surgery', 'Recovery after major surgery and bed rest'] },
    how: { ar: ['تمارين تجهيزية قبل العملية عند الإمكان', 'استعادة الحركة والمشي بأمان بعد العملية', 'تمارين التنفس والدورة الدموية', 'تدرّج مدروس للعودة للحياة اليومية'],
      en: ['Pre-surgery conditioning where possible', 'Safely restoring movement and walking after surgery', 'Breathing and circulation exercises', 'A planned, gradual return to daily life'] } },
  { key: 'homecare', icon: 'home', img: 'icu', ar: '/alriaya-almanzilia', en: '/en/services/advanced-home-care', book: 'home-assessment',
    t: { ar: 'الرعاية المنزلية الفائقة', en: 'Advanced Home Care' },
    lead: { ar: 'رعاية طبية وتمريضية متكاملة في المنزل بعد الخروج من المستشفى ولكبار السن، مع متابعة دقيقة.', en: 'Complete medical and nursing care at home after hospital discharge and for older adults, with close follow-up.' },
    who: { ar: ['المرضى بعد الخروج من المستشفى', 'كبار السن', 'المرضى طريحو الفراش', 'من يحتاج متابعة مستمرة بعد العمليات'],
      en: ['Patients after hospital discharge', 'Older adults', 'Bed-bound patients', 'Anyone needing ongoing follow-up after surgery'] },
    how: { ar: ['تقييم شامل للحالة واحتياجات المنزل', 'علاج طبيعي ورعاية تمريضية حسب الحاجة', 'الوقاية من قرح الفراش ومضاعفات الرقود', 'تدريب الأسرة على الرعاية اليومية الآمنة'],
      en: ['A full assessment of the patient and the home', 'Physiotherapy and nursing care as needed', 'Preventing pressure sores and bed-rest complications', 'Training the family in safe daily care'] } },
  { key: 'sports', icon: 'run', img: 'ortho', ar: '/alaj-tabiei-lilriyadiyin', en: '/en/services/sports-injuries', book: 'orthopedic',
    t: { ar: 'العلاج الطبيعي للرياضيين والإصابات الرياضية', en: 'Sports Injury Physiotherapy' },
    lead: { ar: 'تأهيل إصابات الملاعب والعودة الآمنة للتدريب والمنافسات وفق بروتوكولات رياضية معتمدة.', en: 'Rehabilitation for sports injuries and a safe return to training and competition, following accredited sports protocols.' },
    who: { ar: ['إصابات الرباط الصليبي والغضاريف', 'التواء الكاحل', 'شد العضلات الخلفية', 'آلام الكتف عند الرياضيين', 'التهاب الأوتار'],
      en: ['ACL and meniscus injuries', 'Ankle sprains', 'Hamstring strains', "Shoulder pain in athletes", 'Tendinopathy'] },
    how: { ar: ['تقييم الإصابة ومتطلبات رياضتك', 'تأهيل متدرّج للقوة والمرونة والتوازن', 'اختبارات جاهزية قبل العودة', 'برنامج وقاية لتقليل تكرار الإصابة'],
      en: ['Assessment of the injury and your sport', 'Progressive strength, mobility and balance work', 'Readiness tests before you return', 'A prevention program to reduce re-injury'] } },
  { key: 'icu', icon: 'heart', img: 'icu', ar: '/alaj-tabiei-lilrayaa-almurakaza', en: '/en/services/critical-care-physiotherapy', book: 'home-assessment',
    t: { ar: 'العلاج الطبيعي للحالات الحرجة والرعاية المركزة', en: 'Critical Care & Cardiopulmonary Physiotherapy' },
    lead: { ar: 'دعم آمن للتنفس والحركة ومنع مضاعفات الرقود الطويل، أثناء أو بعد الرعاية المركزة.', en: 'Safe support for breathing and movement, and prevention of long bed-rest complications, during or after intensive care.' },
    who: { ar: ['المرضى بعد الرعاية المركزة', 'مرضى الصدر والجهاز التنفسي', 'ما بعد جراحات القلب والصدر', 'ضعف العضلات بعد الرقود الطويل'],
      en: ['Patients after intensive care', 'Chest and respiratory conditions', 'Recovery after heart and chest surgery', 'Muscle weakness after long bed rest'] },
    how: { ar: ['تمارين التنفس وتنظيف الصدر', 'تحريك تدريجي آمن من السرير للوقوف والمشي', 'تحسين القدرة على التحمل', 'متابعة العلامات الحيوية أثناء الجلسة'],
      en: ['Breathing exercises and chest clearance', 'Safe, gradual mobilisation from bed to standing and walking', 'Building endurance', 'Monitoring vital signs during the session'] } },
];

// New articles (each with an Arabic and an English version).
export const ARTICLES = [
  { key: 'back', img: 'neck-exam', date: '2026-11-23', ar: '/alam-asfal-aldhahr', en: '/en/lower-back-pain',
    ar_t: 'آلام أسفل الظهر: الأسباب ومتى تحتاج للعلاج الطبيعي', en_t: 'Lower Back Pain: Causes and When to Get Help',
    ar_lead: 'ألم أسفل الظهر من أكثر أسباب الغياب عن العمل. تعرّف على أسبابه الشائعة، وعلامات الخطر، وكيف يساعد العلاج الطبيعي.',
    en_lead: 'Lower back pain is one of the most common reasons people miss work. Learn the usual causes, the warning signs, and how physiotherapy helps.',
    ar_html: `<h2>لماذا يحدث ألم أسفل الظهر؟</h2><p>في أغلب الحالات يكون الألم ناتجاً عن إجهاد العضلات والأربطة، أو الجلوس الطويل، أو رفع الأشياء بطريقة خاطئة، أو ضعف عضلات الجذع. وقد يرتبط أحياناً بالانزلاق الغضروفي أو خشونة الفقرات.</p>
<h2>علامات تستدعي مراجعة الطبيب فوراً</h2><ul><li>ضعف أو تنميل متزايد في الساقين.</li><li>صعوبة في التحكم في البول أو البراز.</li><li>ألم بعد سقوط أو حادث قوي.</li><li>ألم مع حرارة أو فقدان وزن غير مبرر.</li></ul>
<h2>كيف يساعد العلاج الطبيعي؟</h2><p>يبدأ الأخصائي بتقييم الحركة ومصدر الألم، ثم يضع خطة تشمل العلاج اليدوي وتمارين التقوية والمرونة وتعليم الوضعيات الصحيحة. الهدف هو تقليل الألم والعودة للنشاط ومنع تكرار المشكلة.</p>
<h2>نصائح يومية</h2><ul><li>ابقَ متحركاً قدر الاستطاعة؛ الراحة الطويلة في السرير غالباً تؤخر التعافي.</li><li>غيّر وضعك كل 30–45 دقيقة أثناء الجلوس.</li><li>عند رفع شيء، اثنِ الركبتين وأبقِ الحمل قريباً من جسمك.</li><li>مارس المشي بانتظام.</li></ul>
<p class="tip">📌 هذه معلومات عامة ولا تغني عن التقييم. إذا استمر الألم أكثر من أسبوعين، احجز تقييماً مع أخصائي.</p>`,
    en_html: `<h2>Why does lower back pain happen?</h2><p>Most often it comes from strained muscles and ligaments, long sitting, lifting the wrong way or weak trunk muscles. Sometimes it is linked to a disc herniation or wear of the spine.</p>
<h2>See a doctor urgently if you have</h2><ul><li>Increasing weakness or numbness in the legs.</li><li>Trouble controlling your bladder or bowels.</li><li>Pain after a fall or a hard impact.</li><li>Pain with fever or unexplained weight loss.</li></ul>
<h2>How physiotherapy helps</h2><p>Your physiotherapist assesses movement and the source of pain, then builds a plan with manual therapy, strengthening and flexibility exercises, and posture education. The aim is less pain, a return to activity and preventing it coming back.</p>
<h2>Everyday tips</h2><ul><li>Keep moving as much as you can; long bed rest usually slows recovery.</li><li>Change position every 30–45 minutes when sitting.</li><li>Bend your knees and keep loads close when lifting.</li><li>Walk regularly.</li></ul>
<p class="tip">📌 This is general information and doesn't replace an assessment. If pain lasts more than two weeks, book an assessment.</p>` },
  { key: 'knee', img: 'ortho', date: '2026-11-23', ar: '/taahil-baad-taghyir-alrukba', en: '/en/knee-replacement-rehabilitation',
    ar_t: 'التأهيل بعد عملية تغيير مفصل الركبة', en_t: 'Rehabilitation After Knee Replacement Surgery',
    ar_lead: 'العلاج الطبيعي جزء أساسي من نجاح عملية تغيير الركبة. ماذا تتوقع في الأسابيع الأولى، وكيف تتعافى بأمان في منزلك.',
    en_lead: 'Physiotherapy is a key part of a successful knee replacement. What to expect in the first weeks, and how to recover safely at home.',
    ar_html: `<h2>لماذا التأهيل مهم؟</h2><p>بعد تغيير المفصل يحتاج الجسم لاستعادة مدى حركة الركبة وقوة العضلات والقدرة على المشي. التأهيل المنتظم يقلل التيبّس ويسرّع العودة للحياة اليومية.</p>
<h2>الأسابيع الأولى</h2><ul><li>تمارين لثني وفرد الركبة تدريجياً حسب تعليمات الجرّاح.</li><li>تقوية عضلات الفخذ.</li><li>التدرّب على المشي بالمشاية أو العكاز ثم الاستغناء عنه تدريجياً.</li><li>التحكم في التورم بالثلج والرفع حسب التعليمات.</li></ul>
<h2>في المنزل</h2><p>جلسات العلاج الطبيعي في المنزل مناسبة جداً بعد العملية، لأنها توفّر عناء التنقّل وتسمح بالتدرّب على الأنشطة الحقيقية: القيام من الكرسي، صعود السلم، ودخول الحمّام بأمان.</p>
<p class="tip">📌 التزم دائماً بتعليمات الجرّاح، وأبلغ الطبيب فوراً عند وجود احمرار أو سخونة أو ألم شديد في الساق.</p>`,
    en_html: `<h2>Why rehabilitation matters</h2><p>After a joint replacement the body needs to regain knee range of motion, muscle strength and walking. Regular rehab reduces stiffness and speeds up the return to daily life.</p>
<h2>The first weeks</h2><ul><li>Gradual bending and straightening exercises, following your surgeon's instructions.</li><li>Thigh strengthening.</li><li>Walking practice with a walker or crutch, weaning off gradually.</li><li>Managing swelling with ice and elevation as advised.</li></ul>
<h2>At home</h2><p>Home physiotherapy works especially well after surgery: no travelling, and you practise the real tasks, like getting up from a chair, climbing stairs and using the bathroom safely.</p>
<p class="tip">📌 Always follow your surgeon's instructions, and contact your doctor right away if the leg becomes red, hot or very painful.</p>` },
  { key: 'stroke', img: 'neuro', date: '2026-11-23', ar: '/taahil-aljalta-fi-almanzil', en: '/en/stroke-rehabilitation-at-home',
    ar_t: 'تأهيل مرضى الجلطة الدماغية في المنزل', en_t: 'Stroke Rehabilitation at Home',
    ar_lead: 'التأهيل المبكر والمنتظم بعد الجلطة الدماغية يساعد على استعادة الحركة والاستقلالية. دليل مبسّط للمريض والأسرة.',
    en_lead: 'Early, regular rehabilitation after a stroke helps people regain movement and independence. A simple guide for patients and families.',
    ar_html: `<h2>متى يبدأ التأهيل؟</h2><p>يبدأ التأهيل عادة بمجرد استقرار الحالة وبموافقة الطبيب المعالج. كلما كان البدء أبكر وأكثر انتظاماً كانت فرص التحسّن أفضل.</p>
<h2>على ماذا نعمل؟</h2><ul><li>استعادة الحركة والتحكم في الجانب المتأثر.</li><li>التوازن والمشي وتقليل خطر السقوط.</li><li>الأنشطة اليومية مثل اللبس والأكل والانتقال من السرير.</li><li>الوقاية من التيبّس وآلام الكتف.</li></ul>
<h2>دور الأسرة</h2><p>الأسرة شريك أساسي: نعلّمكم كيف تساعدون المريض بأمان، وكيف تشجعونه على استخدام الجانب المتأثر، ونضع برنامج تمارين يومي يمكن تطبيقه بين الجلسات.</p>
<p class="tip">📌 اطلب الإسعاف فوراً عند ظهور أعراض جلطة جديدة: ميل الوجه، ضعف مفاجئ في الذراع، أو صعوبة في الكلام.</p>`,
    en_html: `<h2>When does rehab start?</h2><p>Usually as soon as the patient is stable and the treating doctor agrees. Starting earlier and keeping it regular gives the best chance of improvement.</p>
<h2>What we work on</h2><ul><li>Movement and control of the affected side.</li><li>Balance and walking, and reducing fall risk.</li><li>Daily activities such as dressing, eating and getting out of bed.</li><li>Preventing stiffness and shoulder pain.</li></ul>
<h2>The family's role</h2><p>The family is a key partner. We show you how to help safely, how to encourage use of the affected side, and set a daily exercise program to follow between sessions.</p>
<p class="tip">📌 Call an ambulance immediately for signs of a new stroke: face drooping, sudden arm weakness or trouble speaking.</p>` },
];
