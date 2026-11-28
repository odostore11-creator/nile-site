// All page content for niletherapy.org. Arabic text is carried over from the old site (same keywords);
// English mirrors it. Paths are the OLD URLs exactly (SEO): never change a path without a redirect plan.
export const SITE = 'https://www.niletherapy.org';
export const CONTACT = {
  phone: '+201022478412', phoneShow: '+20&nbsp;102&nbsp;247&nbsp;8412', wa: '201022478412', email: 'niletherapy.egy@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61579452636995', instagram: 'https://instagram.com/niletherapy.egy', tiktok: 'https://www.tiktok.com/@nile.therapy',
};
export const GA = 'G-R0FRHE75S3';

// Bookable services (the old "online store"): pay cash at the visit.
export const SERVICES = [
  { key: 'home-assessment', path: '/kshf-mnzla-w-jlsh-awla-', price: 800, minutes: 120, img: 'neck-exam',
    ar: { name: 'كشف منزلي وجلسة أولى', short: 'تقييم شامل في بيتك وخطة علاج مخصصة',
      lead: 'كشف منزلي احترافي يشمل تقييم شامل للحركة والألم و الحالة الطبية لتحديد المشكلة بدقة ووضع خطة علاج وبرنامج تأهيلي مخصص',
      body: ['نقدّم خدمة كشف منزلي متكامل في العلاج الطبيعي على يد أخصائيين مؤهلين، تبدأ بدراسة الحالة الطبية والتاريخ المرضي بشكل دقيق، يليها تقييم طبي ووظيفي شامل يشمل الحركة، القوة العضلية، مدى المفاصل، ومستوى الألم باستخدام أدوات تقييم معتمدة. يهدف هذا التقييم إلى الوصول للتشخيص الوظيفي الصحيح وتحديد السبب الجذري للمشكلة، وليس فقط التعامل مع الأعراض.',
        'تشمل الخدمة أيضًا تحليل نمط الحركة والأنشطة اليومية، تقييم عوامل الخطورة، ومراجعة التقارير والفحوصات الطبية إن وجدت، لضمان تكامل الرؤية العلاجية. بناءً على ذلك، يتم وضع خطة علاج وتأهيل مخصصة تناسب حالة كل مريض وأهدافه الوظيفية، مع تحديد واضح لعدد الجلسات، التقنيات المستخدمة، وبرنامج تمارين منزلية مبني على أحدث الممارسات في العلاج الطبيعي.',
        'مناسبة لحالات العظام، الأعصاب، ما بعد العمليات، وكبار السن—مع متابعة مستمرة وتقييم دوري لتطور الحالة، وتعديل الخطة العلاجية لتحقيق أفضل نتائج ممكنة داخل راحة منزلك.'] },
    en: { name: 'Home assessment & first session', short: 'A full assessment at home and a personal treatment plan',
      lead: 'A professional home assessment of movement, pain and your medical condition, to find the exact problem and build a personal treatment and rehabilitation plan.',
      body: ['A qualified physiotherapist comes to your home. We start with your medical history, then a full medical and functional assessment: movement, muscle strength, joint range and pain level, using validated assessment tools. The goal is the right functional diagnosis and the root cause, not just the symptoms.',
        'We also look at how you move in daily life, risk factors, and any reports or scans you have. From this we build a treatment plan around your goals, with a clear number of sessions, the techniques we will use, and a home exercise program based on current best practice.',
        'Suitable for orthopedic and neurological conditions, recovery after surgery, and older adults, with regular follow-up and plan updates for the best possible results at home.'] } },
  { key: 'orthopedic', path: '/jlsat-alalaj-altbyaa-llazam-jrahtha', price: 500, minutes: 60, img: 'ortho',
    ar: { name: 'جلسات العلاج الطبيعي للعظام وجراحتها', short: 'تقليل الألم واستعادة الحركة بعد الإصابات والعمليات',
      lead: 'تقييم وعلاج وتأهيل متكامل لاستعادة الحركة وتقليل الألم وتحسين الوظيفة',
      body: ['نقدّم جلسات علاج طبيعي متخصصة للتعامل مع أمراض العظام، الإصابات المختلفة، وحالات ما بعد الجراحات، على يد أخصائيين مؤهلين. تبدأ الخدمة بدراسة الحالة الطبية والتاريخ المرضي، يليها تقييم طبي ووظيفي شامل يشمل مدى الحركة، القوة العضلية، ومستوى الألم.',
        'تهدف الجلسات إلى تشخيص دقيق للحالة وتحديد السبب الرئيسي للمشكلة، مع تصميم برنامج علاجي وتأهيلي مخصص لكل مريض، سواء للحالات المزمنة، الإصابات الرياضية، أو التأهيل بعد العمليات الجراحية مثل الكسور وتغيير المفاصل وإصلاح الأربطة.',
        'يشمل البرنامج تقنيات علاجية حديثة، تمارين تأهيلية موجهة، وخطة متابعة مستمرة لضمان تحسن الحالة بشكل آمن وفعّال، مع تقديم إرشادات منزلية تساعد على تسريع التعافي واستعادة النشاط اليومي بأفضل كفاءة ممكنة.'] },
    en: { name: 'Orthopedic & post-surgery physiotherapy', short: 'Less pain and better movement after injuries and operations',
      lead: 'Complete assessment, treatment and rehabilitation to restore movement, reduce pain and improve function.',
      body: ['Specialized physiotherapy sessions for bone and joint conditions, injuries and recovery after surgery, delivered by qualified physiotherapists. Every plan starts with your medical history and a full assessment of range of motion, strength and pain.',
        'We find the main cause of the problem and design a program just for you: chronic conditions, sports injuries, or rehabilitation after fractures, joint replacement and ligament repair.',
        'Sessions combine modern techniques, guided exercises and continuous follow-up, plus home guidance to speed up recovery and get you back to daily life safely.'] } },
  { key: 'neuro', path: '/jlsat-alalaj-altbyaa-lamradh-almkh-w-alaasab-w-asabat-alhbl-alshwka-w-jrahthm-', price: 500, minutes: 120, img: 'neuro',
    ar: { name: 'جلسات العلاج الطبيعي لأمراض المخ والأعصاب وإصابات الحبل الشوكي وجراحتهم', short: 'تأهيل عصبي للحركة والتوازن والاستقلالية',
      lead: 'تأهيل عصبي متكامل لتحسين الحركة والتوازن واستعادة الوظائف الحركية بأمان',
      body: ['نقدّم جلسات علاج طبيعي متخصصة في التأهيل العصبي للتعامل مع أمراض المخ والأعصاب، إصابات الحبل الشوكي، وحالات ما بعد الجراحات، على يد أخصائيين مؤهلين. تبدأ الخدمة بدراسة الحالة الطبية والتاريخ المرضي، يليها تقييم طبي ووظيفي شامل يشمل الحركة، التوازن، الإحساس، التناسق العضلي العصبي، ومستوى الاستقلال الوظيفي.',
        'يهدف البرنامج إلى تحسين التحكم الحركي، تقليل التشنجات، زيادة القوة العضلية، واستعادة أكبر قدر ممكن من الوظائف اليومية. يتم تصميم خطة علاج وتأهيل مخصصة لكل حالة، تشمل تقنيات حديثة وتمارين عصبية متدرجة وفقًا لحالة المريض ومرحلة التعافي.',
        'تشمل الجلسات متابعة مستمرة وتقييم دوري لتطور الحالة، مع تعديل الخطة العلاجية بشكل دقيق، بالإضافة إلى إرشادات وتمارين منزلية لدعم التحسن وتسريع التعافي، بما يساعد المريض على تحقيق أفضل مستوى من الاستقلالية وجودة الحياة.'] },
    en: { name: 'Neurological & spinal cord rehabilitation', short: 'Neuro rehab for movement, balance and independence',
      lead: 'Complete neurological rehabilitation to improve movement and balance and safely regain motor function.',
      body: ['Specialized neuro-rehabilitation sessions for brain and nerve conditions, spinal cord injuries and recovery after neurosurgery. We assess movement, balance, sensation, coordination and how independent you are day to day.',
        'The program improves motor control, reduces spasticity, builds strength and restores as much daily function as possible, with progressive neuro exercises matched to your stage of recovery.',
        'Regular reassessment keeps the plan on track, and home exercises support progress between sessions, helping you reach the best possible independence and quality of life.'] } },
];

// The six specialties shown on the home page.
export const SPECIALTIES = [
  { icon: 'brain', ar: ['العلاج الطبيعي لأمراض المخ والأعصاب وإصابات الحبل الشوكي', 'برامج إعادة تأهيل عصبي لتحسين التحكم الحركي، التوازن، والاستقلال الوظيفي بعد الإصابات أو الأمراض العصبية. تعتمد على تدريب عصبي موجّه ومتابعة مستمرة للتقدم.'],
    en: ['Neurology & spinal cord injuries', 'Neuro-rehabilitation to improve motor control, balance and independence after neurological injury or illness, with guided training and continuous progress tracking.'] },
  { icon: 'bone', ar: ['العلاج الطبيعي لأمراض العظام', 'علاج متخصص لتقليل الألم واستعادة الحركة بعد الإصابات أو جراحات العظام باستخدام بروتوكولات عالمية. يركز على تحسين الوظيفة ومنع تكرار الإصابة بأمان.'],
    en: ['Orthopedics', 'Specialized treatment to reduce pain and restore movement after injuries or orthopedic surgery, using international protocols, with a focus on function and preventing re-injury.'] },
  { icon: 'scalpel', ar: ['العلاج الطبيعي بعد و قبل الجراحات', 'تأهيل مدروس لتجهيز الجسم قبل العملية وتسريع التعافي بعدها وتقليل المضاعفات. يساعد على استعادة الحركة والعودة للحياة اليومية بثقة وأمان.'],
    en: ['Before & after surgery', 'Planned rehabilitation that prepares the body before surgery, speeds recovery afterwards and reduces complications, so you return to daily life with confidence.'] },
  { icon: 'home', ar: ['الإقامات المنزلية الفائقة', 'رعاية طبية وتمريضية متكاملة داخل المنزل للحالات التي تحتاج متابعة مستمرة بعد الخروج من المستشفى أو لكبار السن. توفر أمان طبي، متابعة دقيقة، وتقليل مخاطر العدوى مع راحة المريض في بيته.'],
    en: ['Advanced home care', 'Complete medical and nursing care at home for patients who need close follow-up after hospital discharge, and for older adults: safety, careful monitoring and lower infection risk.'] },
  { icon: 'run', ar: ['العلاج الطبيعي للرياضين و الإصابات الرياضية', 'تأهيل متخصص لإصابات الملاعب، تحسين الأداء، والعودة الآمنة للتدريب والمنافسات وفق بروتوكولات رياضية معتمدة. يركز على الوقاية من تكرار الإصابة ورفع الكفاءة البدنية.'],
    en: ['Sports injuries', 'Rehabilitation for sports injuries, better performance and a safe return to training and competition, following accredited sports protocols.'] },
  { icon: 'heart', ar: ['العلاج الطبيعي للحالات الحرجة و الرعاية المركزة', 'تدخل علاجي آمن لدعم التنفس والحركة ومنع مضاعفات الرقود الطويل داخل أو بعد الرعاية المركزة. يساهم في تسريع الاستقرار والتعافي الوظيفي.'],
    en: ['Critical & intensive care', 'Safe therapy that supports breathing and movement and prevents the complications of long bed rest, during or after intensive care.'] },
];

export const TESTIMONIAL = {
  ar: { quote: 'تجربتي مع Nile Therapy كانت فارقة جدًا في رحلتي العلاجية. من أول تقييم حسّيت باهتمام حقيقي وفهم دقيق لحالتي، والخطة العلاجية كانت واضحة ومبنية على أسس علمية. الفريق كان محترف ومتعاون، والتحسّن اللي وصلت له خلال فترة قصيرة خلاني أستعيد ثقتي في الحركة وحياتي اليومية.', who: 'م. ع.، مريض' },
  en: { quote: 'My experience with Nile Therapy made a real difference in my recovery. From the first assessment I felt genuine care and a precise understanding of my condition, and the treatment plan was clear and science-based. The team was professional and supportive, and the progress I made in a short time gave me back my confidence in moving and in daily life.', who: 'M. A., patient' },
};

export const GOVERNORATES = [
  ['Cairo', 'القاهرة'], ['Giza', 'الجيزة'], ['Alexandria', 'الإسكندرية'], ['Qalyubia', 'القليوبية'], ['Sharqia', 'الشرقية'], ['Dakahlia', 'الدقهلية'],
  ['Gharbia', 'الغربية'], ['Monufia', 'المنوفية'], ['Beheira', 'البحيرة'], ['Kafr El Sheikh', 'كفر الشيخ'], ['Damietta', 'دمياط'], ['Port Said', 'بورسعيد'],
  ['Ismailia', 'الإسماعيلية'], ['Suez', 'السويس'], ['Fayoum', 'الفيوم'], ['Beni Suef', 'بني سويف'], ['Minya', 'المنيا'], ['Assiut', 'أسيوط'],
  ['Sohag', 'سوهاج'], ['Qena', 'قنا'], ['Luxor', 'الأقصر'], ['Aswan', 'أسوان'], ['Red Sea', 'البحر الأحمر'], ['New Valley', 'الوادي الجديد'],
  ['Matrouh', 'مطروح'], ['North Sinai', 'شمال سيناء'], ['South Sinai', 'جنوب سيناء'],
];

// Neck pain article (Arabic original, published 30 Aug 2025) and its English version.
export const NECK = {
  date: '2025-08-30',
  ar: { title: 'آلام الرقبة و كيفية التخلص منها',
    lead: 'هل تعاني من آلام في الرقبة بسبب الجلوس الطويل أمام الكمبيوتر أو القيادة لمسافات طويلة؟ في هذا المقال ستجد دليلك المبسط لفهم أسباب ألم الرقبة، متى تحتاج لزيارة دكتور العلاج الطبيعي، وأهم التمارين والنصائح العملية للجلوس والعمل والقيادة والتسوق بدون ألم. اقرأ لتتعلم كيف تحمي رقبتك وتعيش يومك براحة أكثر!',
    html: `<h2>ما هو ألم الرقبة؟</h2><p>ألم الرقبة من أكثر المشاكل شيوعًا التي تصيب الأشخاص في مختلف الأعمار. قد يكون الألم بسيطًا يزول خلال أيام قليلة، أو قد يستمر لفترة أطول ويؤثر على الأنشطة اليومية مثل العمل أو النوم.</p>
<h2>ما هى الأسباب الشائعة؟</h2><ul><li><b>الإجهاد العضلي:</b> نتيجة الجلوس لفترات طويلة أمام الكمبيوتر أو الهاتف.</li><li><b>الوضعيات الخاطئة:</b> مثل الانحناء المستمر أو النوم على وسادة غير مناسبة.</li><li><b>الإصابات:</b> كالحوادث أو التواء الرقبة المفاجئ.</li><li>خشونة الفقرات العنقية أو مشاكل الغضاريف.</li><li>التوتر النفسي الذي يزيد من شدّ عضلات الرقبة.</li></ul>
<h2>الأعراض</h2><ul><li>ألم أو تيبّس في الرقبة.</li><li>صعوبة في تحريك الرأس.</li><li>صداع قد يبدأ من مؤخرة الرأس.</li><li>أحيانًا ألم أو تنميل يمتد إلى الكتف أو الذراع.</li></ul>
<h2>متى يمكن زيارة دكتور العلاج الطبيعي؟</h2><p>يمكنك مراجعة دكتور العلاج الطبيعي في الحالات التالية:</p>
<ul><li><b>الألم المتكرر أو المزمن:</b> إذا استمر الألم لأكثر من أسبوعين إلى 4 أسابيع دون تحسن.</li><li><b>تيبّس أو صعوبة الحركة:</b> عندما تجد صعوبة في إدارة الرأس أو القيام بالأنشطة اليومية بسبب الألم.</li><li><b>الاعتماد المستمر على المسكنات:</b> إذا أصبحت بحاجة لتناول أدوية بشكل دائم لتخفيف الألم.</li><li><b>بعد إصابة أو حادث:</b> مثل التواء الرقبة أو إصابات أثناء الرياضة أو الحوادث المرورية.</li><li><b>أعراض مصاحبة:</b> ألم يمتد إلى الكتف أو الذراع، تنميل أو وخز في اليدين أو الأصابع، ضعف في العضلات.</li><li><b>لأغراض الوقاية والتأهيل:</b> تعلم وضعيات صحيحة للجلوس والنوم والعمل، تمارين لتقوية عضلات الرقبة والكتفين، وبرنامج تدريجي للعودة إلى النشاط أو الرياضة.</li></ul>
<h2>متى يجب مراجعة الطبيب؟</h2><p>اطلب المساعدة الطبية العاجلة إذا كان الألم:</p><ul><li>شديدًا ومفاجئًا.</li><li>مستمرًا لعدة أسابيع دون تحسن.</li><li>مصحوبًا بتنميل أو ضعف في الذراعين أو اليدين.</li><li>نتيجة سقوط أو إصابة قوية.</li></ul>
<h2>وضعية الجلوس الصحيحة أمام الكمبيوتر</h2><p>الجلوس لفترات طويلة أمام الكمبيوتر من أكثر الأسباب شيوعًا لآلام الرقبة والظهر. لذلك من المهم اتباع القواعد التالية كما هو موضح في الصورة:</p>
<figure><img src="{A}img/posture-desk.webp" alt="وضعية الجلوس الصحيحة أمام الكمبيوتر: مستوى الشاشة، المسافة، زوايا المرفقين والركبتين" loading="lazy" width="1200" height="800"></figure>
<ul><li><b>مستوى الشاشة:</b> أعلى الشاشة يكون في مستوى العين أو أسفلها بقليل.</li><li><b>المسافة عن الشاشة:</b> تقريبًا طول ذراع بعيدًا عن الوجه.</li><li><b>الرأس والرقبة:</b> مستقيمة بدون انحناء للأمام.</li><li><b>الظهر:</b> مدعوم بمسند لأسفل الظهر، مع إبقاء الظهر مستقيمًا.</li><li><b>المرفقان:</b> قريبان من الجسم، بزاوية 90°–120°.</li><li><b>المعصمان:</b> في وضع مستقيم مع ثني خفيف فقط.</li><li><b>الكرسي:</b> قابل للتعديل، والمقعد لا يضغط على مؤخرة الركبتين.</li><li><b>الوركان والركبتان:</b> بزاوية 90°–120°.</li><li><b>القدمين:</b> ملامستان للأرض أو مستندتان على دعامة للقدمين.</li><li><b>أدوات العمل:</b> يفضل وجود حامل للوثائق بجانب الشاشة لتقليل حركة الرقبة المتكررة.</li></ul>
<p class="tip">📌 <b>نصيحة:</b> أخذ استراحة قصيرة كل 30–45 دقيقة مع تحريك الرقبة والكتفين يساعد على تنشيط الدورة الدموية وتقليل الألم.</p>
<h2>وضعية الجلوس الصحيحة أثناء القيادة</h2><p>الجلوس لفترات طويلة في السيارة مع انحناء الرقبة أو تقوّس الظهر يسبب إجهاد كبير للعضلات والمفاصل. للحفاظ على راحتك أثناء القيادة:</p>
<ul><li><b>مقعد القيادة:</b> عدّل المقعد بحيث يكون ظهرك مستقيمًا ومسنودًا بالكامل على مسند الظهر، وتجنّب الميل الشديد للأمام أو الاسترخاء الزائد للخلف.</li><li><b>مسند الرأس:</b> يجب أن يكون قريبًا من مؤخرة الرأس (وليس أسفل الرقبة) ليسند الرقبة بشكل جيد.</li><li><b>المقود:</b> اضبطه بحيث يكون قريبًا من جسمك بدرجة تسمح بثني المرفقين بزاوية مريحة (حوالي 120°)، وتجنّب مدّ الذراعين بشكل كامل لفترات طويلة.</li><li><b>الركبتان والقدمان:</b> يجب أن تكون الركبتان مثنيتين قليلاً (حوالي 120°) مع القدرة على الضغط على الدواسات دون شد زائد، والكعب يلامس أرضية السيارة.</li><li><b>فترات الاستراحة:</b> إذا كنت تقود لمسافات طويلة، توقّف كل ساعة تقريبًا لتمديد الرقبة والظهر وتحريك الكتفين.</li><li><b>النظر للأمام:</b> اجعل مستوى النظر مستقيمًا للأمام لتقليل إجهاد الرقبة، وتجنّب الانحناء للأمام عند القيادة.</li></ul>
<p class="tip">📌 <b>الخلاصة:</b> الوضعية الصحيحة في السيارة هي أن يكون ظهرك مسنودًا، رقبتك مستقيمة، وذراعاك ورجلاك في وضع مريح. هذا يقلل من آلام الرقبة والظهر خاصة في الرحلات الطويلة.</p>
<h2>التمرينات المنزلية لتخفيف آلام الرقبة</h2><p>القيام بتمارين بسيطة في البيت يساعد على تقليل الألم، تحسين مرونة الرقبة، ومنع تكرار المشكلة. يفضل أداء التمارين يوميًا 1–2 مرة، مع التوقف إذا ظهر ألم شديد. اطلب من أخصائي العلاج الطبيعي برنامج تمارين مناسب لحالتك.</p>` },
  en: { title: 'Neck Pain: Causes, Treatment and Posture Tips',
    lead: 'Neck pain from long hours at a computer or long drives? A simple guide to what causes it, when to see a physiotherapist, and how to sit, work and drive without pain.',
    html: `<h2>What is neck pain?</h2><p>Neck pain is one of the most common problems at any age. It can be mild and pass within a few days, or last longer and get in the way of work and sleep.</p>
<h2>Common causes</h2><ul><li><b>Muscle strain</b> from long hours at a computer or phone.</li><li><b>Poor posture</b>, such as constant bending forward or the wrong pillow.</li><li><b>Injuries</b>, like accidents or a sudden twist.</li><li>Wear of the neck vertebrae or disc problems.</li><li>Stress, which tightens the neck muscles.</li></ul>
<h2>Symptoms</h2><ul><li>Pain or stiffness in the neck.</li><li>Difficulty turning the head.</li><li>Headache starting at the back of the head.</li><li>Sometimes pain or numbness spreading to the shoulder or arm.</li></ul>
<h2>When to see a physiotherapist</h2><ul><li><b>Recurring or chronic pain</b> that hasn't improved in 2–4 weeks.</li><li><b>Stiffness</b> that makes it hard to turn your head or do daily tasks.</li><li><b>Relying on painkillers</b> to get through the day.</li><li><b>After an injury</b>: a sprain, a sports injury or a car accident.</li><li><b>Other symptoms</b>: pain into the shoulder or arm, tingling in the hands, muscle weakness.</li><li><b>Prevention</b>: learn good posture, strengthen the neck and shoulders, and return to sport gradually.</li></ul>
<h2>When to see a doctor urgently</h2><p>Get medical help quickly if the pain is sudden and severe, lasts for weeks without improving, comes with numbness or weakness in the arms or hands, or follows a fall or a hard injury.</p>
<h2>Sitting at a computer</h2><figure><img src="{A}img/posture-desk.webp" alt="Correct sitting posture at a desk: screen height, distance, elbow and knee angles" loading="lazy" width="1200" height="800"></figure>
<ul><li><b>Screen:</b> top of the screen at or slightly below eye level, about an arm's length away.</li><li><b>Head and neck:</b> straight, not leaning forward.</li><li><b>Back:</b> supported at the lower back.</li><li><b>Elbows:</b> close to the body at 90°–120°; wrists straight.</li><li><b>Chair:</b> adjustable; the seat shouldn't press behind the knees. Hips and knees at 90°–120°, feet flat or on a footrest.</li></ul>
<p class="tip">📌 <b>Tip:</b> take a short break every 30–45 minutes and move your neck and shoulders.</p>
<h2>Driving posture</h2><ul><li>Sit upright with your back fully supported.</li><li>Headrest close to the back of your head, not below the neck.</li><li>Steering wheel close enough to keep elbows bent at about 120°.</li><li>Knees slightly bent; heels resting on the floor.</li><li>On long drives, stop about every hour to stretch.</li></ul>
<h2>Home exercises</h2><p>Simple daily exercises (1–2 times a day) reduce pain, improve flexibility and prevent the problem coming back. Stop if you feel sharp pain, and ask your physiotherapist for a program that fits your condition.</p>` },
};
